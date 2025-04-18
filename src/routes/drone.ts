import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectConnection, selectDrone } from '../db/DBHelpers';
import { ApiSchema_Drone, ApiSchema_DroneBattery, ApiSchema_DroneFlights, ApiSchema_DroneMedia, ApiSchema_DronePosition } from '../definitions/ApiSchemas';
import { DBType_Connection, DBType_Drone, DBType_DroneData, DBType_DroneMedia, DBType_Flight } from '../db/DBTypes';
import { ApiType_Drone, ApiType_DroneBattery, ApiType_DroneFlights, ApiType_DroneMedia, ApiType_DronePosition } from '../definitions/ApiTypes';
import { DRONE_DATA_TYPES, getLastPositionOfDrone as getLastPositionOfDrone, getLastTelemetryOfDrone } from '../util/drone';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
import { assignObject } from '../util/typescript';
import { getTrackForFlight } from '../util/flight';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})

//TODO check if this implementation of auth for all other endpoints works
router.use('/:drone_id', asyncHandler(async(req, res, next) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const drone = await req.GM.guardDBGone(()=>{
        return selectDrone(droneId)
    })

    const connection = await getLastConnectionForDrone(drone)

    if(!connection){
        // connection deleted or last_connection_id was never set
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    req._drone = drone

    next()
}))




router.get('/:drone_id', asyncHandler(async (req, res) => {

    res.GM.guardSend<ApiType_Drone>(req._drone, ApiSchema_Drone)
}))




router.get('/:drone_id/last-position', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const droneLastPosition = await req.GM.guardDBGone(()=>{
        return getLastPositionOfDrone(droneId)
    })

    if(droneLastPosition === false){
        res.status(410).send()
        return
    }

    res.GM.guardSend<ApiType_DronePosition>(droneLastPosition, ApiSchema_DronePosition)
}))


router.get('/:drone_id/last-battery', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const droneLastBattery = await req.GM.guardDBGone(()=>{
        return getLastTelemetryOfDrone(droneId)
    })

    if(droneLastBattery === false){
        res.status(410).send()
        return
    }

    res.GM.guardSend<ApiType_DroneBattery>(droneLastBattery, ApiSchema_DroneBattery)
}))


router.get('/:drone_id/media', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const droneMedia = await db.manyOrNone<DBType_DroneMedia & {created_at: string, file_name: string}>('SELECT drone_media.*, files.created_at, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE drone_id = ${droneId}', {
        droneId
    })

    res.GM.guardSend<ApiType_DroneMedia>(droneMedia, ApiSchema_DroneMedia)
}))


router.get('/:drone_id/flights', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const droneFlights = await db.manyOrNone<DBType_Flight>('SELECT * FROM flights WHERE drone_id = ${droneId}', {
        droneId
    })

    const ret = new Array<{track: Awaited<ReturnType<typeof getTrackForFlight>>} & DBType_Flight>()

    for(const flight of droneFlights){
        ret.push(
            assignObject({track: await getTrackForFlight(flight.id)}, flight)
        )
    }

    res.GM.guardSend<ApiType_DroneFlights>(ret, ApiSchema_DroneFlights)
}))


export default router
