import express, { Request, Response, NextFunction } from 'express';

const router = express.Router()


const djiPilot2ApiAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    req.GM.guardDjiPilot2ApiIsAuthenticated().then(connection=>{

        const workspaceId = req.GM.guardParam('workspace_id', 'id')

        if(connection.workspace_id !== workspaceId){
            throw GuardError._403_Forbidden()
        }

        next()
    }).catch(err => {
        next(err)
    })

}

import mediaRoute from './media'
import { GuardError } from '../../../../ManInTheMiddleware';
router.use('/media/api/v1/workspace/:workspace_id/', djiPilot2ApiAuthMiddleware, mediaRoute)


export default router
