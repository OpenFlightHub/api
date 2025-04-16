import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../db/DBHelpers';
import { ApiSchema_Media, ApiSchema_MediaGroundCoverage } from '../definitions/ApiSchemas';
import { DBType_DroneMedia } from '../db/DBTypes';
import { ApiType_Media, ApiType_MediaGroundCoverage } from '../definitions/ApiTypes';
import { getLastConnectionForDrone } from '../util/connection';
import { GuardError } from '../ManInTheMiddleware';
import { readFile } from 'fs/promises';
import { getAbsoluteFilePathForFileId } from '../util/file';
import { getMetaFromImage } from '../util/media';
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


    const buf = await readFile(await getAbsoluteFilePathForFileId(media.file_id))

    const meta = await getMetaFromImage(buf)

    if(!meta.position || !meta.altitude || !meta.fov || !meta.gimbal){
        throw GuardError._410_Gone()
    }

    const response = await fetch('http://localhost:6007/camera-ground-coverage', {
        body: JSON.stringify({
            longitude: meta.position.longitude,
            latitude: meta.position.latitude,
            altitude: meta.altitude - 50,//TODO remove this dirty geoid fix
            heading: meta.gimbal.yaw,
            pitch: meta.gimbal.pitch,
            fovVertical: meta.fov.angular.vertical,
            fovHorizontal: meta.fov.angular.horizontal
            //TODO implement camera roll?
        }),
        method: 'post',
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })


    if(('' + response.status).startsWith('2') === false){
        throw new Error(response.statusText + ': ' + await response.text())
    }

    const obj = JSON.parse(await response.text())
    res.GM.guardSend(obj, ApiSchema_MediaGroundCoverage)

}))

export default router
