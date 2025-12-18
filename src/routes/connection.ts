import express from 'express';
import asyncHandler from 'express-async-handler'
import { ApiSchema_Connection } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Connection } from '../generated-definitions/api/ApiTypes';
import { getCore } from '../core';
import { GuardError } from '../ManInTheMiddleware';

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

    const connection = await getCore().modules.connection.getConnection(connectionId)

    if(connection === false){
        throw GuardError._410_Gone()
    }

    //@ts-ignore
    connection.drone_id = connection.last_drone_id // fix for api description

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    res.GM.guardSend<ApiType_Connection>(connection, ApiSchema_Connection)
}))

router.delete('/:connection_id', asyncHandler(async (req, res) => {

    const connectionId = req.GM.guardParam('connection_id', 'id')

    const connection = await getCore().modules.connection.getConnection(connectionId)

    if(connection === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(connection.workspace_id)

    await getCore().modules.connection.deleteConnection(connectionId)

    res.status(200).send()
}))


export default router
