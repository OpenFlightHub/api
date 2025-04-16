import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertDroneData, insertFlight, selectDrone, selectFile, selectFlight, updateDrone, updateFlight } from '../db/DBHelpers'
import { DBType_Drone, DBType_DroneData, DBType_DroneData_TypeType } from '../db/DBTypes'

export const DRONE_DATA_TYPES = {
    POSITION: 0 as DBType_DroneData_TypeType,
    TELEMETRY: 1 as DBType_DroneData_TypeType
}


export async function addDroneData(droneId: number, type: DBType_DroneData_TypeType, data: any){

    const drone = await selectDrone(droneId)

    await insertDroneData({
        drone_id: droneId,
        flight_id: drone.current_flight_id,
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

export async function setDroneInFlightState(drone: DBType_Drone, isInFlight: boolean){

    //TODO end flight after some time we saw no messages?

    //TODO start new flight, if last time we saw messages was ages ago?

    if(isInFlight && !drone.in_flight){
        // start new flight and end old one

        const currentFlight = await selectFlight(drone.current_flight_id)

        await updateFlight({
            ended_at: new Date().toISOString(),
            landed_at: currentFlight.landed_at || new Date().toISOString()
        }, drone.current_flight_id)

        const newFlight = await insertFlight({
            drone_id: drone.id
        })

        drone = await updateDrone({
            current_flight_id: newFlight.id,
            in_flight: true
        }, drone.id)
    }

    if(!isInFlight && drone.in_flight){
        // mark flight as landed

        await updateFlight({
            landed_at: new Date().toISOString()
        }, drone.current_flight_id)

        drone = await updateDrone({
            in_flight: false
        }, drone.id)

    }

    return drone
}
