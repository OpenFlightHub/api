import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_Dji_Pilot_2_Api_Manage_Devices_Topology_Response, ApiType_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response } from '../../../../generated-definitions/api/ApiTypes';
import { ApiSchema_Dji_Pilot_2_Api_Manage_Devices_Topology_Device, ApiSchema_Dji_Pilot_2_Api_Manage_Devices_Topology_Response, ApiSchema_Dji_Pilot_2_Api_Map_Element_Groups_Elements_Post_Response } from '../../../../generated-definitions/api/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import { DBType_Connection, DBType_Drone_TYPES, DBType_Remote_Controller_TYPES } from '../../../../generated-definitions/db/DBTypes';
import { select_Drone, select_Remote_Controller } from '../../../../generated-definitions/db/DBHelpers';
import { getDroneConnectionOnlineStatus } from '../../../../util/connection';
import { getModelEnumForDroneType, getModelEnumForRemoteControllerType } from '../../../../connector/dji-pilot-2/util/product';
import {makeUUIDFromId} from '../../../../util/uuid'

const router = express.Router()


router.get('/devices/topologies', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const connections = await db.manyOrNone<DBType_Connection>('SELECT * FROM connections WHERE workspace_id = ${workspaceId}',{
        workspaceId: connection.workspace_id
    })

    const topology: ApiType_Dji_Pilot_2_Api_Manage_Devices_Topology_Response['data']['list'] = []

    for(const connection of connections){

        const topologyEntry: typeof topology[0]= {
            hosts: [],
            parents: []
        }

        const connectionOnlineStatus = await getDroneConnectionOnlineStatus(connection.id)

        if(typeof connection.last_drone_id === 'number'){
            const drone = await select_Drone(connection.last_drone_id)

            topologyEntry.hosts.push({
                device_callsign: drone.name,//TODO where is this displayed? should we use connection.name?
                sn: drone.serial_number,
                online_status: connectionOnlineStatus.drone,
                user_callsign: connection.name,
                user_id: makeUUIDFromId(connection.id), //TODO where is this being used?
                device_model: getModelEnumForDroneType(drone.type)
            })
        }

        if(typeof connection.remote_controller_id === 'number'){
            const remoteController = await select_Remote_Controller(connection.remote_controller_id)

            topologyEntry.parents.push({
                device_callsign: '' + remoteController.id,
                sn: remoteController.serial_number,
                online_status: connectionOnlineStatus.remoteController,
                user_callsign: connection.name,
                user_id: makeUUIDFromId(connection.id), //TODO where is this being used?
                device_model: getModelEnumForRemoteControllerType(remoteController.type)
            })
        }

        topology.push(topologyEntry)
    }

    //TODO remove this testing code
    topology.push({
        hosts: [{
            device_callsign: 'Host Device Callsign',
            device_model: getModelEnumForDroneType(DBType_Drone_TYPES.dji_matrice_350),
            online_status: true,
            sn: 'SN#TEST-SIT-AWARE-HOST',
            user_callsign: 'Host User Callsign',
            user_id: 'a0000000-ea2e-482c-afdd-2becba536cf2',
            icon_urls: {
                normal_icon_url: 'https://dev.openflighthub.org/api/icons/drone.png',
                selected_icon_url: 'https://dev.openflighthub.org/api/icons/drone.png'
            }
        }],
        parents: [{
            device_callsign: 'Parent Device Callsign',
            device_model: getModelEnumForRemoteControllerType(DBType_Remote_Controller_TYPES.dji_rc_plus_2),
            online_status: true,
            sn: 'SN#TEST-SIT-AWARE-PARENT',
            user_callsign: 'Parent User Callsign',
            user_id: 'b0000000-ea2e-482c-afdd-2becba536cf2'
        }]
    })


    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Manage_Devices_Topology_Response>({
        code: 0,
        data: {
            list: topology
        },
        message: 'success'
    }, ApiSchema_Dji_Pilot_2_Api_Manage_Devices_Topology_Response)

}))

export default router
