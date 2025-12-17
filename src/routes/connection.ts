import express from 'express';
import asyncHandler from 'express-async-handler'
import { ApiSchema_Connection } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Connection } from '../generated-definitions/api/ApiTypes';
import { getCore } from '../core';

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
        return getCore().modules.connection.get(connectionId)
    })

    //@ts-ignore
    connection.drone_id = connection.last_drone_id // fix for api description

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    res.GM.guardSend<ApiType_Connection>(connection, ApiSchema_Connection)
}))

router.delete('/:connection_id', asyncHandler(async (req, res) => {

    const connectionId = req.GM.guardParam('connection_id', 'id')

    const connection = await req.GM.guardDBGone(()=>{
        return getCore().modules.connection.get(connectionId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    await getCore().modules.connection.delete(connectionId)

    res.status(200).send()
}))


export default router
