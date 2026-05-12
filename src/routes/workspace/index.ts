import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Reference, ApiSchema_Workspace, ApiSchema_Workspaces_Post } from '../../generated-definitions/api/ApiSchemas';
import { ApiType_Workspace, ApiType_Workspaces_Post } from '../../generated-definitions/api/ApiTypes';
import { GuardError } from '../../ManInTheMiddleware';
import { getCore } from '../../core';
import { assignObject } from '../../util/typescript';
import existingWorkspaceRoute from './existing_workspace'

//@ts-ignore
const db = global.db as pgp.IDatabase<any>


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

    if(typeof user.team_id !== 'number'){
        req.GM.guardSend([], {type: 'array'})
        return
    }

    const workspaces = await db.manyOrNone('SELECT workspaces.* FROM workspaces INNER JOIN workspace_permissions ON workspace_permissions.workspace_id = workspaces.id WHERE workspace_permissions.team_id = ${team_id};', {
        team_id: user.team_id
    })

    req.GM.guardSend<ApiType_Workspace[]>(workspaces, {type: 'array', items: ApiSchema_Workspace})

}))


router.post('/', asyncHandler(async (req, res) => {

    const requestBody = req.GM.guardBodySchema<ApiType_Workspaces_Post>(ApiSchema_Workspaces_Post)

    const workspace = await getCore().modules.workspace.createWorkspace(assignObject(requestBody, {
        created_by: (await req.GM.getCurrentUser()).id
    }))

    res.GM.guardSend<ApiType_Workspace>(workspace, ApiSchema_Reference)
}))


router.use('/:workspace_id', asyncHandler(async (req, res, next) => {

    const workspaceId = req.GM.guardParam('workspace_id', 'id')

    await req.GM.guardUserHasPermissionForWorkspace(workspaceId)

    const workspace = await getCore().modules.workspace.getWorkspace(workspaceId)

    if(workspace === false){
        throw GuardError._410_Gone()
    }

    //@ts-ignore
    req._workspace = workspace

    next()
}), existingWorkspaceRoute)


export default router
