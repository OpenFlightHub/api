import express, { Request } from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Reference, ApiSchema_Workspace, ApiSchema_Workspace_Connections, ApiSchema_Workspace_Connections_Post, ApiSchema_Workspace_Connections_Post_Response, ApiSchema_Workspace_Files, ApiSchema_Workspace_Patch, ApiSchema_Workspaces_Post } from '../../generated-definitions/api/ApiSchemas';
import { ApiType_Reference, ApiType_Workspace, ApiType_Workspace_Connections, ApiType_Workspace_Connections_Post, ApiType_Workspace_Connections_Post_Response, ApiType_Workspace_Files, ApiType_Workspace_Patch, ApiType_Workspaces_Post } from '../../generated-definitions/api/ApiTypes';
import { DBType_Connection, DBType_File, DBType_Workspace } from '../../generated-definitions/db/DBTypes';
import { MulterFile } from '../../app';
import { GuardError } from '../../ManInTheMiddleware';
import { getCore } from '../../core';
import { multerMiddleware } from '../../util/multer';
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

    const requestBody = req.GM.guardBodySchema<ApiType_Workspaces_Post>(ApiSchema_Workspaces_Post)

    const workspace = await getCore().modules.workspace.createWorkspace(requestBody)

    res.GM.guardSend<ApiType_Workspace>(workspace, ApiSchema_Reference)
}))


router.get('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const workspace = await getCore().modules.workspace.getWorkspace(workspaceId)

    if(workspace === false){
        throw GuardError._410_Gone()
    }

    res.GM.guardSend<ApiType_Workspace>(workspace, ApiSchema_Workspace)
}))


router.patch('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_Workspace_Patch>(ApiSchema_Workspace_Patch)

    const updatedWorkspace = await getCore().modules.workspace.updateWorkspaceSafe(workspaceId, requestBody)

    res.GM.guardSend<ApiType_Workspace>(updatedWorkspace, ApiSchema_Workspace)
}))

router.delete('/:workspace_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    await getCore().modules.workspace.deleteWorkspace(workspaceId)

    res.status(200).send()
}))

// connection


router.get('/:workspace_id/connections', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const connections = await db.manyOrNone<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId};', {
        workspaceId
    })

    //@ts-ignore
    connections.forEach(c => c.drone_id = c.last_drone_id)// fix for api description

    req.GM.guardSend<ApiType_Workspace_Connections>(connections, ApiSchema_Workspace_Connections)

}))

router.post('/:workspace_id/connections', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const requestBody = req.GM.guardBodySchema<ApiType_Workspace_Connections_Post>(ApiSchema_Workspace_Connections_Post)

    const connection = await getCore().modules.connection.createConnection(workspaceId, requestBody.name)

    res.GM.guardSend<ApiType_Workspace_Connections_Post_Response>({
        connection_id: '' + connection.id,
        secret: connection.secret
    }, ApiSchema_Workspace_Connections_Post_Response)

}))



router.get('/:workspace_id/files', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const files = await db.manyOrNone<DBType_File>('SELECT * FROM files WHERE workspace_id = ${workspaceId}', {
        workspaceId
    })

    res.GM.guardSend<ApiType_Workspace_Files>(files, ApiSchema_Workspace_Files)

}))

router.post('/:workspace_id/file', multerMiddleware.single('file'), asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    if(!(req as Request & {file: MulterFile}).file){
        throw GuardError._400_invalidBody('file')
    }

    const file = await getCore().modules.file.storeTmpMulterFileInDatabase((req as Request & {file: MulterFile}).file, workspaceId, (await req.GM.getCurrentUser()).id)

    res.GM.guardSend<ApiType_Reference>(file, ApiSchema_Reference)
}))

router.patch('/:workspace_id/file/:file_id', multerMiddleware.single('file'), asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const fileId = req.GM.guardParam('file_id', 'id')

    await req.GM.guardDBGone(()=>{
        return db.one<DBType_File>('SELECT * FROM files WHERE workspace_id = ${workspaceId} AND id = ${id};', {
            id: fileId,
            workspaceId
        })
    })

    if(!(req as Request & {file: MulterFile}).file){
        throw GuardError._400_invalidBody('file')
    }

    throw new Error('not implementet')
    //TODO fix this broken code
    // we currently create a new file, instead of changing the old file

    const file = await getCore().modules.file.storeTmpMulterFileInDatabase((req as Request & {file: MulterFile}).file, workspaceId, (await req.GM.getCurrentUser()).id)

    res.GM.guardSend<ApiType_Reference>(file, ApiSchema_Reference)
}))

router.delete('/:workspace_id/file/:file_id', asyncHandler(async (req, res) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    const workspace = req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const fileId = req.GM.guardParam('file_id', 'id')

    const file = await req.GM.guardDBGone(()=>{
        return db.one<DBType_File>('SELECT * FROM files WHERE workspace_id = ${workspaceId} AND id = ${id};', {
            id: fileId,
            workspaceId
        })
    })

    await getCore().modules.file.deleteFile(file.id)

    res.status(200).send()
}))


router.use('/:workspace_id/map-elements', (req, res, next) => {//TODO if this check actually happens first before any other processing

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    req.GM.guardDBGone(()=>{
        return getCore().modules.workspace.getWorkspace(workspaceId)
    }).then(()=>{
        req.GM.guardUserHasPermissionForWorkspace(workspaceId).then(()=>{
            //@ts-ignore
            req._workspaceId = workspaceId
            next()
        }).catch(err => {
            next(err)
        })
    }).catch(err => {
        next(err)
    })

})

import geoObjectsRoute from './geo-objects'
router.use('/:workspace_id/geo-objects', geoObjectsRoute)

export default router
