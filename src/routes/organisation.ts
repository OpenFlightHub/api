import express from 'express';
import { ApiSchema_Organisation } from '../generated-definitions/api/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { ApiType_Organisation, ApiType_Organisation_Patch } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { getCore } from '../core';


const router = express.Router()


router.get('/:organisation_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const organisation_id = req.GM.guardParam('organisation_id', 'id')

    const organisation = await getCore().modules.organisation.getOrganisation(organisation_id)

    if(organisation === false){
        throw GuardError._410_Gone()
    }

    res.GM.guardSend<ApiType_Organisation>(organisation, ApiSchema_Organisation)
}))

router.patch('/:organisation_id', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    const organisation_id = req.GM.guardParam('organisation_id', 'id')

    if(await getCore().modules.organisation.userCanEditOrganisation(user.id, organisation_id) === false){
        throw GuardError._403_Forbidden('you can only modify your own organisation')
    }

    const newOrganisation = req.GM.guardBodySchema<ApiType_Organisation_Patch>(ApiSchema_Organisation)

    const updatedOrganisation = await getCore().modules.organisation.updateOrganisationSafe(organisation_id, newOrganisation)

    res.GM.guardSend<ApiType_Organisation>(
        updatedOrganisation,
        ApiSchema_Organisation
    )
}))

export default router
