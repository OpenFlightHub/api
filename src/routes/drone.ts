import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { selectDrone } from '../db/DBHelpers';
import { ApiSchema_Drone } from '../definitions/ApiSchemas';
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




router.get('/:drone_id', asyncHandler(async (req, res) => {

    const droneId = req.GM.guardParam('drone_id', 'id')

    const connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE drone_id = ${droneId}', {
        droneId
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    const drone = await req.GM.guardDBGone(()=>{
        return selectDrone(droneId)
    })

    res.GM.guardSend(drone, ApiSchema_Drone)
}))


export default router
