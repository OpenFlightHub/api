import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection, selectConnection, selectDrone } from '../db/DBHelpers'
import { generateUniqueTokenUrlSafe } from '../util/crypto'
import { DBType_Connection, DBType_Drone } from '../db/DBTypes'
import { createBucketForConnection } from '../s3-store'


export async function createConnection(workspaceId: number, name: string){

    const connection = await insertConnection({
        secret: generateUniqueTokenUrlSafe(25),
        workspace_id: workspaceId,
        name,
        workspace_uuid: getRandomUUIDFromWorkspaceId(workspaceId)
    })
    //TODO: delete connection if create bucket was unsuccessfull
    await createBucketForConnection(connection.id)

    return connection
}


export async function getActiveConnectionForDrone(droneId: number){
    const drone = await selectDrone(droneId)
    if(typeof drone.last_connection_id !== 'number'){
        return false
    }

    const connection = await selectConnection(drone.last_connection_id)

    if(!connection){
        return false
    }

    if(connection.last_drone_id === droneId){
        return connection
    } else {
        return false
    }
}

export async function getLastConnectionForDrone(droneOrDroneId: DBType_Drone | number){
    if(typeof droneOrDroneId === 'number'){
        droneOrDroneId = await selectDrone(droneOrDroneId)
    }

    if(!droneOrDroneId){
        throw GuardError._410_Gone('drone not found: ' + droneOrDroneId)
    }

    if(typeof droneOrDroneId.last_connection_id !== 'number'){
        return false
    }

    const connection = await db.oneOrNone('SELECT * FROM connections WHERE id = ${id}', {
        id: droneOrDroneId.last_connection_id
    })

    if(connection){
        return connection
    } else {
        return false
    }
}

export async function getConnectionForRemoteController(remoteControllerId: number){
    return await db.one<DBType_Connection>('SELECT * FROM connections WHERE remote_controller_id = ${remoteControllerId}', {
        remoteControllerId
    })
}

export async function getDroneConnectionOnlineStatus(connectionId: number): Promise<{
    remoteController: boolean
    drone: boolean
}> {

    const connection = await selectConnection(connectionId)

    const mqttIsConnected = isConnectionOnline(connectionId)

    if(typeof connection.last_drone_id !== 'number'){
        return {
            remoteController: mqttIsConnected,
            drone: false
        }
    }

    let lastPos: Awaited<ReturnType<typeof getLastTelemetryOfDrone>> | false

    try {
        lastPos = await getLastTelemetryOfDrone(connection.last_drone_id)
    } catch (err){
        lastPos = false
    }

    return {
        remoteController: mqttIsConnected,
        drone: lastPos && dayjs(lastPos.reported_at).isAfter( dayjs().subtract(120, 'second') )// last telemetry is not older then 120 seconds
    }
}


import { randomUUID } from "crypto"
import { GuardError } from '../ManInTheMiddleware'
import { isConnectionOnline } from '../connector/dji-pilot-2'
import { getLastTelemetryOfDrone } from './drone'
import dayjs from 'dayjs'

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

    if(workspaceIdString.length > 8){
        throw new Error('workspaceid exceeds length of 8')
    }

    while(workspaceIdString.length < 8){
        workspaceIdString = '0' + workspaceIdString
    }

    return `${workspaceIdString}-${match[2]}-42ae-${match[4]}-${match[5]}`
}
