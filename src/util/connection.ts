import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueTokenUrlSafe } from '../util/crypto'
import { DBType_Connection } from '../db/DBTypes'
import { createBucketForConnection } from '../s3-store'


export async function createConnection(workspaceId: number){

    const connection = await insertConnection({
        secret: generateUniqueTokenUrlSafe(25),
        workspace_id: workspaceId
    })

    await createBucketForConnection(connection.id)

    return connection
}


export async function getConnectionForDrone(droneId: number){
    return await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })
}

export async function getConnectionForRemoteController(remoteControllerId: number){
    return await db.one<DBType_Connection>('SELECT * FROM connections WHERE remote_controller_id = ${remoteControllerId}', {
        remoteControllerId
    })
}
