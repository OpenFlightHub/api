import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../db/DBHelpers';
import { ApiSchema_Drone, ApiSchema_DroneBattery, ApiSchema_DroneMedia, ApiSchema_DronePosition } from '../definitions/ApiSchemas';
import { DBType_Connection, DBType_DroneData, DBType_DroneMedia } from '../db/DBTypes';
import { ApiType_Drone, ApiType_DroneBattery, ApiType_DroneMedia, ApiType_DronePosition } from '../definitions/ApiTypes';
import { DRONE_DATA_TYPES, getLastPositionOfDrone as getLastPositionOfDrone, getLastTelemetryOfDrone } from '../util/drone';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})




router.get('/:drone_id', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const drone = await req.GM.guardDBGone(()=>{
        return selectDrone(droneId)
    })

    res.GM.guardSend<ApiType_Drone>(drone, ApiSchema_Drone)
}))




router.get('/:drone_id/last-position', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

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

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

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

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const droneMedia = await db.manyOrNone<DBType_DroneMedia & {created_at: string}>('SELECT drone_media.*, files.created_at FROM drone_media INNER JOIN files ON drone_media.file_id = files.id WHERE drone_id = ${droneId} ORDER BY drone_media.id DESC', {
        droneId
    })

    res.GM.guardSend<ApiType_DroneMedia>(droneMedia, ApiSchema_DroneMedia)
}))


export default router
