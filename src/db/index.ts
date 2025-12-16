import * as pgp from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { registerSubscribableEvent, SubscribableEventHandler } from '../live-websocket/websocket'
import { DRONE_DATA_TYPES, extractPositionFromDroneData, extractTelemetryFromDroneData } from '../util/drone';
import { select_Connection, select_Drone, select_Geo_Object, select_Remote_Controller, select_Workspace } from '../generated-definitions/db/DBHelpers';
import { getActiveConnectionForDrone, getConnectionForRemoteController } from '../util/connection';
import { userHasPermissionForWorkspace } from '../util/user';
import { DBType_Drone_Data } from '../generated-definitions/db/DBTypes';

export async function setupDB(sco: pgp.IConnected<{}, pg.IClient>, geoObjectSubscribableEventHandler: SubscribableEventHandler<'geo_object'>){
    const subscribableEventHandlerDbRowUpdate = registerSubscribableEvent('db_row_update', (event, filters, client)=>{

        const table = filters[0]
        const id = parseInt(filters[1])

        //TODO check if table is supported
        //TODO permission check

        if(isNaN(id) || id < 0){
            return 'invalid filter [id]: ' + id
        }

    })

    const subscribableEventHandlerDronePosition = registerSubscribableEvent('drone_position', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const drone = await select_Drone(id)//TODO if drone does not exist, api crashes

        const connection = await select_Connection(drone.last_connection_id!)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, connection.workspace_id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })


    const subscribableEventHandlerDroneTelemetry = registerSubscribableEvent('drone_telemetry', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const drone = await select_Drone(id)//TODO if drone does not exist, api crashes

        const connection = await select_Connection(drone.last_connection_id!)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, connection.workspace_id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })

    //TODO reimplement live remote controller position (got removed at some point around probably 10th April 25 ?)
    const subscribableEventHandlerRemoteControllerPosition = registerSubscribableEvent('remote_controller_position', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const remoteController = await select_Remote_Controller(id)

        const connection = await getConnectionForRemoteController(remoteController.id)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, connection.workspace_id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })

    const subscribableEventHandlerWorkspaceDronesPosition = registerSubscribableEvent('workspace_drones_position', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const workspace = await select_Workspace(id)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, workspace.id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })


    const subscribableEventHandlerDroneMedia = registerSubscribableEvent('drone_media', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const drone = await select_Drone(id)//TODO if drone does not exist, api crashes

        const connection = await select_Connection(drone.last_connection_id!)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, connection.workspace_id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })


    const subscribableEventHandlerWorkspaceDronesMedia = registerSubscribableEvent('workspace_drones_media', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const workspace = await select_Workspace(id)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, workspace.id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })

    sco.client.on('notification', async (data) => {

        const channel = data.channel

        switch(channel){
            case 'notify_change': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const changedId : string = '' + parsed.id

                subscribableEventHandlerDbRowUpdate.triggerListener(changedTable + '.' + changedId, {
                    table: changedTable,
                    id: changedId
                })


                if(changedTable === 'geo_objects'){
                    const geoObjectId = parseInt(changedId)

                    const geoObject = await select_Geo_Object(geoObjectId)

                    geoObjectSubscribableEventHandler.triggerListenerIfExists('' + geoObject.workspace_id, ()=>{

                        return {
                            event_type: 'update',
                            uuid: geoObject.uuid,//TODO why do we need this? only for delete?
                            data: geoObject
                        }
                    })
                }

                break;
            }

            case 'notify_insert': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table

                if(changedTable === 'drone_data'){

                    const changedDroneId = parseInt(parsed.data.drone_id)

                    const data = parsed.data as DBType_Drone_Data

                    if(data.type === DRONE_DATA_TYPES.POSITION){

                        const drone = await select_Drone(changedDroneId)

                        subscribableEventHandlerDronePosition.triggerListenerIfExists('' + changedDroneId, async()=>{

                            const droneLastPosition = extractPositionFromDroneData(data)

                            if(droneLastPosition === false){
                                throw new Error('no valid drone position in data')
                            }

                            return {
                                id: changedDroneId,
                                position: droneLastPosition,
                                serial_number: drone.serial_number
                            }
                        })

                        const connection = await getActiveConnectionForDrone(drone.id)

                        if(connection){

                            subscribableEventHandlerWorkspaceDronesPosition.triggerListenerIfExists('' + connection.workspace_id, async()=>{
                                const droneLastPosition = extractPositionFromDroneData(data)

                                if(droneLastPosition === false){
                                    throw new Error('no valid drone position in data')
                                }

                                return {
                                    id: changedDroneId,
                                    position: droneLastPosition,
                                    serial_number: drone.serial_number
                                }
                            })
                        }

                    } else if(data.type === DRONE_DATA_TYPES.TELEMETRY){

                        subscribableEventHandlerDroneTelemetry.triggerListenerIfExists('' + changedDroneId, async()=>{

                            const droneLastTelemetry = extractTelemetryFromDroneData(data)

                            if(droneLastTelemetry === false){
                                throw new Error('no valid drone telemetry in data')
                            }

                            return {
                                id: changedDroneId,
                                telemetry: droneLastTelemetry
                            }
                        })

                    }
                } else if(changedTable === 'drone_media'){

                    const mediaId = parseInt(parsed.data.id)
                    const droneId = parseInt(parsed.data.drone_id)

                    const drone = await select_Drone(droneId)

                    const connection = await getActiveConnectionForDrone(drone.id)

                    if(connection === false){
                        return
                    }

                    subscribableEventHandlerDroneMedia.triggerListener('' + droneId, {
                        id: mediaId,
                        drone_id: droneId,
                        workspace_id: connection.workspace_id,
                        drone_serial_number: drone.serial_number,
                        file_id: parsed.data.file_id,
                        flight_id: parsed.data.flight_id
                    })

                    subscribableEventHandlerWorkspaceDronesMedia.triggerListener('' + connection.workspace_id, {
                        id: mediaId,
                        drone_id: droneId,
                        workspace_id: connection.workspace_id,
                        drone_serial_number: drone.serial_number,
                        file_id: parsed.data.file_id,
                        flight_id: parsed.data.flight_id
                    })
                } else if(changedTable === 'geo_objects'){

                    const geoObjectId = parseInt(parsed.data.id)

                    const geoObject = await select_Geo_Object(geoObjectId)

                    geoObjectSubscribableEventHandler.triggerListenerIfExists('' + geoObject.workspace_id, ()=>{
                        return {
                            event_type: 'create',
                            uuid: geoObject.uuid,//TODO why do we need this? only for delete?
                            data: geoObject
                        }
                    })
                }
            } break

            case 'notify_delete': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const deletedId: number = parseInt(parsed.id)
                const deletedData = parsed.data

                 if(changedTable === 'geo_objects'){

                    geoObjectSubscribableEventHandler.triggerListenerIfExists('' + deletedData.workspace_id, ()=>{
                        return {
                            event_type: 'delete',
                            uuid: deletedData.uuid
                        }
                    })
                }
            } break
        }

    })

    await sco.none('LISTEN $1:name', 'notify_change')
    await sco.none('LISTEN $1:name', 'notify_insert')
    await sco.none('LISTEN $1:name', 'notify_delete')

}
