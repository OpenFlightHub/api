import express, { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler'


import SecretsLoader from '../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets([
    'platform_name', 'platform_url'])

const router = express.Router()


export function connectionLinkAuthMiddleware(req: Request, res: Response, next: NextFunction){

    req.GM.guardConnectionLinkIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

}

import authRoute from './auth'
import { selectWorkspace, updateConnection, updateWorkspace } from '../../db/DBHelpers';
import { ApiSchema_ConnectionLinkConfig } from '../../definitions/ApiSchemas';
import { ApiType_ConnectionLinkConfig } from '../../definitions/ApiTypes';

router.use('/auth', authRoute)

router.get('/config', connectionLinkAuthMiddleware, asyncHandler(async(req, res)=>{

    const workspace = await selectWorkspace(req.GM.currentConnection.workspace_id)

    res.GM.guardSend<ApiType_ConnectionLinkConfig>({
        connection_id: '' + req.GM.currentConnection.id,
        platform_name: secrets.platform_name,
        platform_url: secrets.platform_url,
        workspace_id: '' + workspace.id,
        workspace_uuid: req.GM.currentConnection.workspace_uuid,
        workspace_name: workspace.name,
        secret: req.GM.currentConnection.secret
    }, ApiSchema_ConnectionLinkConfig)

}))


router.post('/reset-workspace-uuid', connectionLinkAuthMiddleware, asyncHandler(async(req, res)=>{

    // fixes dji remote controller caching some data for workspace uuids (e.g. uploaded images). If e.g. the image was deleted in the db, this can brick the upload process

    await updateConnection({
        workspace_uuid: getRandomUUIDFromWorkspaceId(req.GM.currentConnection.workspace_id)
    }, req.GM.currentConnection.id)

    res.status(200).send()

}))


import djiPilot2Route from './dji-pilot-2'
import { getRandomUUIDFromWorkspaceId } from '../../util/connection';

router.use('/dji-pilot-2', djiPilot2Route)


export default router