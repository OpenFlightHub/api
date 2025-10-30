import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertRemoteControllerData } from '../generated-definitions/db/DBHelpers'
import { DBType_RemoteController, DBType_RemoteControllerData, DBType_RemoteControllerData_TypeType } from '../generated-definitions/db/DBTypes'

export const REMOTE_CONTROLLER_DATA_TYPES: Record<string,DBType_RemoteControllerData_TypeType> = {
    POSITION: 0
}



export async function getRemoteControllerForSerialNumber(serialNumber: string){
    return db.oneOrNone<DBType_RemoteController>('SELECT * FROM remote_controllers WHERE serial_number = ${serialNumber};', {
        serialNumber
    })
}


export async function addRemoteControllerData(remoteControllerId: number, type: DBType_RemoteControllerData_TypeType, data: any){
    await insertRemoteControllerData({
        remote_controller_id: remoteControllerId,
        type,
        data
    })
}


export async function getLastPositionOfRemoteController(remoteControllerId: number){
    const remoteControllerLastPosition = await db.one<DBType_RemoteControllerData>('SELECT * FROM remote_controller_data WHERE remote_controller_id = ${remoteControllerId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {
        type: REMOTE_CONTROLLER_DATA_TYPES.POSITION,
        remoteControllerId
    })

    return extractPositionFromRemoteController(remoteControllerLastPosition)
}


export function extractPositionFromRemoteController(remoteControllerData: DBType_RemoteControllerData){

    if(typeof remoteControllerData.data.latitude !== 'number' || typeof remoteControllerData.data.longitude !== 'number' || typeof remoteControllerData.data.height !== 'number'){
        return false
    }

    return {
        reported_at: remoteControllerData.created_at,
        latitude: remoteControllerData.data.latitude as number,
        longitude: remoteControllerData.data.longitude as number,
        height: remoteControllerData.data.height as number
    }
}
