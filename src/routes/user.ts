import express from 'express';
import { DBType_User } from '../generated-definitions/db/DBTypes';
import { ApiSchema_User, ApiSchema_User_Patch, ApiSchema_User_Self } from '../generated-definitions/api/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { select_User, update_User } from '../generated-definitions/db/DBHelpers';
import { ApiType_User, ApiType_User_Patch, ApiType_User_Self } from '../generated-definitions/api/ApiTypes';
import pgp from 'pg-promise'
import { GuardError } from '../ManInTheMiddleware';
import { assignObject } from '../util/typescript'


const router = express.Router()


router.get('/self', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    res.GM.guardSend<ApiType_User_Self>(
        assignObject(user, {registration_incomplete: typeof user.password !== 'string'}),
        ApiSchema_User_Self
    )

}))

router.get('/:user_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const user_id = req.GM.guardParam('user_id', 'id')

    const user = await req.GM.guardDBGone<DBType_User>(()=>{
        return select_User(user_id)
    })

    res.GM.guardSend<ApiType_User>(user, ApiSchema_User)
}))

router.patch('/:user_id', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    const user_id = req.GM.guardParam('user_id', 'id')

    if(user_id !== user.id){
        throw GuardError._403_Forbidden('you can only modify your own account')
    }

    const newUser = req.GM.guardBodySchema<ApiType_User_Patch>(ApiSchema_User_Patch)

    //TODO add additional check for when user wants to change his email (and let them confirm it)

    const updatedUser = await update_User(newUser, user.id)

    res.GM.guardSend<ApiType_User_Self>(
        assignObject(updatedUser, {registration_incomplete: typeof updatedUser.password !== 'string'}),
        ApiSchema_User_Self
    )
}))

export default router
