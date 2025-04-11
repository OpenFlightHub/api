import { Client, PublishPacket } from "aedes";
import Connector from "./Connector";
import Logger from "./ConnectorLogger";
import path from "path";
import {addDroneData, DRONE_DATA_TYPES, getDroneForSerialNumber} from '../../util/drone'
import {addRemoteControllerData, REMOTE_CONTROLLER_DATA_TYPES} from '../../util/remote_controller'
import {MqttRcProEnterpriseProperties_STABLE_FREQUENCY_TYPE, MqttMavic3EnterpriseProperties_STABLE_FREQUENCY_TYPE} from './mqtt-types/documented'
import * as pgp from 'pg-promise'
import { DBType_Connection, DBType_Drone, DBType_Drone_TYPES, DBType_RemoteController_TYPES } from "../../db/DBTypes";
import { insertDrone, insertRemoteController, selectConnection, selectDrone, updateConnection, updateDrone } from "../../db/DBHelpers";
import {getProductType} from './util/product'
const db : pgp.IDatabase<any> = global.db

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log('onMessage_State', connectionId, message)

    //TODO save live_capacity information of rc (and use that to determine if rc can do livestreaming)
    //TODO website on rc needs to reqest aircraft and rc serial number, send to server so it can identify rc and drone by serial number
})


connector.onMessage_Status(async (connectionId, message, productSerialNumber, respond)=>{
    console.log('onMessage_Status', connectionId, productSerialNumber, message)

    try {

        if(message.method === 'update_topo'){
            //@ts-ignore
            if(message.data.thing_version !== '1.2.0'){
                console.warn('thing_version of mqtt message update_topo was not 1.2.0: ', message)
            }

            const connection = await selectConnection(connectionId)

            await updateProductForConnection(connection, productSerialNumber, message.data)

            if(message.data.sub_devices){
                for(const subDevice of message.data.sub_devices){
                    await updateProductForConnection(connection, productSerialNumber, subDevice)
                }
            }
        }

    } catch (err){
        console.error('error while running onMessage_Status', err)
    }

    respond({
        result: 0
    })
})


/**
 * makes sure, the drones and remote controllers for this connection link are properly registered and referenced to each other
 */
async function updateProductForConnection(connection: DBType_Connection, productSerialNumber: string, data: {domain: string, type: number, sub_type: number, sn?: string}){

    const productType = getProductType(data.domain, data.type, data.sub_type)

    if(productType.domain === 'controller'){

        if(typeof connection.remote_controller_id !== 'number'){

            const newRemoteController = await insertRemoteController({
                type: productType.type === 'rc_plus' ? DBType_RemoteController_TYPES.dji_rc_plus
                    : productType.type === 'rc_plus_2' ? DBType_RemoteController_TYPES.dji_rc_plus_2
                    : productType.type === 'rc_pro_enterprise' ? DBType_RemoteController_TYPES.dji_rc_pro_enterprise
                    : productType.type === 'smart_controller_enterprise' ? DBType_RemoteController_TYPES.dji_smart_controller
                    : DBType_RemoteController_TYPES.unknown,
                serial_number: productSerialNumber
            })

            await updateConnection({
                remote_controller_id: newRemoteController.id
            }, connection.id)

            connection.remote_controller_id = newRemoteController.id
        }

    } else if(productType.domain === 'drone'){

        let drone = await getDroneForSerialNumber(productSerialNumber)

        if(drone){
            if(drone.last_connection_id !== connection.id){
                console.warn('transferring drone connection from', drone.last_connection_id, 'to', connection.id)
                drone.last_connection_id = connection.id

                await updateDrone({
                    last_connection_id: connection.id
                }, drone.id)
            }
        } else {

            if(typeof data.sn !== 'string'){
                throw new Error('data.sn was not a string (for product type drone)')
            }

            drone = await insertDrone({
                type: productType.type === 'mavic_3_enterprise' ? DBType_Drone_TYPES.dji_mavic_3
                    : productType.type === 'matrice_300_rtk' ? DBType_Drone_TYPES.dji_matrice_300
                    : productType.type === 'matrice_30' ? DBType_Drone_TYPES.dji_matrice_30
                    : productType.type === 'matrice_350_rtk' ? DBType_Drone_TYPES.dji_matrice_350
                    : DBType_Drone_TYPES.unknown,
                serial_number: data.sn,
                name: productType.subType,
                last_connection_id: connection.id
            })
        }

        if(connection.last_drone_id !== drone.id){
            console.warn('replacing connection drone', connection.last_drone_id, 'with', drone.id)

            await updateConnection({
                last_drone_id: drone.id
            }, connection.id)

            connection.last_drone_id = drone.id
        }

    } else {
        //TODO implement camera and dock?
    }

}


connector.onMessage_Osd(async (connectionId, message, productSerialNumber)=>{

    const _m = message as {data: {longitude?: number, latitude?: number, height?: number}}

    const connection = await selectConnection(connectionId)


    if(typeof message.gateway !== 'string'){
        console.error('expected osd message to have the property "gateway"', message)
        return
    }


    const messageType = productSerialNumber === message.gateway ? 'fromGateway' : 'notFromGateway' //TODO: check if this works correctly for all drones (especially m300)

    if(messageType === 'fromGateway'){

        //TODO is a dock a gateway or not? i guess it is?

        if(typeof _m.data.longitude === 'number' && typeof _m.data.latitude === 'number' && typeof _m.data.height === 'number'){

            const messageData = _m.data as MqttRcProEnterpriseProperties_STABLE_FREQUENCY_TYPE

            if((_m.data.longitude === 0 && _m.data.latitude === 0) === false){// check if gps has lock
                addRemoteControllerData(connection.remote_controller_id, REMOTE_CONTROLLER_DATA_TYPES.POSITION, {
                    longitude: messageData.longitude,
                    latitude: messageData.latitude,
                    height: messageData.height
                })
            }
        }

    } else {
        const drone = await getDroneForSerialNumber(productSerialNumber)

        if(drone){

            //@ts-ignore
            if(typeof _m.data.longitude === 'number' && typeof _m.data.latitude === 'number' && typeof _m.data.height === 'number' && typeof _m.data.elevation === 'number'){
                const messageData = _m.data as MqttMavic3EnterpriseProperties_STABLE_FREQUENCY_TYPE

                if((_m.data.longitude === 0 && _m.data.latitude === 0) === false){// check if gps has lock

                    addDroneData(drone.id, DRONE_DATA_TYPES.POSITION, {
                        longitude: messageData.longitude,
                        latitude: messageData.latitude,
                        height: messageData.height
                    })
                }

                if(typeof messageData.battery?.capacity_percent === 'number'){
                    addDroneData(drone.id, DRONE_DATA_TYPES.TELEMETRY, {
                        capacity_percent_left: messageData.battery.capacity_percent
                    })
                }

            }

        } else {
            //TODO support camera
        }
    }

})

connector.onMessage_Event((connectionId, message, serialNumber, respond)=>{
    console.log('onMessage_Event', connectionId, message, serialNumber)


    if(message.need_reply === 1){// if this check is not done, it crashes the dji pilot 2 app on the remote controller
        respond({
            result: 0
        })
    }
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
