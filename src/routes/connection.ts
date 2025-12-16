import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { delete_Connection, select_Connection } from '../generated-definitions/db/DBHelpers';
import { ApiSchema_Connection } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Connection } from '../generated-definitions/api/ApiTypes';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})




router.get('/:connection_id', asyncHandler(async (req, res) => {

    const connectionId = req.GM.guardParam('connection_id', 'id')

    const connection = await req.GM.guardDBGone(()=>{
        return select_Connection(connectionId)
    })

    //@ts-ignore
    connection.drone_id = connection.last_drone_id // fix for api description

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    res.GM.guardSend<ApiType_Connection>(connection, ApiSchema_Connection)
}))

router.delete('/:connection_id', asyncHandler(async (req, res) => {

    const connectionId = req.GM.guardParam('connection_id', 'id')

    const connection = await req.GM.guardDBGone(()=>{
        return select_Connection(connectionId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    await delete_Connection(connectionId)

    res.status(200).send()
}))


export default router
