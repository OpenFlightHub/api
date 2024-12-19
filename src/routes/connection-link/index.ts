import express, { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler'

const router = express.Router()

import djiPilot2Route from './dji-pilot-2'


const connectionLinkAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    req.GM.guardConnectionLinkIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

}

import authRoute from './auth'
import { selectWorkspace } from '../../db/DBHelpers';
import { ApiSchema_ConnectionLinkMyWorkspace } from '../../definitions/ApiSchemas';
import { ApiType_ConnectionLinkMyWorkspace } from '../../definitions/ApiTypes';
router.use('/auth', authRoute)

router.get('/my-workspace', connectionLinkAuthMiddleware, asyncHandler(async(req, res)=>{

    const workspace = await selectWorkspace(req.GM.currentConnection.workspace_id)

    res.GM.guardSend<ApiType_ConnectionLinkMyWorkspace>({
        id: '' + workspace.id,
        name: workspace.name
    }, ApiSchema_ConnectionLinkMyWorkspace)

}))

router.use('/dji-pilot-2', connectionLinkAuthMiddleware, djiPilot2Route)

export default router