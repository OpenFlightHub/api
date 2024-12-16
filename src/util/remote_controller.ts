import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertRemoteControllerData } from '../db/DBHelpers'
import { DBType_RemoteControllerData_TypeType } from '../db/DBTypes'

export const REMOTE_CONTROLLER_DATA_TYPES: Record<string,DBType_RemoteControllerData_TypeType> = {
    POSITION: 0
}


export async function addRemoteControllerData(remoteControllerId: number, type: DBType_RemoteControllerData_TypeType, data: any){
    await insertRemoteControllerData({
        remote_controller_id: remoteControllerId,
        type,
        data
    })
}
