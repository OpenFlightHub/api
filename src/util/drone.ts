import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insert_Drone_Data, insert_Flight, select_Drone, select_File, select_Flight, update_Drone, update_Flight } from '../generated-definitions/db/DBHelpers'
import { DBType_Drone, DBType_Drone_Data, DBType_Drone_Data_TypeType } from '../generated-definitions/db/DBTypes'

export const DRONE_DATA_TYPES = {
    POSITION: 0 as DBType_Drone_Data_TypeType,
    TELEMETRY: 1 as DBType_Drone_Data_TypeType
}


export async function addDroneData(droneId: number, type: DBType_Drone_Data_TypeType, data: any){

    const drone = await select_Drone(droneId)

    await insert_Drone_Data({
        drone_id: droneId,
        flight_id: drone.current_flight_id,
        type,
        data
    })
}

export async function getLastPositionOfDrone(droneId: number){
    const droneLastPosition = await db.one<DBType_Drone_Data>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {
        type: DRONE_DATA_TYPES.POSITION,
        droneId
    })

    return extractPositionFromDroneData(droneLastPosition)
}


export function extractPositionFromDroneData(droneData: DBType_Drone_Data){

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
    const droneLastTelemetry = await db.one<DBType_Drone_Data>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains the required telemetry
        type: DRONE_DATA_TYPES.TELEMETRY,
        droneId
    })

    return extractTelemetryFromDroneData(droneLastTelemetry)
}


export function extractTelemetryFromDroneData(droneData: DBType_Drone_Data){

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

export async function setDroneInFlightState(drone: DBType_Drone, isInFlight: boolean){

    //TODO end flight after some time we saw no messages?

    //TODO start new flight, if last time we saw messages was ages ago?

    if(isInFlight && !drone.in_flight){
        // start new flight and end old one

        const currentFlight = await select_Flight(drone.current_flight_id)

        await update_Flight({
            ended_at: new Date().toISOString(),
            landed_at: currentFlight.landed_at || new Date().toISOString()
        }, drone.current_flight_id)

        const newFlight = await insert_Flight({
            drone_id: drone.id
        })

        drone = await update_Drone({
            current_flight_id: newFlight.id,
            in_flight: true
        }, drone.id)
    }

    if(!isInFlight && drone.in_flight){
        // mark flight as landed

        await update_Flight({
            landed_at: new Date().toISOString()
        }, drone.current_flight_id)

        drone = await update_Drone({
            in_flight: false
        }, drone.id)

    }

    return drone
}
