import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueTokenUrlSafe } from '../util/crypto'


export async function createConnection(workspaceId: number, connectionName: string){

    const connection = await insertConnection({
        secret: generateUniqueTokenUrlSafe(25),
        workspace_id: workspaceId
    })

    return connection
}
