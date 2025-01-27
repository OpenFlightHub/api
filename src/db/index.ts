import * as pgp from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { registerSubscribableEvent } from '../live-websocket/websocket'
import { getLastPositionOfDrone } from '../util/drone';
import { selectDrone } from './DBHelpers';
import { getConnectionForDrone } from '../util/connection';
import { userHasPermissionForWorkspace } from '../util/user';

export async function setupDB(sco: pgp.IConnected<{}, pg.IClient>){
    const subscribableEventHandlerDbRowUpdate = registerSubscribableEvent('db_row_update', (event, filter, client)=>{

        const match = filter.match(/([a-zA-Z_]+)\.(\d+)/)

        if(!match){
            return 'invalid filter: ' + filter
        }

        const table = match[1]
        const id = parseInt(match[2])

        //TODO check if table is supported
        //TODO permission check

        if(isNaN(id) || id < 0){
            return 'invalid filter [id]: ' + id
        }

    })

    const subscribableEventHandlerDrone = registerSubscribableEvent('drone', async(event, filter, client)=>{

        const match = filter.match(/(\d+)/)

        if(!match){
            return 'invalid filter: ' + filter
        }

        const id = parseInt(match[1])

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

    sco.client.on('notification', async (data) => {

        const channel = data.channel

        switch(channel){
            case 'notify_change': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const changedId : string = '' + parsed.id

                const filter = changedTable + '.' + changedId

                subscribableEventHandlerDbRowUpdate.triggerListener(filter, {
                    table: changedTable,
                    id: changedId
                })

                break;
            }

            case 'notify_insert': {//TODO this does not really work, clients would need to subscribe to single ids that do not exist yet lol (we should redefinde filter for that)

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table

                if(changedTable === 'drone_data'){
                    const changedDroneId = parseInt(parsed.data.drone_id)

                    const filter = '' + changedDroneId

                    subscribableEventHandlerDrone.triggerListenerIfExists(filter, async()=>{

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
