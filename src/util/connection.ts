import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueToken } from '../util/crypto'


export async function createConnection(workspaceId: number, connectionName: string){

    const connection = await insertConnection({
        access_key: generateUniqueToken(25),
        workspace_id: workspaceId
    })

    return connection
}
