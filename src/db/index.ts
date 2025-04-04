import * as pgp from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { registerSubscribableEvent } from '../live-websocket/websocket'
import { DRONE_DATA_TYPES, getLastPositionOfDrone, getLastTelemetryOfDrone } from '../util/drone';
import { selectDrone, selectRemoteController, selectWorkspace } from './DBHelpers';
import { getConnectionForDrone, getConnectionForRemoteController } from '../util/connection';
import { userHasPermissionForWorkspace } from '../util/user';
import { DBType_DroneData } from './DBTypes';

export async function setupDB(sco: pgp.IConnected<{}, pg.IClient>){
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

        const drone = await selectDrone(id)

        const connection = await getConnectionForDrone(drone.id)

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

        const drone = await selectDrone(id)

        const connection = await getConnectionForDrone(drone.id)

        const hasPermission = await userHasPermissionForWorkspace(client.userId, connection.workspace_id)

        if(!hasPermission){
            return 'Permission denied'
        }

    })


    const subscribableEventHandlerRemoteControllerPosition = registerSubscribableEvent('remote_controller_position', async(event, filter, client)=>{

        const id = parseInt(filter)

        if(isNaN(id) || id < 0){
            return 'invalid filter: ' + id
        }

        const remoteController = await selectRemoteController(id)

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

        const workspace = await selectWorkspace(id)

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

                break;
            }

            case 'notify_insert': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table

                if(changedTable === 'drone_data'){

                    const changedDroneId = parseInt(parsed.data.drone_id)

                    const data = parsed.data as DBType_DroneData

                    if(data.type === DRONE_DATA_TYPES.POSITION){

                        const drone = await selectDrone(changedDroneId)

                        subscribableEventHandlerDronePosition.triggerListenerIfExists('' + changedDroneId, async()=>{

                            const droneLastPosition = await getLastPositionOfDrone(changedDroneId)

                            return {
                                id: changedDroneId,
                                position: droneLastPosition,
                                serial_number: drone.serial_number
                            }
                        })

                        const connection = await getConnectionForDrone(drone.id)

                        subscribableEventHandlerWorkspaceDronesPosition.triggerListenerIfExists('' + connection.workspace_id, async()=>{
                            const droneLastPosition = await getLastPositionOfDrone(changedDroneId)

                            return {
                                id: changedDroneId,
                                position: droneLastPosition,
                                serial_number: drone.serial_number
                            }
                        })

                    } else if(data.type === DRONE_DATA_TYPES.TELEMETRY){

                        subscribableEventHandlerDroneTelemetry.triggerListenerIfExists('' + changedDroneId, async()=>{

                            const droneLastTelemetry = await getLastTelemetryOfDrone(changedDroneId)

                            return {
                                id: changedDroneId,
                                telemetry: droneLastTelemetry
                            }
                        })
                    }
                }
            }
        }

    })

    await sco.none('LISTEN $1:name', 'notify_change')
    await sco.none('LISTEN $1:name', 'notify_insert')

}
