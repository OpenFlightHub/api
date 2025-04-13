import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectConnection, selectDrone, selectDroneMedia } from '../db/DBHelpers';
import { ApiSchema_Drone, ApiSchema_DroneBattery, ApiSchema_DroneMedia, ApiSchema_DronePosition, ApiSchema_Media } from '../definitions/ApiSchemas';
import { DBType_Connection, DBType_Drone, DBType_DroneData, DBType_DroneMedia } from '../db/DBTypes';
import { ApiType_Drone, ApiType_DroneBattery, ApiType_DroneMedia, ApiType_DronePosition, ApiType_Media } from '../definitions/ApiTypes';
import { DRONE_DATA_TYPES, getLastPositionOfDrone as getLastPositionOfDrone, getLastTelemetryOfDrone } from '../util/drone';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})

router.get('/:media_id', asyncHandler(async(req, res) => {

    const mediaId = req.GM.guardParam('media_id', 'id')

    const media = await req.GM.guardDBGone(()=>{
        return db.one<DBType_DroneMedia & {created_at: string, file_name: string}>('SELECT drone_media.*, files.created_at, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE drone_media.id = ${mediaId}', {
            mediaId
        })
    })

    const drone = await selectDrone(media.drone_id)
    const connection = await getLastConnectionForDrone(drone)

    if(!connection){
        // connection deleted or last_connection_id was never set
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    res.GM.guardSend<ApiType_Media>(media, ApiSchema_Media)
}))

export default router
