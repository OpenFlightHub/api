import express from 'express';
import { ApiSchema_Team, ApiSchema_Team_Patch } from '../generated-definitions/api/ApiSchemas';
import asyncHandler from 'express-async-handler'
import { ApiType_Team, ApiType_Team_Patch } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { getCore } from '../core';


const router = express.Router()


router.get('/:team_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const team_id = req.GM.guardParam('team_id', 'id')

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

export default router
