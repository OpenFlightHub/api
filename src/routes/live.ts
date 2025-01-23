import * as express from 'express';
import * as ws from "ws";
import { userHasPermissionForWorkspace } from '../util/user';
import { selectConnection, selectDrone, selectDroneData } from '../db/DBHelpers';
import { getConnectionForDrone } from '../util/connection';
import { DBType_DroneData } from '../db/DBTypes';
import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import pg = require('pg-promise/typescript/pg-subset');
import { DRONE_DATA_TYPES, getLastPositionOfDrone } from '../util/drone';

let messageIdCounter = 1


type ListenerTableName = string
type ListenerIdAsString = string
const listeners = new Map<ListenerTableName, Map<ListenerIdAsString, ClientId[]>>()

type SubscriptionDroneId = number
const subscribersLiveDrone = new Map<SubscriptionDroneId, ClientId[]>()

type ClientId = number
let clientIdCounter: ClientId = 1
const clients: {
    id: ClientId
    userId: number
    ws: ws.WebSocket
    listeners: Map<ListenerTableName, ListenerIdAsString[]>
    subscribers: SubscriptionDroneId[]
}[] = []

//TODO hidden fields like session.result_attachment_set_id will also trigger a change event, but the api data will still be the same (because that field is hidden)
//TODO on the other side, adding a result attachment will not trigger a change but it should ...

const router = express.Router()

router.ws('/', (ws: ws.WebSocket, req) => {//TODO implement deny handshake when user is not authenticated (right now we open the connection, then check, then close) https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketserveroptions-callback https://github.com/websockets/ws/issues/377 https://github.com/expressjs/express/issues/2556

    const clientId = clientIdCounter++


    req.GM.guardUserIsAuthenticated().then(user=>{//TODO check permissions

        clients.push({
            id: clientId,
            userId: user.id,
            ws,
            listeners: new Map<ListenerTableName, ListenerIdAsString[]>(),
            subscribers: []
        })

        ws.on('message', async (msg, isBinary) => {

            if(isBinary){
                sendErrorToWebSocket(ws, 'can not handle binary message')
                return
            }

            if(!isBinary && msg.toString() === 'keep-alive'){
                return
            }

            let parsed: WebSocketMessageClient

            try {

                parsed = JSON.parse(msg.toString())

            } catch (ex) {
                sendErrorToWebSocket(ws, 'can not parse msg JSON: ' + ex)
                return
            }

            if(typeof parsed.messageId !== 'number'){
                sendErrorToWebSocket(ws, 'invalid messageId: ' + parsed.messageId)
                return
            }

            switch(parsed.type){
                case 'listen': {
                    if(typeof parsed.data !== 'object' || typeof parsed.data.table !== 'string' || typeof parsed.data.id !== 'number'){
                        rejectWebSocketMessage(ws, parsed, 'invalid listen data')
                        return
                    }

                    const tableName : string = parsed.data.table
                    const id : string = '' + parsed.data.id

                    //TODO check if table is supported
                    //TODO permission check

                    // add to client
                    for(const client of clients){
                        if(client.id === clientId){
                            if(!client.listeners.has(tableName)){
                                client.listeners.set(tableName, [])
                            }

                            if(client.listeners.get(tableName).indexOf(id) === -1){
                                client.listeners.get(tableName).push(id)
                            }
                        }
                    }

                    //add to listeners
                    if(!listeners.has(tableName)){
                        listeners.set(tableName, new Map<ListenerIdAsString, ClientId[]>())
                    }

                    if(!listeners.get(tableName).has(id)){
                        listeners.get(tableName).set(id, [])
                    }

                    if(listeners.get(tableName).get(id).indexOf(clientId) === -1){
                        listeners.get(tableName).get(id).push(clientId)
                    }

                    console.log('added listen for', tableName, id)

                    resolveWebSocketMessage(ws, parsed)

                } break


                case 'subscribe-live-drone': {

                    const droneId = parsed.data.drone_id

                    try {

                        const drone = await selectDrone(droneId)

                        const connection = await getConnectionForDrone(drone.id)

                        const hasPermission = await userHasPermissionForWorkspace((await req.GM.getCurrentUser()).id, connection.workspace_id)

                        if(!hasPermission){
                            rejectWebSocketMessage(ws, parsed, '403: Permission denied')
                            return
                        }

                        // add to client
                        for(const client of clients){
                            if(client.id === clientId){

                                if(client.subscribers.indexOf(droneId) === -1){
                                    client.subscribers.push(droneId)
                                }
                            }
                        }

                        // add to subscribers

                        if(!subscribersLiveDrone.has(droneId)){
                            subscribersLiveDrone.set(droneId, [])
                        }

                        subscribersLiveDrone.get(droneId).push(clientId)

                        resolveWebSocketMessage(ws, parsed)
                    } catch(err) {
                        console.error(err)
                        rejectWebSocketMessage(ws, parsed, 'unexpected error')
                    }
                }

                default: {
                    rejectWebSocketMessage(ws, parsed, 'invalid message type: ' + parsed.type)
                    return
                }
            }
        })

        ws.on('close', ()=>{
            removeClient(clientId)
        })

    }).catch(()=>{
        ws.close(4001, 'Unauthorized')
    })
})

type WebSocketMessageClient = {
    type: WebSocketMessageTypeClient
    data: any
    messageId: number
}

type WebSocketMessageTypeClient = 'listen' | 'subscribe-live-drone'

type WebSocketMessageServer = {
    type: WebSocketMessageTypeServer
    data: any
    messageId: number
}

type WebSocketMessageTypeServer = 'error' | 'answer' | 'notify_change' | 'info' | 'live_drone'

function sendToWebSocket(ws: ws.WebSocket, type: WebSocketMessageTypeServer, data: any, overwriteMessageId?: number){
    ws.send(JSON.stringify({
        type,
        data,
        messageId: overwriteMessageId || messageIdCounter++
    }))
}

function sendErrorToWebSocket(ws: ws.WebSocket, errorMessage: string){
    sendToWebSocket(ws, 'error', errorMessage)
}

function resolveWebSocketMessage(ws, originalMessage: WebSocketMessageClient, data?: any){
    sendToWebSocket(ws, 'answer', {
        success: true,
        data
    }, originalMessage.messageId)
}

function rejectWebSocketMessage(ws, originalMessage: WebSocketMessageClient, error: any){
    sendToWebSocket(ws, 'answer', {
        success: false,
        error
    }, originalMessage.messageId)
}

function removeClient(clientId: number){
    // remove from clients and listeners
    const indexClient = clients.findIndex(client => client.id === clientId)

    if(indexClient < 0){
        return
    }

    for(const entry of clients[indexClient].listeners.entries()){

        const tableName = entry[0]
        const ids = entry[1]

        for(const id of ids){
            const idMap = listeners.get(tableName).get(id)
            const indexListener = idMap.indexOf(clientId)
            idMap.splice(indexListener, 1)
        }
    }

    for(const droneId of clients[indexClient].subscribers){
        const idMap = subscribersLiveDrone.get(droneId)
        const indexListener = idMap.indexOf(clientId)
        idMap.splice(indexListener, 1)
    }

    clients.splice(indexClient, 1)
}

// see close codes: https://learn.microsoft.com/en-us/dotnet/api/system.net.websockets.websocketclosestatus?view=net-8.0
function kickClient(clientId: number, reason?: string){

    const client = clients.find(client => client.id === clientId)

    if(client){
        client.ws.close(4000, reason)
        removeClient(client.id)
    }
}

async function setupNotifications(sco: pgp.IConnected<{}, pg.IClient>){

    sco.client.on('notification', async (data) => {

        //console.log('notification', data)
        //console.log('listeners', JSON.stringify(listeners))

        const channel = data.channel

        switch(channel){
            case 'notify_change': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const changedId : string = '' + parsed.id

                for(const entry of listeners.entries()){
                    const tableName = entry[0]


                    if(tableName !== changedTable){
                        continue
                    }

                    const ids = entry[1]

                    for(const idEntry of ids.entries()){
                        if(idEntry[0] !== changedId){
                            continue
                        }

                        for(const clientId of idEntry[1]){
                            console.log('notifying client', clientId, changedTable, changedId)
                            sendToWebSocket(clients.find(c => c.id === clientId).ws, 'notify_change', {
                                table: changedTable,
                                id: changedId
                            })
                        }
                    }
                }

                break;
            }

            case 'notify_insert': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const newId : string = '' + parsed.id

                if(changedTable === 'drone_data'){
                    const changedDroneId = parseInt(parsed.data.drone_id)

                    if(subscribersLiveDrone.has(changedDroneId)){

                        const droneLastPosition = await getLastPositionOfDrone(changedDroneId)

                        for(const clientId of subscribersLiveDrone.get(changedDroneId)){
                            console.log('live drone to client', clientId, changedTable, newId)

                            const client = clients.find(c => c.id === clientId)

                            if(client){
                                sendToWebSocket(client.ws, 'live_drone', {
                                    id: changedDroneId,
                                    position: droneLastPosition
                                })
                            }
                        }
                    }
                }
            }
        }

    })

    await sco.none('LISTEN $1:name', 'notify_change')
    await sco.none('LISTEN $1:name', 'notify_insert')
}

function forceLogoutUser(userId: number){

    for(const client of clients){
        if(client.userId === userId){
            kickClient(client.id, 'logout')
        }
    }
}

export default {
    router,
    setupNotifications,
    forceLogoutUser
}
