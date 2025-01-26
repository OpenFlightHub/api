import { Request } from 'express';
import * as ws from 'ws';
import { userHasPermissionForWorkspace } from '../util/user';
import { selectDrone } from '../db/DBHelpers';
import { getConnectionForDrone } from '../util/connection';
import { DBType_User } from '../db/DBTypes';
import * as pgp from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { getLastPositionOfDrone } from '../util/drone';
import * as server_to_client from './definitions/server_to_client'
import * as client_to_server from './definitions/client_to_server'

type ClientData = {
    id: ClientId
    userId: number
    ws: ws.WebSocket
    messageIdCounter: number
    subscribedEvents: Map<server_to_client.Message_Type_Event_Type, EventFilter[]>
}

type EventFilter = string
const eventListeners = new Map<server_to_client.Message_Type_Event_Type, Map<EventFilter, ClientData[]>>()

type ClientId = number
let clientIdCounter: ClientId = 1
const clients: ClientData[] = []


export function handleNewClient(ws: ws.WebSocket, req: Request, user: DBType_User){

    const myClientId = clientIdCounter++

    const myClient = {
        id: myClientId,
        userId: user.id,
        ws,
        subscribedEvents: new Map<server_to_client.Message_Type_Event_Type, EventFilter[]>(),
        messageIdCounter: 0
    }

    addClient(myClient)

    ws.on('message', async (msg, isBinary) => {

        if(isBinary){
            sendErrorToClient(myClient, 'can not handle binary message')
            return
        }

        if(!isBinary && msg.toString() === 'keep-alive'){
            return
        }

        let messageWithoutType: any

        try {

            messageWithoutType = JSON.parse(msg.toString())

        } catch (ex) {
            sendErrorToClient(myClient, 'can not parse msg JSON: ' + ex)
            return
        }

        if(typeof messageWithoutType !== 'object'){
            sendErrorToClient(myClient, 'invalid message')
            return
        }

        if(typeof messageWithoutType.messageId !== 'number'){
            sendErrorToClient(myClient, 'invalid messageId: ' + messageWithoutType.messageId)
            return
        }

        if(typeof messageWithoutType.type !== 'string'){
            sendErrorToClient(myClient, 'invalid type: ' + messageWithoutType.type)
            return
        }

        switch((messageWithoutType as client_to_server.Message<client_to_server.Message_Type>).type){
            case 'subscribe': {
                const message = messageWithoutType as client_to_server.Message<'subscribe'>

                if(typeof message.data !== 'object' || typeof message.data.event !== 'string' || typeof message.data.filter !== 'string'){
                    rejectClientMessage(myClient, message, 'invalid listen data')
                    return
                }

                switch(message.data.event){
                    case 'db_row_update': {

                        const match = message.data.filter.match(/([a-zA-Z_]+)\.(\d+)/)

                        if(!match){
                            rejectClientMessage(myClient, message, 'invalid filter: ' + message.data.filter)
                            return
                        }

                        const table = match[1]
                        const id = parseInt(match[2])

                        //TODO check if table is supported
                        //TODO permission check

                        if(isNaN(id) || id < 0){
                            rejectClientMessage(myClient, message, 'invalid filter [id]: ' + id)
                            return
                        }

                        addListener('db_row_update', table + '.' + id, myClient)

                        resolveClientMessage(myClient, message)

                        break;
                    }

                    case 'drone': {

                        const match = message.data.filter.match(/(\d+)/)

                        if(!match){
                            rejectClientMessage(myClient, message, 'invalid filter: ' + message.data.filter)
                            return
                        }

                        const id = parseInt(match[1])

                        if(isNaN(id) || id < 0){
                            rejectClientMessage(myClient, message, 'invalid filter: ' + id)
                            return
                        }

                        const drone = await selectDrone(id)

                        const connection = await getConnectionForDrone(drone.id)

                        const hasPermission = await userHasPermissionForWorkspace((await req.GM.getCurrentUser()).id, connection.workspace_id)

                        if(!hasPermission){
                            rejectClientMessage(myClient, message, 'Permission denied')
                            return
                        }

                        addListener('drone', '' + id, myClient)

                        resolveClientMessage(myClient, message)

                        break;
                    }

                    default: {
                        rejectClientMessage(myClient, message, 'unsupported event type: ' + message.data.event)
                        return
                    }
                }

            } break

            case 'error': {
                console.log('client reported error via websocket', messageWithoutType.data)
            }

            case 'answer': {
                // not implemented yet
            }

            default: {
                rejectClientMessage(myClient, messageWithoutType, 'invalid message type: ' + messageWithoutType.type)
                return
            }
        }
    })

    ws.on('close', ()=>{
        removeClient(myClient)
    })
}

function sendToClient<T extends server_to_client.Message_Type>(client: ClientData, type: T, data: server_to_client.Message_Data<T>, overwriteMessageId?: number){
    const msg: server_to_client.Message<T> = {
        type,
        data,
        messageId: overwriteMessageId || (++client.messageIdCounter)
    }

    client.ws.send(JSON.stringify(msg))
}

function sendErrorToClient(client: ClientData, errorMessage: string){
    sendToClient(client, 'error', errorMessage)
}

function answerClientMessage<T extends client_to_server.Message_Type>(client: ClientData, originalMessage: client_to_server.Message<T>, success: boolean, result?: any){
    sendToClient(client, 'answer', {
        success,
        result
    }, originalMessage.messageId)
}

function resolveClientMessage<T extends client_to_server.Message_Type>(client: ClientData, originalMessage: client_to_server.Message<T>, result?: string){
    answerClientMessage(client, originalMessage, true, result)
}

function rejectClientMessage<T extends client_to_server.Message_Type>(client: ClientData, originalMessage: client_to_server.Message<T>, error: string){
    answerClientMessage(client, originalMessage, false, error)
}

function addClient(client: ClientData){
    clients.push(client)
}

function removeClient(client: ClientData){
    // remove from clients and listeners
    const clientIndex = clients.indexOf(client)

    if(clientIndex < 0){
        return
    }

    for(const entry of clients[clientIndex].subscribedEvents){

        const event = entry[0]
        const filters = entry[1]


        for(const filter of filters){
            removeListener(event, filter, client)
        }
    }

    clients.splice(clientIndex, 1)
}

// see close codes: https://learn.microsoft.com/en-us/dotnet/api/system.net.websockets.websocketclosestatus?view=net-8.0
function kickClient(client: ClientData, reason?: string){
    client.ws.close(4000, reason)
    removeClient(client)
}


function addListener(event: server_to_client.Message_Type_Event_Type, filter: EventFilter, client: ClientData){

    let filters = eventListeners.get(event)

    if(!filters){
        const n = new Map<string, ClientData[]>()
        eventListeners.set(event, n)
        filters = n
    }

    let clients = filters.get(filter)

    if(!clients){
        const n = []
        filters.set(filter, n)
        clients = n
    }

    if(!clients.includes(client)){
        clients.push(client)
    }
}

function removeListener(event: server_to_client.Message_Type_Event_Type, filter: EventFilter, client: ClientData){

    const filters = eventListeners.get(event)

    if(filters){

        const clients = filters.get(filter)

        if(clients){

            const index = clients.indexOf(client)

            if(index >= 0){
                clients.splice(index, 1)
            }
        }
    }
}

/**
 * @see triggerListenerIfExists() if you only want to execute some code if there really is at least one listener
 */
function triggerListener<T extends server_to_client.Message_Type_Event_Type>(event: T, filter: EventFilter, data: server_to_client.Message_Type_Event_Object_Data<T>){
    const filters = eventListeners.get(event)

    if(filters){

        const clients = filters.get(filter)

        if(clients){
            for(const client of clients){
                sendToClient(client, 'event', {
                    event,
                    filter,
                    eventData: data
                })
            }
        }
    }
}

/**
 *
 * @param callback will be executed only if at least one listener for this event and filter exists. The returned data of this callback will be sent to all the listeners
 * @see triggerListener()
 */
function triggerListenerIfExists<
    T extends server_to_client.Message_Type_Event_Type,
    CR = server_to_client.Message_Type_Event_Object_Data<T> | Promise<server_to_client.Message_Type_Event_Object_Data<T>>>(event: T, filter: EventFilter, callback: () => CR): CR extends Promise<void> ? Promise<void> : void {
    const filters = eventListeners.get(event)

    if(filters){

        const clients = filters.get(filter)

        if(clients){

            const result = callback()

            if(result instanceof Promise){
                //@ts-ignore
                return new Promise<void>((resolve, reject)=>{
                    result.then(res => {

                        for(const client of clients){
                            sendToClient(client, 'event', {
                                event,
                                filter,
                                eventData: res as server_to_client.Message_Type_Event_Object_Data<T>
                            })
                        }

                    }).catch(reject)
                })
            } else {
                for(const client of clients){
                    sendToClient(client, 'event', {
                        event,
                        filter,
                        eventData: result as server_to_client.Message_Type_Event_Object_Data<T>
                    })
                }
            }
        }
    }
}

export function forceLogoutUser(userId: number){

    for(const client of clients){
        if(client.userId === userId){
            kickClient(client, 'logout')
        }
    }
}

export async function setupDatabaseNotifications(sco: pgp.IConnected<{}, pg.IClient>){

    sco.client.on('notification', async (data) => {

        //console.log('notification', data)
        //console.log('listeners', JSON.stringify(listeners))

        const channel = data.channel

        switch(channel){
            case 'notify_change': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const changedId : string = '' + parsed.id

                const filter = changedTable + '.' + changedId

                triggerListener('db_row_update', filter, {
                    table: changedTable,
                    id: changedId
                })

                break;
            }

            case 'notify_insert': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table

                if(changedTable === 'drone_data'){
                    const changedDroneId = parseInt(parsed.data.drone_id)

                    const filter = '' + changedDroneId


                    triggerListenerIfExists('drone', filter, async()=>{

                        const droneLastPosition = await getLastPositionOfDrone(changedDroneId)

                        return {
                            id: changedDroneId,
                            position: droneLastPosition
                        }
                    })
                }
            }
        }

    })

    await sco.none('LISTEN $1:name', 'notify_change')
    await sco.none('LISTEN $1:name', 'notify_insert')
}

