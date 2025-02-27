import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueTokenUrlSafe } from '../util/crypto'
import { DBType_Connection } from '../db/DBTypes'
import { createBucketForConnection } from '../s3-store'


export async function createConnection(workspaceId: number, name: string){

    const connection = await insertConnection({
        secret: generateUniqueTokenUrlSafe(25),
        workspace_id: workspaceId,
        name,
        workspace_uuid: getRandomUUIDFromWorkspaceId(workspaceId)
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


import { randomUUID } from "crypto"

/**
 * @see getRandomUUIDFromWorkspaceId()
 */
export function getWorkspaceIdFromUUID(uuid: string){

    const match = uuid.match(/(\d{8})-[0-9a-f]{4}-42ae-[0-9a-f]{4}-[0-9a-f]{12}/)

    if(!match){
        throw new Error('invalid uuid format: ' + uuid)
    }

    return parseInt(match[1])
}

/**
 * @see getWorkspaceIdFromUUID()
 */
export function getRandomUUIDFromWorkspaceId(workspaceId: number){

    const baseUUID = randomUUID()
    const match = baseUUID.match(/([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/)

    if(!match){
        throw new Error('baseUUID does not match: ' + baseUUID)
    }

    let workspaceIdString = '' + workspaceId
    while(workspaceIdString.length < 8){
        workspaceIdString = '0' + workspaceIdString
    }

    return `${workspaceIdString}-${match[2]}-42ae-${match[4]}-${match[5]}`
}
