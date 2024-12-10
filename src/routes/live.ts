import * as express from 'express';
import * as ws from "ws";
import * as pgp from 'pg-promise'
import pg = require('pg-promise/typescript/pg-subset');

let messageIdCounter = 1


type ListenerTableName = string
type ListenerIdAsString = string
type ListenerClientId = number
const listeners = new Map<String, Map<String, Number[]>>()

let clientIdCounter = 1
const clients: {id: number, userId: number, ws: ws.WebSocket, listeners: Map<String, String[]>}[] = []

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
            listeners: new Map<String, String[]>()
        })

        ws.on('message', (msg, isBinary) => {

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

                    // add to clients
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
                        listeners.set(tableName, new Map<String, Number[]>())
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

type WebSocketMessageTypeClient = 'listen'

type WebSocketMessageServer = {
    type: WebSocketMessageTypeServer
    data: any
    messageId: number
}

type WebSocketMessageTypeServer = 'error' | 'answer' | 'notify_change' | 'info'

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

    sco.client.on('notification', data => {

        console.log('notification', data)
        console.log('listeners', JSON.stringify(listeners))

        const channel = data.channel

        if(channel !== 'notify_change'){
            return
        }

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

    })

    await sco.none('LISTEN $1:name', 'notify_change')
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
