import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db



const router = express.Router()


router.get('/sdk-config', asyncHandler(async (req, res) => {


    //TODO

}))

export default router
