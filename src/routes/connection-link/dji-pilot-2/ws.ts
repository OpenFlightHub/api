import express from 'express';
import ws from 'ws'
import TrafficSensing, { SensingHandle } from '../../../aircraft_sensing/TrafficSensing';
import { getCore } from '../../../core';
const trafficSense : TrafficSensing = global.trafficSense

if(!trafficSense){
    //TODO move trafficSenso to geoobjects module throw new Error('missing global trafficSense')
}

const router = express.Router()

const DRONE_SENSING_RADIUS_ON_MAP = 1000 * 50

const connectedDjiPilot2Clients = new Map<number /* connectionId */, {
    ws: ws.WebSocket
    droneSensingHandle?: SensingHandle,
    existingMapElementIds: string[]
}>()

//TODO fix this dirty hack (used in connector/dji-pilot-2/index.ts)
global.sendToConnection = sendToConnection

router.ws('/', (ws: ws.WebSocket, req) => {//TODO implement deny handshake when user is not authenticated (right now we open the connection, then check, then close) https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketserveroptions-callback https://github.com/websockets/ws/issues/377 https://github.com/expressjs/express/issues/2556

    req.GM.guardDjiPilot2ApiWebsocketIsAuthenticated().then(connection=>{

        console.log('/dji-pilot-2 ws connectionId' + connection.id, 'has connected to workspace', connection.workspace_id)

        connectedDjiPilot2Clients.set(connection.id, {
            ws,
            existingMapElementIds: []
        })

        ws.on('message', (data, isBinary)=>{
            if(isBinary){
                console.error('unexpectedly received binary data from websocket', connection.id, data)
            } else {
                const dataString = data.toString()

                if(dataString === 'ping'){
                    //TODO should we respond with "pong" ? ws.send("pong")

                    ws.send('ping')// if we dont respond with ping or pong, webcsocket closes with code 4000

                    return
                }

                let parsed

                try {
                    parsed = JSON.parse(dataString)
                } catch (err){
                    console.error('failed to parse ws message', connection.id, dataString, err)
                }

                try {
                    handleMessage(ws, connection.id, parsed)
                } catch (err){
                    console.error('failed ws handleMessage()', connection.id, err)
                }
            }
        })

        ws.on('error', (err)=>{
            console.log('dji pilot 2 ws error', err)
        })

        ws.on('close', (code, reason)=>{
            console.log('dji pilot 2 ws has closed for workspace', connection.workspace_id, code, reason.toString())

            const existingClient = connectedDjiPilot2Clients.get(connection.id)

            if(!existingClient){
                return
            }

            if(existingClient.droneSensingHandle){
                existingClient.droneSensingHandle.stop()
            }

            connectedDjiPilot2Clients.delete(connection.id)
        })

        //TODO also implement sensing for position of remote controller
        if(typeof connection.last_drone_id === 'number'){
            getCore().modules.drone.getLastPositionOfDrone(connection.last_drone_id).then(lastDronePosition => {
                if(lastDronePosition === false){
                    console.warn('did not start traffic sensing, drone has no last position', connection)//TODO we should update the traffic sensing area when we receive a new position from the drone
                } else {
                    const handle = trafficSense.startSensing(lastDronePosition.latitude, lastDronePosition.longitude, DRONE_SENSING_RADIUS_ON_MAP)

                    const theConnectedClient = connectedDjiPilot2Clients.get(connection.id)

                    if(!theConnectedClient){
                        return
                    }

                    theConnectedClient.droneSensingHandle = handle


                    //TODO implement removing existing map element ids after we havent received an update for a long time

                    handle.addListener('traffic', trafficData=>{



                        const existsAlready = theConnectedClient.existingMapElementIds.includes(trafficData.id)

                        ws.send(JSON.stringify({
                            biz_code: existsAlready ? 'map_element_update' : 'map_element_create',
                            version: '1.0',
                            timestamp: Date.now(),
                            data: {
                                group_id: connection.workspace_uuid,
                                id: trafficData.id,
                                name: trafficData.name,
                                resource: {
                                    type: 0,
                                    user_name: 'OpenFlightHub Server',
                                    content: {
                                        type: 'Feature',
                                        properties: {
                                            color: '#0091FF'
                                        },
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [trafficData.position.longitude, trafficData.position.latitude, trafficData.position.height]
                                        }
                                    }
                                }
                            }
                        }))

                        if(!existsAlready){
                            theConnectedClient.existingMapElementIds.push(trafficData.id)
                        }
                    })

                    console.log('done with setting up traffic map markers for dji pilot 2 ws', connection)
                }
            }).catch(err => {
                console.error('failed to get last position of drone in order to set up traffic sensing', err)
            })
        } else {
            console.warn('did not start traffic sensing, connection has no last_drone_id', connection)
        }

        //force update of topology
        ws.send(JSON.stringify({
            biz_code: 'device_update_topo',
            version: '1.0',
            timestamp: Date.now(),
            data: {}
        }))


        //TODO remove this testing code

        setInterval(()=>{

            if(ws.readyState === ws.OPEN){

                ws.send(JSON.stringify({
                    biz_code: 'device_osd',
                    version: '1.0',
                    timestamp: Date.now(),
                    data: {
                        sn: 'SN#TEST-SIT-AWARE-HOST',
                        host: {
                            latitude: 47.591146,
                            longitude: 9.76875,
                            height: 700,
                            elevation: 200,
                            attitude_head: 45,
                            horizontal_speed: 5,
                            vertical_speed: 1
                        }
                    }
                }))

                ws.send(JSON.stringify({
                    biz_code: 'device_osd',
                    version: '1.0',
                    timestamp: Date.now(),
                    data: {
                        sn: 'SN#TEST-SIT-AWARE-PARENT',
                        host: {
                            latitude: 47.595146,
                            longitude: 9.76275,
                            height: 500,
                            elevation: 0,
                            attitude_head: 45,
                            horizontal_speed: 0,
                            vertical_speed: 0
                        }
                    }
                }))

            }

        }, 1000 * 1)

    }).catch(()=>{
        ws.close(4001, 'Unauthorized')
    })
})

function handleMessage(ws: ws.WebSocket, connectionId: number, data: any){
    console.warn('received unexpected message from dji pilot 2 ws client', connectionId, data)
}

/**
 * @param messageData will be stringified as json
 * @returns false if no client for this connectionId is connected
 */
export function sendToConnection(connectionId: number, messageData: object): boolean {
    const client = connectedDjiPilot2Clients.get(connectionId)

    if(typeof client === 'undefined'){
       return false
    }

    client.ws.send(JSON.stringify(messageData))
}

export default router
