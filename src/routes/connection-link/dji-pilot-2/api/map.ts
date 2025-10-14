import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_DjiPilot2ApiMapElementGroupsElementsPost, ApiType_DjiPilot2ApiMapElementGroupsElementsPostResponse, ApiType_DjiPilot2ApiMapElementGroupsGetResponse, ApiType_DjiPilot2ApiMapElementsDeleteResponse, ApiType_DjiPilot2ApiMapElementsPut, ApiType_DjiPilot2ApiMapElementsPutResponse } from '../../../../definitions/ApiTypes';
import { ApiSchema_DjiPilot2ApiMapElementGroupsElementsPost, ApiSchema_DjiPilot2ApiMapElementGroupsElementsPostResponse, ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse, ApiSchema_DjiPilot2ApiMapElementsDeleteResponse, ApiSchema_DjiPilot2ApiMapElementsPut, ApiSchema_DjiPilot2ApiMapElementsPutResponse } from '../../../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import SecretsLoader from '../../../../util/SecretsLoader'
import { DBType_WorkspaceMapElement } from '../../../../db/DBTypes';
import { deleteWorkspaceMapElement, insertWorkspaceMapElement, updateWorkspaceMapElement } from '../../../../db/DBHelpers';
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['minio_api_url', 'minio_region', 'minio_bucket_dji_pilot_2_media'])

const router = express.Router()


router.post('/element-groups/:group_id/elements', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const groupUUID = req.GM.guardParam('group_id', 'uuid')//TODO what do we need this for?

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMapElementGroupsElementsPost>(ApiSchema_DjiPilot2ApiMapElementGroupsElementsPost)

    const mapElement = await insertWorkspaceMapElement({
        uuid: body.id,
        name: body.name,
        connection_id: connection.id,
        workspace_id: connection.workspace_id,
        type: body.resource.type,
        content: JSON.stringify(body.resource.content)
    })

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementGroupsElementsPostResponse>({
        code: 0,
        data: {
            id: mapElement.uuid
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementGroupsElementsPostResponse)

}))


router.get('/element-groups', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const mapElements = await db.manyOrNone<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements WHERE workspace_id = ${workspace_id}', {
        workspace_id: connection.workspace_id
    })

    //TODO remove temporary test code

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementGroupsGetResponse>({
        code: 0,
        data: [
            {

                "id": connection.workspace_uuid,
                "type": 2,
                'name': 'Server Group',
                "is_lock": false,
                "create_time": 1637158501230,
                "elements": [
                    {
                        "id":"00000001-ac39-42bf-9580-4c8a94c11989",
                        "name":"Server Point",
                        "create_time":1637158501230,
                        "update_time":1637158501230,
                        "resource":{
                            "type": 0,
                            "content":{
                                "type":"Feature",
                                "properties":{
                                    "color": "BLUE",
                                    "clampToGround":false
                                },
                                "geometry":{
                                    "type":"Point",
                                    "coordinates": [
                                        10.2411037,
                                        47.5654997,
                                        40.2
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        ],
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse)


    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementGroupsGetResponse>({
        code: 0,
        data: mapElements.map(m => {
            return {
                id: m.uuid
            }
        }),
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse)

}))

router.put('/elements/:element_uuid', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const elementUUID = req.GM.guardParam('element_uuid', 'uuid')

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMapElementsPut>(ApiSchema_DjiPilot2ApiMapElementsPut)

    await req.GM.guardDBGone(()=>{
        return updateWorkspaceMapElement({
            name: body.name,
            type: body.resource.type,
            content: JSON.stringify(body.resource.content)
        }, pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementsPutResponse>({
        code: 0,
        data: {
            id: elementUUID
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementsPutResponse)

}))

router.delete('/elements/:element_uuid', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const elementUUID = req.GM.guardParam('element_uuid', 'uuid')

    const mapElement = await req.GM.guardDBGone(()=>{
        return db.one<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements WHERE uuid = ${uuid}', {
            uuid: elementUUID
        })
    })

    await deleteWorkspaceMapElement(mapElement.id)

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementsDeleteResponse>({
        code: 0,
        data: {
            id: mapElement.uuid
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementsDeleteResponse)

}))

export default router
