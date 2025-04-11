import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { deleteConnection, selectConnection } from '../db/DBHelpers';
import { ApiSchema_Connection } from '../definitions/ApiSchemas';
import { ApiType_Connection } from '../definitions/ApiTypes';
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
        return selectConnection(connectionId)
    })

    //@ts-ignore
    connection.drone_id = connection.last_drone_id // fix for api description

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    res.GM.guardSend<ApiType_Connection>(connection, ApiSchema_Connection)
}))

router.delete('/:connection_id', asyncHandler(async (req, res) => {

    const connectionId = req.GM.guardParam('connection_id', 'id')

    const connection = await req.GM.guardDBGone(()=>{
        return selectConnection(connectionId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    await deleteConnection(connectionId)

    res.status(200).send()
}))


export default router
