import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiSchema_Geo_Object, ApiSchema_Geo_Object_Patch, ApiSchema_Reference, ApiSchema_Workspace_Geo_Objects_Create, ApiSchema_Workspace_Geo_Objects_Get } from '../../generated-definitions/api/ApiSchemas';
import { DBType_Geo_Object } from '../../generated-definitions/db/DBTypes';
import { ApiType_Geo_Object_Patch, ApiType_Reference, ApiType_Workspace_Geo_Objects_Create, ApiType_Workspace_Geo_Objects_Get } from '../../generated-definitions/api/ApiTypes';
import { randomUUID } from 'crypto';
import { getCore } from '../../core';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.get('/', asyncHandler(async(req, res) => {

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const geoObjects = await db.manyOrNone<DBType_Geo_Object>('SELECT * FROM geo_objects WHERE workspace_id = ${workspaceId}', {
        workspaceId
    })

    res.GM.guardSend<ApiType_Workspace_Geo_Objects_Get>(geoObjects, ApiSchema_Workspace_Geo_Objects_Get)
}))


router.post('/create', asyncHandler(async(req, res) => {

    const body = req.GM.guardBodySchema<ApiType_Workspace_Geo_Objects_Create>(ApiSchema_Workspace_Geo_Objects_Create)

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const createdGeoObject = await getCore().modules.geoObject.create({
        uuid: typeof body.uuid === 'string' ? body.uuid : randomUUID(),
        name: body.name,
        type: body.type,
        sub_type: body.sub_type,
        workspace_id: workspaceId,
        config: body.config
    })

    res.GM.guardSend<ApiType_Reference>(createdGeoObject, ApiSchema_Reference)
}))

router.patch('/:geo_object_id', asyncHandler(async(req, res) => {

    const geoObjectId = req.GM.guardParam('geo_object_id', 'id')

    const geoObject = await req.GM.guardDBGone(()=>{
        return getCore().modules.geoObject.get(geoObjectId)
    })

    const body = req.GM.guardBodySchema<ApiType_Geo_Object_Patch>(ApiSchema_Geo_Object_Patch)

    res.GM.guardSend(await getCore().modules.geoObject.update(geoObject.id, {
        name: typeof body.name === 'string' ? body.name : geoObject.name,
        config: body.config ? body.config : geoObject.config
    }), ApiSchema_Geo_Object)

}))


router.delete('/:geo_object_id', asyncHandler(async(req, res) => {

    const geoObjectId = req.GM.guardParam('geo_object_id', 'id')

    const geoObject = await req.GM.guardDBGone(()=>{
        return getCore().modules.geoObject.get(geoObjectId)
    })

    await getCore().modules.geoObject.delete(geoObject.id)

    res.status(200)
    res.send()
}))


export default router
