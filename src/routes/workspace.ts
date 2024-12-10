import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { deleteConnection, deleteWorkspace, insertWorkspace, selectConnection, selectWorkspace, updateWorkspace } from '../db/DBHelpers';
import { ApiSchema_Reference, ApiSchema_Workspace, ApiSchema_WorkspaceConnection, ApiSchema_WorkspaceConnectionsPost, ApiSchema_WorkspaceConnectionsPostResponse, ApiSchema_WorkspacePatch, ApiSchema_WorkspacesPost } from '../definitions/ApiSchemas';
import { ApiType_WorkspaceConnectionsPost, ApiType_WorkspaceConnectionsPostResponse, ApiType_WorkspacePatch, ApiType_WorkspacesPost } from '../definitions/ApiTypes';
import { DBType_Connection, DBType_Workspace } from '../db/DBTypes';
const db : pgp.IDatabase<any> = global.db
import { createConnection } from '../util/connection'


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})

router.get('/my-workspaces', asyncHandler(async (req, res) => {

    const user = await req.GM.getCurrentUser()

    const workspaces = await db.manyOrNone('SELECT workspaces.* FROM workspaces INNER JOIN workspace_permissions ON workspace_permissions.workspace_id = workspaces.id WHERE workspace_permissions.user_id = ${user_id};', {
        user_id: user.id
    })

    req.GM.guardSend(workspaces, {type: 'array', items: ApiSchema_Workspace})

}))


router.post('/', asyncHandler(async (req, res) => {

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspacesPost>(ApiSchema_WorkspacesPost)

    const workspace = await insertWorkspace(requestBody)

    res.GM.guardSend(workspace, ApiSchema_Reference)
}))


router.get('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const workspace = await req.GM.guardDBGone<DBType_Workspace>(()=>{
        return selectWorkspace(workspaceId)
    })

    res.GM.guardSend(workspace, ApiSchema_Workspace)
}))


router.patch('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspacePatch>(ApiSchema_WorkspacePatch)

    const updatedWorkspace = await req.GM.guardDBGone(()=>{
        return updateWorkspace(requestBody, workspaceId)
    })

    res.GM.guardSend(updatedWorkspace, ApiSchema_Workspace)
}))

router.delete('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    await deleteWorkspace(workspaceId)

    res.status(200).send()
}))




// connections


router.get('/:workspace_id/connections/lest', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const connections = await db.manyOrNone<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId};', {
        workspaceId
    })

    req.GM.guardSend(connections, {type: 'array', items: ApiSchema_WorkspaceConnection})

}))


router.post('/:workspace_id/connections', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspaceConnectionsPost>(ApiSchema_WorkspaceConnectionsPost)

    const connection = await createConnection(workspaceId, requestBody.name)

    res.GM.guardSend({
        id: '' + connection.id,
        secret: connection.access_key
    } as ApiType_WorkspaceConnectionsPostResponse, ApiSchema_WorkspaceConnectionsPostResponse)

}))


router.get('/:workspace_id/connections/:connection_id', asyncHandler(async (req, res) => {


    const workspaceId = req.GM.guardParam('workspace_id', 'id')
    const connectionId = req.GM.guardParam('connection_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const connection = req.GM.guardDBGone(()=>{
        return db.one<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId} AND id = ${connectionId}', {
            workspaceId,
            connectionId
        })
    })

    res.GM.guardSend(connection, ApiSchema_WorkspaceConnection)
}))

router.delete('/:workspace_id/connections/:connection_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')
    const connectionId = req.GM.guardParam('connection_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const connection = req.GM.guardDBGone(()=>{
        return db.one<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId} AND id = ${connectionId}', {
            workspaceId,
            connectionId
        })
    })

    await deleteConnection(connectionId)

    res.status(200).send()
}))


export default router
