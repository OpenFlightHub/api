import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../db/DBHelpers';
import { ApiSchema_Drone, ApiSchema_DroneBattery, ApiSchema_DroneFlights, ApiSchema_DroneMedia, ApiSchema_DronePosition, ApiSchema_Flight } from '../definitions/ApiSchemas';
import { DBType_DroneMedia, DBType_Flight } from '../db/DBTypes';
import { ApiType_Drone, ApiType_DroneBattery, ApiType_DroneFlights, ApiType_DroneMedia, ApiType_DronePosition, ApiType_Flight } from '../definitions/ApiTypes';
import { getLastPositionOfDrone as getLastPositionOfDrone, getLastTelemetryOfDrone } from '../util/drone';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
import { assignObject } from '../util/typescript';
import { getTrackForFlight } from '../util/flight';
import { parseCameraMetaOfMedia } from '../util/media';
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

    const droneMedia = await db.manyOrNone<DBType_DroneMedia & {file_name: string}>('SELECT drone_media.*, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE drone_id = ${droneId}', {
        droneId
    })

    res.GM.guardSend<ApiType_DroneMedia>(droneMedia.map(m => parseCameraMetaOfMedia(m)), ApiSchema_DroneMedia)
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

router.get('/:drone_id/current-flight', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const currentFlight = await db.one<DBType_Flight>('SELECT * FROM flights WHERE drone_id = ${droneId} ORDER BY id DESC LIMIT 1', {
        droneId
    })

    res.GM.guardSend<ApiType_Flight>(assignObject({track: await getTrackForFlight(currentFlight.id)}, currentFlight), ApiSchema_Flight)
}))



export default router
