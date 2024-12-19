import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db

const router = express.Router()

import { ApiSchema_ConnectionLinkAuthLoginPost } from '../../definitions/ApiSchemas';
import { ApiType_ConnectionLinkAuthLoginPost } from '../../definitions/ApiTypes';
import { generateConnectionSessionCookieAndSet } from '../../util/cookie'
import { DBType_Connection } from '../../db/DBTypes';


function delay(callback: ()=>void){
    setTimeout(callback, 1000 * 0.5)
}

router.get('/check', asyncHandler(async(req, res)=>{

    await req.GM.guardConnectionLinkIsAuthenticated()

    res.status(200).send()

}))

router.post('/login', asyncHandler(async(req, res)=>{

    const body = req.GM.guardBodySchema<ApiType_ConnectionLinkAuthLoginPost>(ApiSchema_ConnectionLinkAuthLoginPost)


    try {
        let connection = await db.one<DBType_Connection>('SELECT * FROM connections WHERE id = ${id} AND secret = ${secret};', {
            id: body.connection_id,
            secret: body.secret
        })

        await generateConnectionSessionCookieAndSet(connection.id, res)

        res.status(200).send()

    } catch {

        delay(()=>{//delay request so people can't correlate that with email existance
            res.status(418).send()//should be 410 gone, but we dont want to tell anyone!
        })

        return
    }

}))

export default router