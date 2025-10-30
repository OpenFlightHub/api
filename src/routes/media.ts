import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../generated-definitions/db/DBHelpers';
import { ApiSchema_Media, ApiSchema_MediaGroundCoverage } from '../generated-definitions/api/ApiSchemas';
import { DBType_DroneMedia } from '../generated-definitions/db/DBTypes';
import { ApiType_Media } from '../generated-definitions/api/ApiTypes';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
import { getDroneMetaFromFile, getMediaCoverage, parseCameraMetaOfMedia } from '../util/media';
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
        return db.one<DBType_DroneMedia & {file_name: string}>('SELECT drone_media.*, files.name as file_name FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE drone_media.id = ${mediaId}', {
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

    res.GM.guardSend<ApiType_Media>(parseCameraMetaOfMedia(media), ApiSchema_Media)
}))



router.get('/ground-coverage/:media_id', asyncHandler(async(req, res) => {

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


    const meta = await getDroneMetaFromFile(media.file_id)

    if(meta === false){
        throw GuardError._410_Gone()
    }

    if(!meta.position || !meta.altitude || !meta.fov || !meta.gimbal){
        throw GuardError._410_Gone()
    }

    const coverage = await getMediaCoverage(media)

    if(coverage === false){
        throw GuardError._410_Gone()
    }

    res.GM.guardSend(coverage, ApiSchema_MediaGroundCoverage)

}))

export default router
