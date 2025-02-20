import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertDroneData } from '../db/DBHelpers'
import { DBType_DroneData, DBType_DroneData_TypeType } from '../db/DBTypes'

export const DRONE_DATA_TYPES = {
    POSITION: 0 as DBType_DroneData_TypeType,
    TELEMETRY: 1 as DBType_DroneData_TypeType
}


export async function addDroneData(droneId: number, type: DBType_DroneData_TypeType, data: any){
    await insertDroneData({
        drone_id: droneId,
        type,
        data
    })
}

export async function getLastPositionOfDrone(droneId: number){
    const droneLastPosition = await db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains longitude and latitude
        type: DRONE_DATA_TYPES.POSITION,
        droneId
    })

    return {
        reported_at: droneLastPosition.created_at,
        latitude: droneLastPosition.data.latitude as number,
        longitude: droneLastPosition.data.longitude as number,
        height: droneLastPosition.data.height as number
    }
}


export async function getLastTelemetryOfDrone(droneId: number){
    const droneLastTelemetry = await db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains the required telemetry
        type: DRONE_DATA_TYPES.TELEMETRY,
        droneId
    })

    return {
        reported_at: droneLastTelemetry.created_at,
        capacity_percent_left: droneLastTelemetry.data.capacity_percent_left as number
    }
}
