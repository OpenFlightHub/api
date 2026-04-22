import express from 'express';
import { DBType_User } from '../generated-definitions/db/DBTypes';
import { ApiSchema_Admin_User_Post, ApiSchema_Reference } from '../generated-definitions/api/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { ApiType_Admin_User_Post, ApiType_Reference } from '../generated-definitions/api/ApiTypes';
import { getCore } from '../core';


const router = express.Router()


router.post('/user', asyncHandler(async (req, res) => {

    const currentUser = await req.GM.guardUserIsAdmin()

    const userToCreate = req.GM.guardBodySchema<ApiType_Admin_User_Post>(ApiSchema_Admin_User_Post)

    let createdUser: DBType_User

    if(typeof userToCreate.name === 'string' && userToCreate.name.length > 0){
        createdUser = await getCore().modules.user.createUser({
            email: userToCreate.email,
            name: userToCreate.name
        }, currentUser.id)
    } else {
        createdUser = await getCore().modules.user.createUserFromEmail(userToCreate.email, currentUser.id)
    }

    res.GM.guardSend<ApiType_Reference>(
        createdUser,
        ApiSchema_Reference
    )
}))

export default router
