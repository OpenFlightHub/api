import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectFlight } from '../db/DBHelpers';
import { ApiSchema_Flight, ApiSchema_FlightMedia } from '../definitions/ApiSchemas';
import { ApiType_Flight, ApiType_FlightMedia } from '../definitions/ApiTypes';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
import { assignObject } from '../util/typescript';
import {getTrackForFlight} from '../util/flight'
import { DBType_DroneMedia } from '../db/DBTypes';
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
router.use('/:flight_id', asyncHandler(async(req, res, next) => {

    const flightId = req.GM.guardParam('flight_id', 'id')

    const flight = await req.GM.guardDBGone(()=>{
        return selectFlight(flightId)
    })

    const connection = await getLastConnectionForDrone(flight.drone_id)

    if(!connection){
        // connection deleted or last_connection_id was never set
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    req._flight = flight

    next()
}))




router.get('/:flight_id', asyncHandler(async (req, res) => {

    const track = await getTrackForFlight(req._flight.id)

    res.GM.guardSend<ApiType_Flight>(assignObject({track}, req._flight), ApiSchema_Flight)
}))


router.get('/:flight_id/media', asyncHandler(async (req, res) => {

    const flightId = req.GM.guardParam('flight_id', 'id')

    const flightMedia = await db.manyOrNone<DBType_DroneMedia & {file_name: string}>('SELECT drone_media.*, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE flight_id = ${flightId}', {
        flightId
    })

    res.GM.guardSend<ApiType_FlightMedia>(flightMedia.map(m => parseCameraMetaOfMedia(m)), ApiSchema_FlightMedia)
}))


export default router
