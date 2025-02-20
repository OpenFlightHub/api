import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { deleteFile, deleteWorkspace, insertWorkspace, selectFile, selectWorkspace, updateWorkspace } from '../db/DBHelpers';
import { ApiSchema_Reference, ApiSchema_Workspace, ApiSchema_WorkspaceConnections, ApiSchema_WorkspaceConnectionsPost, ApiSchema_WorkspaceConnectionsPostResponse, ApiSchema_WorkspaceFilePost, ApiSchema_WorkspacePatch, ApiSchema_WorkspacesPost } from '../definitions/ApiSchemas';
import { ApiType_Reference, ApiType_Workspace, ApiType_WorkspaceConnections, ApiType_WorkspaceConnectionsPost, ApiType_WorkspaceConnectionsPostResponse, ApiType_WorkspaceFilePost, ApiType_WorkspacePatch, ApiType_WorkspacesPost } from '../definitions/ApiTypes';
import { DBType_Connection, DBType_File, DBType_Workspace } from '../db/DBTypes';
import { createConnection } from '../util/connection';
import { deleteFileFromDatabaseAndFilesystem, multerMiddleware, storeTmpMulterFileInDatabase } from '../util/file';
import { MulterFile } from '../app';
import { GuardError } from '../ManInTheMiddleware';
const db : pgp.IDatabase<any> = global.db


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

    req.GM.guardSend<ApiType_Workspace[]>(workspaces, {type: 'array', items: ApiSchema_Workspace})

}))


router.post('/', asyncHandler(async (req, res) => {

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspacesPost>(ApiSchema_WorkspacesPost)

    const workspace = await insertWorkspace(requestBody)

    res.GM.guardSend<ApiType_Workspace>(workspace, ApiSchema_Reference)
}))


router.get('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const workspace = await req.GM.guardDBGone<DBType_Workspace>(()=>{
        return selectWorkspace(workspaceId)
    })

    res.GM.guardSend<ApiType_Workspace>(workspace, ApiSchema_Workspace)
}))


router.patch('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspacePatch>(ApiSchema_WorkspacePatch)

    const updatedWorkspace = await req.GM.guardDBGone(()=>{
        return updateWorkspace(requestBody, workspaceId)
    })

    res.GM.guardSend<ApiType_Workspace>(updatedWorkspace, ApiSchema_Workspace)
}))

router.delete('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    await deleteWorkspace(workspaceId)

    res.status(200).send()
}))

// connection


router.get('/:workspace_id/connections', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const connections = await db.manyOrNone<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId};', {
        workspaceId
    })

    req.GM.guardSend<ApiType_WorkspaceConnections>(connections, ApiSchema_WorkspaceConnections)

}))

router.post('/:workspace_id/connections', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_WorkspaceConnectionsPost>(ApiSchema_WorkspaceConnectionsPost)

    const connection = await createConnection(workspaceId)//TODO implement requestBody.name or remove from API spec

    res.GM.guardSend<ApiType_WorkspaceConnectionsPostResponse>({
        connection_id: '' + connection.id,
        secret: connection.secret
    }, ApiSchema_WorkspaceConnectionsPostResponse)

}))

router.post('/:workspace_id/file', multerMiddleware.single('file'), asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    if(!req.file){
        throw GuardError._400_invalidBody('file')
    }

    const file = await storeTmpMulterFileInDatabase(req.file, workspaceId, (await req.GM.getCurrentUser()).id)

    res.GM.guardSend<ApiType_Reference>(file, ApiSchema_Reference)
}))

router.patch('/:workspace_id/file/:file_id', multerMiddleware.single('file'), asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const fileId = req.GM.guardParam('file_id', 'id')

    await req.GM.guardDBGone(()=>{
        return db.one<DBType_File>('SELECT * FROM files WHERE workspace_id = ${workspaceId} AND id = ${id};', {
            id: fileId,
            workspaceId
        })
    })

    if(!req.file){
        throw GuardError._400_invalidBody('file')
    }

    const file = await storeTmpMulterFileInDatabase(req.file, workspaceId, (await req.GM.getCurrentUser()).id)

    res.GM.guardSend<ApiType_Reference>(file, ApiSchema_Reference)
}))

router.delete('/:workspace_id/file/:file_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return selectWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const fileId = req.GM.guardParam('file_id', 'id')

    await req.GM.guardDBGone(()=>{
        return db.one<DBType_File>('SELECT * FROM files WHERE workspace_id = ${workspaceId} AND id = ${id};', {
            id: fileId,
            workspaceId
        })
    })

    await deleteFileFromDatabaseAndFilesystem(fileId)

    res.status(200).send()
}))

export default router
