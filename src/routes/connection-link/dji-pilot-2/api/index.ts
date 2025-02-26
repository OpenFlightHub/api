import express, { Request, Response, NextFunction } from 'express';
import {getWorkspaceIdFromUUID} from '../../../../util/djiPilot2SDK'
import { GuardError } from '../../../../ManInTheMiddleware';

const router = express.Router()


const djiPilot2ApiAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    req.GM.guardDjiPilot2ApiIsAuthenticated().then(connection=>{

        const workspaceUUID = req.GM.guardParam('workspace_uuid', 'uuid')

        const workspaceId = getWorkspaceIdFromUUID(workspaceUUID)

        if(connection.workspace_id !== workspaceId){
            throw GuardError._403_Forbidden()
        }

        next()
    }).catch(err => {
        next(err)
    })

}

import mediaRoute from './media'
router.use('/media/api/v1/workspaces/:workspace_uuid', djiPilot2ApiAuthMiddleware, mediaRoute)

import storageRoute from './storage'
router.use('/storage/api/v1/workspaces/:workspace_uuid', djiPilot2ApiAuthMiddleware, storageRoute)


export default router
