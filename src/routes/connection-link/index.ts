import express, { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler'


import SecretsLoader from '../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets([
    'platform_name', 'platform_url'])

const router = express.Router()


const connectionLinkAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    req.GM.guardConnectionLinkIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

}

import authRoute from './auth'
import { selectWorkspace } from '../../db/DBHelpers';
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
        workspace_name: workspace.name,
        secret: req.GM.currentConnection.secret
    }, ApiSchema_ConnectionLinkConfig)

}))


import djiPilot2Route from './dji-pilot-2'

router.use('/dji-pilot-2', connectionLinkAuthMiddleware, djiPilot2Route)


export default router