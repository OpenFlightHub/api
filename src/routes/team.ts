import express from 'express';
import { ApiSchema_Reference, ApiSchema_Team, ApiSchema_Team_Members, ApiSchema_Team_Patch, ApiSchema_Team_Post } from '../generated-definitions/api/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { ApiType_Reference, ApiType_Team, ApiType_Team_Members, ApiType_Team_Patch, ApiType_Team_Post } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { getCore } from '../core';


const router = express.Router()


router.get('/:team_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const team_id = req.GM.guardParam('team_id', 'id')

    if(await getCore().modules.team.userCanViewTeam((await req.GM.getCurrentUser()).id, team_id) === false){
        throw GuardError._403_Forbidden()
    }

    const team = await getCore().modules.team.getTeam(team_id)

    if(team === false){
        throw GuardError._410_Gone()
    }

    res.GM.guardSend<ApiType_Team>(team, ApiSchema_Team)
}))

router.patch('/:team_id', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    const team_id = req.GM.guardParam('team_id', 'id')

    if(await getCore().modules.team.userCanEditTeam(user.id, team_id) === false){
        throw GuardError._403_Forbidden()
    }

    const newTeam = req.GM.guardBodySchema<ApiType_Team_Patch>(ApiSchema_Team_Patch)

    const updatedTeam = await getCore().modules.team.updateTeamSafe(team_id, newTeam)

    res.GM.guardSend<ApiType_Team>(
        updatedTeam,
        ApiSchema_Team
    )
}))

router.get('/:team_id/members', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const team_id = req.GM.guardParam('team_id', 'id')

    const team = await getCore().modules.team.getTeam(team_id)

    if(team === false){
        throw GuardError._410_Gone()
    }

    if(await getCore().modules.team.userCanViewTeam((await req.GM.getCurrentUser()).id, team_id) === false){
        throw GuardError._403_Forbidden()
    }

    res.GM.guardSend<ApiType_Team_Members>(await getCore().modules.team.getTeamMembers(team_id), ApiSchema_Team_Members)
}))

router.post('/', asyncHandler(async (req, res) => {

    const user = await req.GM.guardUserIsAuthenticated()

    const requestBody = req.GM.guardBodySchema<ApiType_Team_Post>(ApiSchema_Team_Post)

    const organisation = await getCore().modules.organisation.getOrganisation(requestBody.organisation_id)

    if(organisation === false){
        throw GuardError._400_invalidBody('organisation_id')
    }

    if(await getCore().modules.organisation.userOwnsOrganisation(user.id, organisation.id) === false){
        throw GuardError._403_Forbidden()
    }

    const ownerUser = await getCore().modules.user.getUser(requestBody.owner_user_id)

    if(ownerUser === false){
        throw GuardError._400_invalidBody('owner_user_id')
    }

    const team = await getCore().modules.team.createTeam(requestBody)

    res.GM.guardSend<ApiType_Reference>(
        team,
        ApiSchema_Reference
    )
}))

export default router
