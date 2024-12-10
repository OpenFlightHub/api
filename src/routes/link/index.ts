import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db

const router = express.Router()

import djiPilot2Route from './dji-pilot-2'


router.use((req, res, next) => {

    req.GM.guardLinkIsAuthenticatedAsConnection().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})


router.use('/dji-pilot-2', djiPilot2Route)

export default router