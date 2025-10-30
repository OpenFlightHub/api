import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { deleteWorkspaceMapElement, insertWorkspaceMapElement, selectWorkspaceMapElement, updateWorkspaceMapElement } from '../../generated-definitions/db/DBHelpers';
import { ApiSchema_MapElement, ApiSchema_MapElementCircle, ApiSchema_MapElementCirclePatch, ApiSchema_MapElementLine, ApiSchema_MapElementLinePatch, ApiSchema_MapElementPoint, ApiSchema_MapElementPointPatch, ApiSchema_MapElementPolygon, ApiSchema_MapElementPolygonPatch, ApiSchema_Reference, ApiSchema_WorkspaceMapElementsCreateCircle, ApiSchema_WorkspaceMapElementsCreateLine, ApiSchema_WorkspaceMapElementsCreatePoint, ApiSchema_WorkspaceMapElementsCreatePolygon, ApiSchema_WorkspaceMapElementsGet } from '../../generated-definitions/api/ApiSchemas';
import { DBType_WorkspaceMapElement, DBType_WorkspaceMapElement_TYPES } from '../../generated-definitions/db/DBTypes';
import { ApiType_MapElementCircle, ApiType_MapElementCirclePatch, ApiType_MapElementLine, ApiType_MapElementLinePatch, ApiType_MapElementPoint, ApiType_MapElementPointPatch, ApiType_MapElementPolygon, ApiType_MapElementPolygonPatch, ApiType_Reference, ApiType_WorkspaceMapElementsCreateCircle, ApiType_WorkspaceMapElementsCreateLine, ApiType_WorkspaceMapElementsCreatePoint, ApiType_WorkspaceMapElementsCreatePolygon, ApiType_WorkspaceMapElementsGet } from '../../generated-definitions/api/ApiTypes';
import { randomUUID } from 'crypto';
import { convertDbMapElementToApiMapElement, parseColorOfContentOrDefault } from '../../map/map_marks';
const db : pgp.IDatabase<any> = global.db


const router = express.Router()


router.get('/', asyncHandler(async(req, res) => {

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const mapElements = await db.manyOrNone<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements WHERE workspace_id = ${workspaceId}', {
        workspaceId
    })

    const result = mapElements.map(mapElement => convertDbMapElementToApiMapElement(mapElement))

    res.GM.guardSend<ApiType_WorkspaceMapElementsGet>(result, {type: 'array', items: {type: 'object'}})//TODO should be ApiSchema_WorkspaceMapElementsGet, but since circle and point overlap, a circle will have its radius removed :(
}))


router.post('/create/point', asyncHandler(async(req, res) => {

    const body = req.GM.guardBodySchema<ApiType_WorkspaceMapElementsCreatePoint>(ApiSchema_WorkspaceMapElementsCreatePoint)

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const createdMapElement = await insertWorkspaceMapElement({
        uuid: typeof body.uuid === 'string' ? body.uuid : randomUUID(),
        name: body.name,
        type: DBType_WorkspaceMapElement_TYPES.point,
        workspace_id: workspaceId,
        content: JSON.stringify({
            geometry: {
                coordinates: [body.longitude, body.latitude, body.elevation],
                type: 'Point'
            },
            properties: {
                clampToGround: true,
                color: body.color
            },
            type: 'Feature'
        })
    })

    res.GM.guardSend<ApiType_Reference>(createdMapElement, ApiSchema_Reference)
}))


router.post('/create/line', asyncHandler(async(req, res) => {

    const body = req.GM.guardBodySchema<ApiType_WorkspaceMapElementsCreateLine>(ApiSchema_WorkspaceMapElementsCreateLine)

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const createdMapElement = await insertWorkspaceMapElement({
        uuid: typeof body.uuid === 'string' ? body.uuid : randomUUID(),
        name: body.name,
        type: DBType_WorkspaceMapElement_TYPES.line,
        workspace_id: workspaceId,
        content: JSON.stringify({
            geometry: {
                coordinates: body.coordinates,
                type: 'LineString'
            },
            properties: {
                clampToGround: true,
                color: body.color
            },
            type: 'Feature'
        })
    })

    res.GM.guardSend<ApiType_Reference>(createdMapElement, ApiSchema_Reference)
}))


router.post('/create/polygon', asyncHandler(async(req, res) => {

    const body = req.GM.guardBodySchema<ApiType_WorkspaceMapElementsCreatePolygon>(ApiSchema_WorkspaceMapElementsCreatePolygon)

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const createdMapElement = await insertWorkspaceMapElement({
        uuid: typeof body.uuid === 'string' ? body.uuid : randomUUID(),
        name: body.name,
        type: DBType_WorkspaceMapElement_TYPES.polygon,
        workspace_id: workspaceId,
        content: JSON.stringify({
            geometry: {
                coordinates: body.coordinates,
                type: 'Polygon'
            },
            properties: {
                clampToGround: true,
                color: body.color
            },
            type: 'Feature'
        })
    })

    res.GM.guardSend<ApiType_Reference>(createdMapElement, ApiSchema_Reference)
}))


router.post('/create/circle', asyncHandler(async(req, res) => {

    const body = req.GM.guardBodySchema<ApiType_WorkspaceMapElementsCreateCircle>(ApiSchema_WorkspaceMapElementsCreateCircle)

    //@ts-ignore
    const workspaceId = req._workspaceId as number

    const createdMapElement = await insertWorkspaceMapElement({
        uuid: typeof body.uuid === 'string' ? body.uuid : randomUUID(),
        name: body.name,
        type: DBType_WorkspaceMapElement_TYPES.circle,
        workspace_id: workspaceId,
        content: JSON.stringify({
            geometry: {
                coordinates: [body.longitude, body.latitude, body.elevation],
                radius: body.radius,
                type: 'Circle'
            },
            properties: {
                clampToGround: false,
                color: body.color
            },
            type: 'Feature'
        })
    })

    res.GM.guardSend<ApiType_Reference>(createdMapElement, ApiSchema_Reference)
}))

router.patch('/:map_element_id', asyncHandler(async(req, res) => {

    const mapElementId = req.GM.guardParam('map_element_id', 'id')

    const mapElement = await req.GM.guardDBGone(()=>{
        return selectWorkspaceMapElement(mapElementId)
    })

    switch(mapElement.type){
        case 0: {
            const body = req.GM.guardBodySchema<ApiType_MapElementPointPatch>(ApiSchema_MapElementPointPatch)

            res.GM.guardSend(await updateWorkspaceMapElement({
                name: typeof body.name === 'string' ? body.name : mapElement.name,
                content: JSON.stringify({
                    geometry: {
                        coordinates: [
                            body.longitude,
                            body.latitude,
                            body.elevation
                        ],
                        type: 'Point'
                    },
                    properties: {
                        clampToGround: true,
                        color: typeof body.color === 'string' ? body.color : parseColorOfContentOrDefault(mapElement.content)
                    },
                    type: 'Feature'
                })
            }, mapElement.id), ApiSchema_MapElementPoint)
        } break

        case 1: {
            //TODO check if the saved format is correct (and supported by dji)
            const body = req.GM.guardBodySchema<ApiType_MapElementLinePatch>(ApiSchema_MapElementLinePatch)

            res.GM.guardSend(await updateWorkspaceMapElement({
                name: typeof body.name === 'string' ? body.name : mapElement.name,
                content: JSON.stringify({
                    geometry: {
                        coordinates: body.coordinates,
                        type: 'LineString'
                    },
                    properties: {
                        clampToGround: true,
                        color: typeof body.color === 'string' ? body.color : parseColorOfContentOrDefault(mapElement.content)
                    },
                    type: 'Feature'
                })
            }, mapElement.id), ApiSchema_MapElementLine)
        } break

        case 2: {
            //TODO check if the saved format is correct (and supported by dji)
            const body = req.GM.guardBodySchema<ApiType_MapElementPolygonPatch>(ApiSchema_MapElementPolygonPatch)

            res.GM.guardSend(await updateWorkspaceMapElement({
                name: typeof body.name === 'string' ? body.name : mapElement.name,
                content: JSON.stringify({
                    geometry: {
                        coordinates: body.coordinates,
                        type: 'Polygon'
                    },
                    properties: {
                        clampToGround: true,
                        color: typeof body.color === 'string' ? body.color : parseColorOfContentOrDefault(mapElement.content)
                    },
                    type: 'Feature'
                })
            }, mapElement.id), ApiSchema_MapElementPolygon)
        } break

        case 7: {
            const body = req.GM.guardBodySchema<ApiType_MapElementCirclePatch>(ApiSchema_MapElementCirclePatch)

            res.GM.guardSend(await updateWorkspaceMapElement({
                name: typeof body.name === 'string' ? body.name : mapElement.name,
                content: JSON.stringify({
                    geometry: {
                        coordinates: [
                            body.longitude,
                            body.latitude
                        ],
                        radius: typeof body.radius === 'number' ? body.radius : JSON.parse(mapElement.content).geometry.radius,
                        type: 'Circle'
                    },
                    properties: {
                        clampToGround: true,
                        color: typeof body.color === 'string' ? body.color : parseColorOfContentOrDefault(mapElement.content)
                    },
                    type: 'Feature'
                })
            }, mapElement.id), ApiSchema_MapElementCircle)
        } break

        default: {
            throw new Error('unsupported map element type: ' + mapElement.type)
        }
    }

}))


router.delete('/:map_element_id', asyncHandler(async(req, res) => {

    const mapElementId = req.GM.guardParam('map_element_id', 'id')

    const mapElement = await req.GM.guardDBGone(()=>{
        return selectWorkspaceMapElement(mapElementId)
    })

    await deleteWorkspaceMapElement(mapElement.id)

    res.status(200)
    res.send()
}))


export default router
