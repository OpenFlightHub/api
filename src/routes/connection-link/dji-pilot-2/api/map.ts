import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import {getMillisecondsSinceUnix} from '../../../../util/time'
import { ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post, ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response, ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Get_Response, ApiType_Dji_Pilot_2_Api_Map_Elements_Delete_Response, ApiType_Dji_Pilot_2_Api_Map_Elements_Put, ApiType_Dji_Pilot_2_Api_Map_Elements_Put_Response } from '../../../../generated-definitions/api/ApiTypes';
import { ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post, ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response, ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Get_Response, ApiSchema_Dji_Pilot_2_Api_Map_Elements_Delete_Response, ApiSchema_Dji_Pilot_2_Api_Map_Elements_Put, ApiSchema_Dji_Pilot_2_Api_Map_Elements_Put_Response } from '../../../../generated-definitions/api/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import { DBType_WorkspaceMapElement, DBType_WorkspaceMapElement_TYPES, DBType_WorkspaceMapElement_TypeType } from '../../../../generated-definitions/db/DBTypes';
import { deleteWorkspaceMapElement, insertWorkspaceMapElement, update_WorkspaceMapElement } from '../../../../generated-definitions/db/DBHelpers';
import { GuardError } from '../../../../ManInTheMiddleware';
import dayjs from 'dayjs';

const router = express.Router()


router.post('/element-groups/:group_id/elements', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post>(ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post)

    const mapElement = await insertWorkspaceMapElement({
        uuid: body.id,
        name: body.name,
        workspace_id: connection.workspace_id,
        type: validateResourceType(body.resource.type),
        content: JSON.stringify(body.resource.content)
    })

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response>({
        code: 0,
        data: {
            id: mapElement.uuid
        },
        message: 'success'
    }, ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response)

}))

// note: already existing pins on the controller are not being synced when you link the controller (sync can be triggered by changing e.g. the color)
router.get('/element-groups', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const mapElements = await db.manyOrNone<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements WHERE workspace_id = ${workspace_id}', {
        workspace_id: connection.workspace_id
    })

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Get_Response>({
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

                    const ret: ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Get_Response['data'][0]['elements'][0] = {
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
    }, ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Get_Response)

}))

router.put('/elements/:element_uuid', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const elementUUID = req.GM.guardParam('element_uuid', 'uuid')

    const existingElement = await req.GM.guardDBGone(()=>{
        return db.one<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements ' + pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    await req.GM.guardConnectionHasPermissionForWorkspace(existingElement.workspace_id)

    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Map_Elements_Put>(ApiSchema_Dji_Pilot_2_Api_Map_Elements_Put)

    await req.GM.guardDBGone(()=>{
        return update_WorkspaceMapElement({
            updated_at: dayjs().toISOString(),
            name: body.name,
            content: JSON.stringify(body.content)
        }, pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Map_Elements_Put_Response>({
        code: 0,
        data: {
            id: elementUUID
        },
        message: 'success'
    }, ApiSchema_Dji_Pilot_2_Api_Map_Elements_Put_Response)

}))

router.delete('/elements/:element_uuid', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const elementUUID = req.GM.guardParam('element_uuid', 'uuid')


    const existingElement = await req.GM.guardDBGone(()=>{
        return db.one<DBType_WorkspaceMapElement>('SELECT * FROM workspace_map_elements ' + pgp.as.format('WHERE uuid = ${uuid}', {uuid: elementUUID}))
    })

    await req.GM.guardConnectionHasPermissionForWorkspace(existingElement.workspace_id)

    await deleteWorkspaceMapElement(existingElement.id)

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Map_Elements_Delete_Response>({
        code: 0,
        data: {
            id: existingElement.uuid
        },
        message: 'success'
    }, ApiSchema_Dji_Pilot_2_Api_Map_Elements_Delete_Response)

}))


function validateResourceType(type: number){

    for(const key of Object.keys(DBType_WorkspaceMapElement_TYPES)){
        if(DBType_WorkspaceMapElement_TYPES[key] === type){
            return type as DBType_WorkspaceMapElement_TypeType
        }
    }

    throw GuardError._400_invalidBody('resource.type')
}

export default router
