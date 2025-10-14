import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import {getMillisecondsSinceUnix} from '../../../../util/time'
import { ApiType_DjiPilot2ApiMapElementGroupsElementsPost, ApiType_DjiPilot2ApiMapElementGroupsElementsPostResponse, ApiType_DjiPilot2ApiMapElementGroupsGetResponse, ApiType_DjiPilot2ApiMapElementsDeleteResponse, ApiType_DjiPilot2ApiMapElementsPut, ApiType_DjiPilot2ApiMapElementsPutResponse } from '../../../../definitions/ApiTypes';
import { ApiSchema_DjiPilot2ApiMapElementGroupsElementsPost, ApiSchema_DjiPilot2ApiMapElementGroupsElementsPostResponse, ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse, ApiSchema_DjiPilot2ApiMapElementsDeleteResponse, ApiSchema_DjiPilot2ApiMapElementsPut, ApiSchema_DjiPilot2ApiMapElementsPutResponse } from '../../../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import { DBType_WorkspaceMapElement, DBType_WorkspaceMapElement_TypeType } from '../../../../db/DBTypes';
import { deleteWorkspaceMapElement, insertWorkspaceMapElement, selectWorkspaceMapElement, updateWorkspaceMapElement } from '../../../../db/DBHelpers';
import { GuardError } from '../../../../ManInTheMiddleware';
import dayjs from 'dayjs';

const router = express.Router()


router.post('/element-groups/:group_id/elements', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMapElementGroupsElementsPost>(ApiSchema_DjiPilot2ApiMapElementGroupsElementsPost)

    const mapElement = await insertWorkspaceMapElement({
        uuid: body.id,
        name: body.name,
        connection_id: connection.id,
        workspace_id: connection.workspace_id,
        type: validateResourceType(body.resource.type),
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

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementGroupsGetResponse>({
        code: 0,
        data: [
            {

                "id": connection.workspace_uuid,
                "type": 2,
                'name': 'From OpenFlightHub Server',
                "is_lock": false,
                "create_time": 1,
                "elements": mapElements.map(element=>{

                    let parsedContent: any

                    try {
                        parsedContent = JSON.parse(element.content)
                    } catch (err){
                        console.error('failed to parse map element content', element, err)
                        return false
                    }

                    const ret: ApiType_DjiPilot2ApiMapElementGroupsGetResponse['data'][0]['elements'][0] = {
                        id: element.uuid,
                        name: element.name,
                        create_time: getMillisecondsSinceUnix(element.created_at),
                        update_time: getMillisecondsSinceUnix(element.updated_at),
                        resource: {
                            type: element.type,
                            content: parsedContent
                        }
                    }

                    return ret
                }).filter(elem => {
                    return elem !== false
                })
            }
        ],
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse)

}))

router.put('/elements/:element_uuid', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const elementUUID = req.GM.guardParam('element_uuid', 'uuid')

    const existingElement = await req.GM.guardDBGone(()=>{
        return db.one<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements ' + pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    await req.GM.guardConnectionHasPermissionForWorkspace(existingElement.workspace_id)

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMapElementsPut>(ApiSchema_DjiPilot2ApiMapElementsPut)

    await req.GM.guardDBGone(()=>{
        return updateWorkspaceMapElement({
            updated_at: dayjs().toISOString(),
            name: body.name,
            content: JSON.stringify(body.content)
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


    const existingElement = await req.GM.guardDBGone(()=>{
        return db.one<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements ' + pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    await req.GM.guardConnectionHasPermissionForWorkspace(existingElement.workspace_id)

    await deleteWorkspaceMapElement(existingElement.id)

    res.GM.guardSend<ApiType_DjiPilot2ApiMapElementsDeleteResponse>({
        code: 0,
        data: {
            id: existingElement.uuid
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMapElementsDeleteResponse)

}))


function validateResourceType(type: number): DBType_WorkspaceMapElement_TypeType {

    if(type === 0 || type === 1 || type === 2){
        return type
    } else {
        throw GuardError._400_invalidBody('resource.type')
    }
}

export default router
