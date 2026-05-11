import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Mission, ApiSchema_Mission_Patch, ApiSchema_Mission_Post, ApiSchema_Reference } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Mission, ApiType_Mission_Patch, ApiType_Mission_Post, ApiType_Task } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { getCore } from '../core';
import { assignObject } from '../util/typescript';
import { ApiType_Mission_Tasks } from '../generated-definitions/api/ApiTypes';
import { ApiSchema_Mission_Tasks } from '../generated-definitions/api/ApiSchemas';
import { DBType_Mission_StateType } from '../generated-definitions/db/DBTypes';
//@ts-ignore
const db = global.db as pgp.IDatabase<any>


const router = express.Router()


router.use((req, res, next) => {

    req.GM.guardUserIsAuthenticated().then(()=>{
        next()
    }).catch(err => {
        next(err)
    })

})

router.post('/', asyncHandler(async (req, res) => {

    const requestBody = req.GM.guardBodySchema<ApiType_Mission_Post>(ApiSchema_Mission_Post)

    await req.GM.guardUserHasPermissionForWorkspace(requestBody.workspace_id)


    const assignedTeamId = requestBody.assigned_to_team_id
    if(typeof assignedTeamId === 'number'){
        const team = await getCore().modules.team.getTeam(assignedTeamId)
        if(team === false){
            throw GuardError._400_invalidBody('assigned_to_team_id')
        }
    }

    const currentUserId = (await req.GM.getCurrentUser()).id

    const mission = await getCore().modules.mission.createMission(assignObject(requestBody, {
        created_by: currentUserId,
        updated_by: currentUserId,
        state: getCore().modules.mission.validateMissionState(requestBody.state)
    }))

    res.GM.guardSend<ApiType_Mission>(mission, ApiSchema_Reference)
}))



router.get('/:mission_id/tasks', asyncHandler(async (req, res) => {

    const missionId = req.GM.guardParam('mission_id', 'id')

    const mission = await getCore().modules.mission.getMission(missionId)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    const tasks = await getCore().modules.mission.getTasksForMission(missionId)

    const tasksWithGeoObjects: ApiType_Task[] = []

    await Promise.all(tasks.map(task => {
        return getCore().modules.task.getGeoObjectsForTask(task.id).then(geoObjects => {
            tasksWithGeoObjects.push(assignObject(task, {
                geo_objects: geoObjects
            }))
        })
    }))

    res.GM.guardSend<ApiType_Mission_Tasks>(tasksWithGeoObjects, ApiSchema_Mission_Tasks)
}))


router.get('/:mission_id', asyncHandler(async (req, res) => {

    const missionId = req.GM.guardParam('mission_id', 'id')

    const mission = await getCore().modules.mission.getMission(missionId)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    res.GM.guardSend<ApiType_Mission>(mission, ApiSchema_Mission)
}))


router.patch('/:mission_id', asyncHandler(async (req, res) => {

    const missionId = req.GM.guardParam('mission_id', 'id')

    const mission = await getCore().modules.mission.getMission(missionId)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    const requestBody = req.GM.guardBodySchema<ApiType_Mission_Patch>(ApiSchema_Mission_Patch)

    const updatedMission = await getCore().modules.mission.updateMissionSafe(missionId, assignObject(requestBody, {
        updated_by: (await req.GM.getCurrentUser()).id,
        updated_at: new Date().toISOString(),
        state: getCore().modules.mission.validateMissionState(requestBody.state)
    }))

    res.GM.guardSend<ApiType_Mission>(updatedMission, ApiSchema_Mission)
}))

router.delete('/:mission_id', asyncHandler(async (req, res) => {

    const missionId = req.GM.guardParam('workspace_id', 'id')

    const mission = await getCore().modules.mission.getMission(missionId)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    await getCore().modules.mission.deleteMission(missionId)

    res.status(200).send()
}))


export default router
