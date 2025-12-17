import * as pgp from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { registerSubscribableEvent } from '../live-websocket/websocket'
import { DBType_Drone_Data } from '../generated-definitions/db/DBTypes';

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
                const rowId = parseInt(parsed.data.id)

                break;
            }

            case 'notify_delete': {

                const parsed = JSON.parse(data.payload)

                const changedTable : string = parsed.table
                const deletedId: number = parseInt(parsed.id)
                const deletedData = parsed.data

            } break
        }

    })

    await sco.none('LISTEN $1:name', 'notify_change')
    await sco.none('LISTEN $1:name', 'notify_insert')
    await sco.none('LISTEN $1:name', 'notify_delete')

}
