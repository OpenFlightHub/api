import express from 'express';
import ws from 'ws'
import pgp from 'pg-promise'
import { ApiType_ConnectionLinkDjiPilot2SdkConfig } from '../../../definitions/ApiTypes';
import { ApiSchema_ConnectionLinkDjiPilot2SdkConfig } from '../../../definitions/ApiSchemas';
import { connectionLinkAuthMiddleware } from '..';
import { handleNewClient } from '../../../live-websocket/websocket';
import { DBType_Connection } from '../../../db/DBTypes';
import { randomUUID } from 'crypto';
const db : pgp.IDatabase<any> = global.db

const router = express.Router()

router.ws('/', (ws: ws.WebSocket, req) => {//TODO implement deny handshake when user is not authenticated (right now we open the connection, then check, then close) https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketserveroptions-callback https://github.com/websockets/ws/issues/377 https://github.com/expressjs/express/issues/2556

    req.GM.guardDjiPilot2ApiWebsocketIsAuthenticated().then(connection=>{

        console.log('/dji-pilot-2 ws has connected to workspace', connection.workspace_id)

        ws.on('message', (data, isBinary)=>{
            if(isBinary){
                console.error('unexpectedly received binary data from websocket', connection.id, data)
            } else {
                const dataString = data.toString()

                if(dataString === 'ping'){
                    console.log('got ping')
                    //TODO should we respond with "pong" ? ws.send("pong")

                    ws.send('ping')// if we dont respond with ping or pong, webcoskcet closes with code 4000

                    // setTimeout(()=>{

                    //     console.log('sending map element create')

                    //     ws.send(JSON.stringify({
                    //         "biz_code":"map_element_create",
                    //         "version":"1.0",
                    //         "timestamp": Date.now(),
                    //         "data":{
                    //             "group_id":"group_test",
                    //             "id": "508969b6-95dd-4198-b6d6-4b5d7e924514",
                    //             "name": "Test Map Element",
                    //             "resource":{
                    //                 "user_name": "API Test",
                    //                 "content":{
                    //                     "type":"Feature",
                    //                     "properties":{
                    //                         "color":"#212121"
                    //                     },
                    //                     "geometry":{
                    //                         "type":"LineString",
                    //                         "coordinates":[
                    //                             [
                    //                                 -114.59526255248164,
                    //                                 44.52039593722584
                    //                             ],
                    //                             [
                    //                                 -96.91234166804537,
                    //                                 47.39200791922252
                    //                             ],
                    //                             [
                    //                                 -101.53652432009943,
                    //                                 39.10142503321269
                    //                             ]
                    //                         ]
                    //                     }
                    //                 },
                    //                 "type": 0
                    //             }
                    //         }
                    //     }), (err)=>{
                    //         if(err){
                    //             console.error('failed to send to client', err)
                    //         }
                    //     })
                    // }, 1000)

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
        })

    }).catch(()=>{
        ws.close(4001, 'Unauthorized')
    })
})

function handleMessage(ws: ws.WebSocket, connectionId: number, data: any){
    if(typeof data.biz_code !== 'string'){
        throw new Error('property .biz_code invalid: ' + data.biz_code)
    }


    switch(data.biz_code as string){
        case 'map_element_create': {
            //TODO
        }; break;

        case 'map_element_delete': {
            //TODO
        }; break;

        case 'map_element_update': {
            //TODO
        }; break;

        case 'map_group_refresh': {
            //TODO
        }; break;

        default: {
            throw new Error('unsupported biz_code: ' + data.biz_code)
        }
    }
}

export default router
