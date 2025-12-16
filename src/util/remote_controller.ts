import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insert_Remote_Controller_Data } from '../generated-definitions/db/DBHelpers'
import { DBType_Remote_Controller, DBType_Remote_Controller_Data, DBType_Remote_Controller_Data_TypeType } from '../generated-definitions/db/DBTypes'

export const REMOTE_CONTROLLER_DATA_TYPES: Record<string, DBType_Remote_Controller_Data_TypeType> = {
    POSITION: 0
}



export async function getRemoteControllerForSerialNumber(serialNumber: string){
    return db.oneOrNone<DBType_Remote_Controller>('SELECT * FROM remote_controllers WHERE serial_number = ${serialNumber};', {
        serialNumber
    })
}


export async function addRemoteControllerData(remoteControllerId: number, type: DBType_Remote_Controller_Data_TypeType, data: any){
    await insert_Remote_Controller_Data({
        remote_controller_id: remoteControllerId,
        type,
        data
    })
}


export async function getLastPositionOfRemoteController(remoteControllerId: number){
    const remoteControllerLastPosition = await db.one<DBType_Remote_Controller_Data>('SELECT * FROM remote_controller_data WHERE remote_controller_id = ${remoteControllerId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {
        type: REMOTE_CONTROLLER_DATA_TYPES.POSITION,
        remoteControllerId
    })

    return extractPositionFromRemoteController(remoteControllerLastPosition)
}


export function extractPositionFromRemoteController(remoteControllerData: DBType_Remote_Controller_Data){

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
