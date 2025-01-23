import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueTokenUrlSafe } from '../util/crypto'
import { DBType_Connection } from '../db/DBTypes'


export async function createConnection(workspaceId: number, connectionName: string){

    const connection = await insertConnection({
        secret: generateUniqueTokenUrlSafe(25),
        workspace_id: workspaceId
    })

    return connection
}


export async function getConnectionForDrone(droneId: number){
    return await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })
}
