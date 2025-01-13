import { Client, PublishPacket } from "aedes";
import Connector from "./Connector";
import Logger from "./ConnectorLogger";
import path from "path";
import {addDroneData, DRONE_DATA_TYPES} from '../../util/drone'
import {addRemoteControllerData, REMOTE_CONTROLLER_DATA_TYPES} from '../../util/remote_controller'
import {thing_product_osd_Mavic_3_T} from './mqtt-types/auto_detected'
import * as pgp from 'pg-promise'
import { DBType_Connection, DBType_RemoteController_TYPES } from "../../db/DBTypes";
import { insertDrone, insertRemoteController, selectConnection, updateConnection } from "../../db/DBHelpers";
const db : pgp.IDatabase<any> = global.db

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log('onMessage_State', connectionId, message)

    //TODO save live_capacity information of rc (and use that to determine if rc can do livestreaming)
    //TODO website on rc needs to reqest aircraft and rc serial number, send to server so it can identify rc and drone by serial number
})


connector.onMessage_Status((connectionId, message, respond)=>{
    console.log('onMessage_Status', connectionId, message)

    respond({
        data: {
            result: 0
        }
    })
})



connector.onMessage_Osd(async (connectionId, message)=>{

    const m = message as {data: {longitude?: number, latitude?: number, height?: number}}

    const connection = await selectConnection(connectionId)

    if(typeof m.data.longitude === 'number' && typeof m.data.latitude === 'number' && typeof m.data.height === 'number'){

        //@ts-ignore
        if(typeof m.data.elevation === 'number'){// DRONE
            const message = m as thing_product_osd_Mavic_3_T

            if(typeof connection.drone_id !== 'number'){

                if(typeof message.gateway !== 'string'){
                    console.error('expected osd message to have the property "gateway"', message)
                    return
                } else {
                    const newDrone = await insertDrone({
                        //TODO: detect type type: DBType_RemoteController_TYPES.dji_rc_plus
                        serial_number: message.gateway, //TODO detect correct serial number
                        name: 'unknown'
                    })

                    await updateConnection({
                        drone_id: newDrone.id
                    }, connection.id)

                    connection.drone_id = newDrone.id
                }
            }

            addDroneData(connection.drone_id, DRONE_DATA_TYPES.POSITION, {longitude: m.data.longitude, latitude: m.data.latitude, height: m.data.height})
        } else {// RC

            if(typeof connection.remote_controller_id !== 'number'){

                if(typeof message.gateway !== 'string'){
                    console.error('expected osd message to have the property "gateway"', message)
                    return
                } else {
                    const newRemoteController = await insertRemoteController({
                        //TODO: detect type type: DBType_RemoteController_TYPES.dji_rc_plus
                        serial_number: message.gateway
                    })

                    await updateConnection({
                        remote_controller_id: newRemoteController.id
                    }, connection.id)

                    connection.remote_controller_id = newRemoteController.id
                }
            }

            addRemoteControllerData(connection.remote_controller_id, REMOTE_CONTROLLER_DATA_TYPES.POSITION, {longitude: m.data.longitude, latitude: m.data.latitude, height: m.data.height})
        }
    }
})

connector.onMessage_Event((connectionId, message, respond)=>{
    console.log('onMessage_Event', connectionId, message)

    return
    respond({
        data: {
            result: 0
        }
    })
})


new Logger(connector, path.resolve('connector_logs'))

const authedClientIdToConnectionIdMap = new Map<string, {
    connection_id: number,
    client: Client
}>()

export function handleMqttPacket(client: Client, packet: PublishPacket){
    try {

        const authMap = authedClientIdToConnectionIdMap.get(client.id)

        if(!authMap){
            console.error('trying to handleMqttPacket but client_id is not mapped to a connection (missing auth?). Ignoring packet', client.id)
            return
        }

        connector.handleMqttPacket(client, authMap.connection_id, packet)
    } catch (err){
        console.error('Failed to handleMqttPacket', err)
    }
}

export async function handleMqttAuth(client: Client, username: string, password: string): Promise<boolean>{

    const connection = await db.oneOrNone<DBType_Connection>('SELECT * FROM connections WHERE id = ${id} AND secret = ${secret}', {
        id: username,
        secret: password
    })

    if(!connection){
        console.log('mqtt auth failed for username (wrong secret)', username)
        return false
    }

    const existingClient = authedClientIdToConnectionIdMap.get(client.id)

    if(existingClient){

        if(existingClient.connection_id !== connection.id){
            // a client with same id connected to a different connection, so for security reasons we must kick the already existing client
            console.warn('new client authed but a client with the same client_id but different connection_id already exists and is now being force kicked!', client.id, connection.id, existingClient.connection_id)

            existingClient.client.close()
        }
    }

    authedClientIdToConnectionIdMap.set(client.id, {
        client,
        connection_id: connection.id
    })

    return true
}
