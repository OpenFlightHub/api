import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone, selectRemoteController, selectRemoteControllerData } from '../db/DBHelpers';
import { ApiSchema_RemoteController, ApiSchema_RemoteControllerPosition } from '../definitions/ApiSchemas';
import { DBType_Connection, DBType_RemoteControllerData } from '../db/DBTypes';
import { ApiType_RemoteControllerPosition } from '../definitions/ApiTypes';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})




router.get('/:remote_controller_id', asyncHandler(async (req, res) => {

    const remoteControllerId = req.GM.guardParam('remote_controller_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE remote_controller_id = ${remoteControllerId}', {
        remoteControllerId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const remoteController = await req.GM.guardDBGone(()=>{
        return selectRemoteController(remoteControllerId)
    })

    res.GM.guardSend(remoteController, ApiSchema_RemoteController)
}))

router.get('/:remote_controller_id/last-position', asyncHandler(async (req, res) => {

    const remoteControllerId = req.GM.guardParam('remote_controller_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE remote_controller_id = ${remoteControllerId}', {
        remoteControllerId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const remoteControllerLastPosition = await req.GM.guardDBGone(()=>{
        return db.one<DBType_RemoteControllerData>('SELECT * FROM remote_controller_data WHERE remote_controller_id = ${remoteControllerId} AND type = 0 ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains longitude and latitude
            remoteControllerId
        })
    })

    const ret: ApiType_RemoteControllerPosition = {
        reported_at: remoteControllerLastPosition.created_at,
        longitude: remoteControllerLastPosition.data.longitude as number,
        latitude: remoteControllerLastPosition.data.latitude as number,
        height: remoteControllerLastPosition.data.height as number
    }

    res.GM.guardSend(ret, ApiSchema_RemoteControllerPosition)
}))


export default router
