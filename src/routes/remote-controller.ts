import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone, selectRemoteController } from '../db/DBHelpers';
import { ApiSchema_RemoteController } from '../definitions/ApiSchemas';
import { DBType_Connection } from '../db/DBTypes';
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

    const drone = await req.GM.guardDBGone(()=>{
        return selectRemoteController(remoteControllerId)
    })

    res.GM.guardSend(drone, ApiSchema_RemoteController)
}))


export default router
