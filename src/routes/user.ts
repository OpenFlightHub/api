import express from 'express';
import { DBType_User } from '../db/DBTypes';
import { ApiSchema_User, ApiSchema_UserPatch, ApiSchema_UserSelf } from '../definitions/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { selectUser, updateUser } from '../db/DBHelpers';
import { ApiType_UserPatch } from '../definitions/ApiTypes';
import pgp from 'pg-promise'
import { GuardError } from '../ManInTheMiddleware';


const router = express.Router()


router.get('/self', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    Object.assign(user, {registration_incomplete: typeof user.password !== 'string'})

    res.GM.guardSend(user, ApiSchema_UserSelf)
}))

router.get('/:user_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const user_id = req.GM.guardParam('user_id', 'id')

    const user = await req.GM.guardDBGone<DBType_User>(()=>{
        return selectUser(user_id)
    })

    res.GM.guardSend(user, ApiSchema_User)
}))

router.patch('/:user_id', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    const user_id = req.GM.guardParam('user_id', 'id')

    if(user_id !== user.id){
        throw GuardError._403_Forbidden('you can only modify your own account')
    }

    const newUser = req.GM.guardBodySchema<ApiType_UserPatch>(ApiSchema_UserPatch)

    //TODO add additional check for when user wants to change his email (and let them confirm it)

    const updatedUser = await updateUser(newUser, user.id)

    Object.assign(updatedUser, {registration_incomplete: typeof updatedUser.password !== 'string'})


    res.GM.guardSend(updatedUser, ApiSchema_UserSelf)
}))

export default router
