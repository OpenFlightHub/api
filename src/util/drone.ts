import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertDroneData } from '../db/DBHelpers'
import { DBType_DroneData_TypeType } from '../db/DBTypes'

export const DRONE_DATA_TYPES: Record<string,DBType_DroneData_TypeType> = {
    POSITION: 0
}


export async function addDroneData(droneId: number, type: DBType_DroneData_TypeType, data: any){
    await insertDroneData({
        drone_id: droneId,
        type,
        data
    })
}
