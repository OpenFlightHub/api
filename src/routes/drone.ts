import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../db/DBHelpers';
import { ApiSchema_Drone, ApiSchema_DroneBattery, ApiSchema_DronePosition } from '../definitions/ApiSchemas';
import { DBType_Connection, DBType_DroneData } from '../db/DBTypes';
import { ApiType_Drone, ApiType_DroneBattery, ApiType_DronePosition } from '../definitions/ApiTypes';
import { DRONE_DATA_TYPES } from '../util/drone';
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
        return db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains longitude and latitude
            type: DRONE_DATA_TYPES.POSITION,
            droneId
        })
    })

    const ret: ApiType_DronePosition = {
        reported_at: droneLastPosition.created_at,
        latitude: droneLastPosition.data.latitude as number,
        longitude: droneLastPosition.data.longitude as number,
        height: droneLastPosition.data.height as number
    }

    res.GM.guardSend<ApiType_DronePosition>(ret, ApiSchema_DronePosition)
}))


router.get('/:drone_id/last-battery', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const droneLastBattery = await req.GM.guardDBGone(()=>{
        return db.one<DBType_DroneData>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains longitude and latitude
            type: DRONE_DATA_TYPES.BATTERY,
            droneId
        })
    })

    const ret: ApiType_DroneBattery = {
        reported_at: droneLastBattery.created_at,
        capacity_percent_left: droneLastBattery.data.capacity_percent_left as number
    }

    res.GM.guardSend<ApiType_DroneBattery>(ret, ApiSchema_DroneBattery)
}))


export default router
