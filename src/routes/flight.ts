import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Flight, ApiSchema_Flight_Media } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Flight, ApiType_Flight_Media } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { assignObject } from '../util/typescript';
import { DBType_Drone_Media } from '../generated-definitions/db/DBTypes';
import { getCore } from '../core';
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
router.use('/:flight_id', asyncHandler(async(req, res, next) => {

    const flightId = req.GM.guardParam('flight_id', 'id')

    const flight = await req.GM.guardDBGone(()=>{
        return getCore().modules.flight.get(flightId)
    })

    const connection = await getCore().modules.drone.getLastConnectionForDrone(flight.drone_id)

    if(!connection){
        // connection deleted or last_connection_id was never set
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    req._flight = flight

    next()
}))




router.get('/:flight_id', asyncHandler(async (req, res) => {

    const track = await getCore().modules.flight.getTrackForFlight(req._flight.id)

    res.GM.guardSend<ApiType_Flight>(assignObject({track}, req._flight), ApiSchema_Flight)
}))


router.get('/:flight_id/media', asyncHandler(async (req, res) => {

    const flightId = req.GM.guardParam('flight_id', 'id')

    const flightMedia = await db.manyOrNone<DBType_Drone_Media & {file_name: string}>('SELECT drone_media.*, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE flight_id = ${flightId}', {
        flightId
    })

    res.GM.guardSend<ApiType_Flight_Media>(flightMedia.map(m => getCore().modules.droneMedia.parseCameraMetaOfMedia(m)), ApiSchema_Flight_Media)
}))


export default router
