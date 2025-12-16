import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { select_Drone, select_Remote_Controller, select_Remote_Controller_Data } from '../generated-definitions/db/DBHelpers';
import { ApiSchema_Remote_Controller, ApiSchema_Remote_Controller_Position } from '../generated-definitions/api/ApiSchemas';
import { DBType_Connection, DBType_Remote_Controller_Data } from '../generated-definitions/db/DBTypes';
import { ApiType_Remote_Controller, ApiType_Remote_Controller_Position } from '../generated-definitions/api/ApiTypes';
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
        return remoteController(remoteControllerId)
    })

    res.GM.guardSend<ApiType_Remote_Controller>(remoteController, ApiSchema_Remote_Controller)
}))

router.get('/:remote_controller_id/last-position', asyncHandler(async (req, res) => {

    const remoteControllerId = req.GM.guardParam('remote_controller_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE remote_controller_id = ${remoteControllerId}', {
        remoteControllerId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const remoteControllerLastPosition = await req.GM.guardDBGone(()=>{
        return db.one<DBType_Remote_Controller_Data>('SELECT * FROM remote_controller_data WHERE remote_controller_id = ${remoteControllerId} AND type = 0 ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains longitude and latitude
            remoteControllerId
        })
    })

    const ret: ApiType_Remote_Controller_Position = {
        reported_at: remoteControllerLastPosition.created_at,
        longitude: remoteControllerLastPosition.data.longitude as number,
        latitude: remoteControllerLastPosition.data.latitude as number,
        height: remoteControllerLastPosition.data.height as number
    }

    res.GM.guardSend<ApiType_Remote_Controller_Position>(ret, ApiSchema_Remote_Controller_Position)
}))


export default router
