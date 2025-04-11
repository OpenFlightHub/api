import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertDroneData } from '../db/DBHelpers'
import { DBType_Drone, DBType_DroneData, DBType_DroneData_TypeType } from '../db/DBTypes'

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
    const droneLastPosition = await db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {
        type: DRONE_DATA_TYPES.POSITION,
        droneId
    })

    return extractPositionFromDroneData(droneLastPosition)
}


export function extractPositionFromDroneData(droneData: DBType_DroneData){

    if(typeof droneData.data.latitude !== 'number' || typeof droneData.data.longitude !== 'number' || typeof droneData.data.height !== 'number'){
        return false
    }

    return {
        reported_at: droneData.created_at,
        latitude: droneData.data.latitude as number,
        longitude: droneData.data.longitude as number,
        height: droneData.data.height as number
    }
}


export async function getLastTelemetryOfDrone(droneId: number){
    const droneLastTelemetry = await db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains the required telemetry
        type: DRONE_DATA_TYPES.TELEMETRY,
        droneId
    })

    return extractTelemetryFromDroneData(droneLastTelemetry)
}


export function extractTelemetryFromDroneData(droneData: DBType_DroneData){

    if(typeof droneData.data.capacity_percent_left !== 'number'){
        return false
    }

    return {
        reported_at: droneData.created_at,
        capacity_percent_left: droneData.data.capacity_percent_left as number
    }
}

export async function getDroneForSerialNumber(serialNumber: string){
    return db.oneOrNone<DBType_Drone>('SELECT * FROM drones WHERE serial_number = ${serialNumber};', {
        serialNumber
    })
}
