import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Task, ApiSchema_Task_Patch, ApiSchema_Task_Post, ApiSchema_Reference } from '../generated-definitions/api/ApiSchemas';
import { ApiType_Task, ApiType_Task_Patch, ApiType_Task_Post } from '../generated-definitions/api/ApiTypes';
import { GuardError } from '../ManInTheMiddleware';
import { getCore } from '../core';
import { assignObject } from '../util/typescript';
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

    const requestBody = req.GM.guardBodySchema<ApiType_Task_Post>(ApiSchema_Task_Post)

    const mission = await getCore().modules.mission.getMission(requestBody.mission_id)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    const currentUserId = (await req.GM.getCurrentUser()).id

    const task = await getCore().modules.task.createTask(assignObject(requestBody, {
        created_by: currentUserId,
        updated_by: currentUserId,
        state: getCore().modules.task.validateTaskState(requestBody.state)
    }))

    res.GM.guardSend<ApiType_Task>(assignObject(task, {
        geo_objects: await getCore().modules.task.getGeoObjectsForTask(task.id)
    }), ApiSchema_Reference)
}))

router.get('/:task_id', asyncHandler(async (req, res) => {

    const taskId = req.GM.guardParam('task_id', 'id')

    const task = await getCore().modules.task.getTask(taskId)

    if(task === false){
        throw GuardError._410_Gone()
    }


    const mission = await getCore().modules.mission.getMission(task.mission_id)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    res.GM.guardSend<ApiType_Task>(assignObject(task, {
        geo_objects: await getCore().modules.task.getGeoObjectsForTask(taskId)
    }), ApiSchema_Task)
}))


router.patch('/:task_id', asyncHandler(async (req, res) => {

    const taskId = req.GM.guardParam('task_id', 'id')

    const task = await getCore().modules.task.getTask(taskId)

    if(task === false){
        throw GuardError._410_Gone()
    }


    const mission = await getCore().modules.mission.getMission(task.mission_id)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    const requestBody = req.GM.guardBodySchema<ApiType_Task_Patch>(ApiSchema_Task_Patch)

    const updatedTask = await getCore().modules.task.updateTaskSafe(taskId, assignObject(requestBody, {
        updated_by: (await req.GM.getCurrentUser()).id,
        updated_at: new Date().toISOString(),
        state: getCore().modules.task.validateTaskState(requestBody.state)
    }))

    res.GM.guardSend<ApiType_Task>(assignObject(updatedTask, {
        geo_objects: await getCore().modules.task.getGeoObjectsForTask(taskId)
    }), ApiSchema_Task)
}))

router.delete('/:task_id', asyncHandler(async (req, res) => {

    const taskId = req.GM.guardParam('task_id', 'id')

    const task = await getCore().modules.task.getTask(taskId)

    if(task === false){
        throw GuardError._410_Gone()
    }


    const mission = await getCore().modules.mission.getMission(task.mission_id)

    if(mission === false){
        throw GuardError._410_Gone()
    }

    await req.GM.guardUserHasPermissionForWorkspace(mission.workspace_id)

    await getCore().modules.task.deleteTask(taskId)

    res.status(200).send()
}))


export default router
