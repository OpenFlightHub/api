import {DBInsert_Drone, DBInsert_Drone_Data, DBUpdate_Drone, delete_Drone, insert_Drone, insert_Drone_Data, select_Drone, select_Workspace, update_Drone} from '../../generated-definitions/db/DBHelpers'
import Module_Base from './Module_Base'
import * as pgp from 'pg-promise'
import { DBType_Drone, DBType_Drone_Data, DBType_Drone_Data_TypeType } from '../../generated-definitions/db/DBTypes'
import { getCore } from '..'
import { GuardError } from '../../ManInTheMiddleware'
import { registerSubscribableEvent, SubscribableEventHandler } from '../../live-websocket/websocket'
const db : pgp.IDatabase<any> = global.db


export const DRONE_DATA_TYPES = {
    POSITION: 0 as DBType_Drone_Data_TypeType,
    TELEMETRY: 1 as DBType_Drone_Data_TypeType
}


export default class DroneModule extends Module_Base<
    {
        id: number
    },

    {
        create: {
            eventDataType: DBType_Drone,
            availableContexts: 'id'
        },
        update: {
            eventDataType: DBType_Drone,
            availableContexts: 'id'
        },
        delete: {
            eventDataType: DBType_Drone,
            availableContexts: 'id'
        },
        insert_drone_data: {
            eventDataType: DBType_Drone_Data,
            availableContexts: 'id'
        }
    }
> {

    private subscribableEventHandlerWorkspaceDronesPosition: SubscribableEventHandler<'workspace_drones_position'>
    private subscribableEventHandlerDronePosition: SubscribableEventHandler<'drone_position'>
    private subscribableEventHandlerDroneTelemetry: SubscribableEventHandler<'drone_telemetry'>

    constructor(){
        super()

        this.subscribableEventHandlerDronePosition = registerSubscribableEvent('drone_position', async(event, filter, client)=>{

            const droneId = parseInt(filter)

            if(isNaN(droneId) || droneId < 0){
                return 'invalid filter: ' + droneId
            }

            const workspaceId = await this.getCurrentWorkspaceOfDrone(droneId)//TODO api crashes if drone does not exist

            if(workspaceId === false){
                return 'drone not linked to workspace'
            }

            const hasPermission = await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspaceId)

            if(!hasPermission){
                return 'Permission denied'
            }

        })


        this.subscribableEventHandlerDroneTelemetry = registerSubscribableEvent('drone_telemetry', async(event, filter, client)=>{
            const droneId = parseInt(filter)

            if(isNaN(droneId) || droneId < 0){
                return 'invalid filter: ' + droneId
            }

            const workspaceId = await this.getCurrentWorkspaceOfDrone(droneId)// TODO api crashes if drone does not exist

            if(workspaceId === false){
                return 'drone not linked to workspace'
            }

            const hasPermission = await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspaceId)

            if(!hasPermission){
                return 'Permission denied'
            }

        })

        this.subscribableEventHandlerWorkspaceDronesPosition = registerSubscribableEvent('workspace_drones_position', async(event, filter, client)=>{

            const workspaceId = parseInt(filter)

            if(isNaN(workspaceId) || workspaceId < 0){
                return 'invalid filter: ' + workspaceId
            }

            const workspace = await select_Workspace(workspaceId)

            const hasPermission = await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspace.id)

            if(!hasPermission){
                return 'Permission denied'
            }

        })

    }

    async create(data: DBInsert_Drone){
        const drone = await insert_Drone(data)

        this.dispatch('create', {
            id: drone.id
        }, drone)

        return drone
    }

    async update(id: number, data: DBUpdate_Drone){
        const drone = await update_Drone(data, id)

        this.dispatch('update', {
            id: drone.id
        }, drone)

        return drone
    }

    async delete(id: number){
        const drone = await delete_Drone(id)

        this.dispatch('delete', {
            id: drone.id
        }, drone)
    }

    async get(id: number){
        return await select_Drone(id)
    }

    async insertDroneData(data: DBInsert_Drone_Data){
        const droneData = await insert_Drone_Data(data)

        if(droneData.type === DRONE_DATA_TYPES.POSITION){
            const droneLastPosition = this.extractPositionFromDroneData(droneData.data)

            if(droneLastPosition === false){
                console.warn('invalid drone position in data', droneData)
            } else {
                this.subscribableEventHandlerDronePosition.triggerListener('' + droneData.drone_id, {
                    id: droneData.drone_id,
                    serial_number: (await this.get(droneData.drone_id)).serial_number,
                    position: droneLastPosition
                })
            }
        } else if (droneData.type === DRONE_DATA_TYPES.TELEMETRY){
            const droneLastTelemetry = this.extractTelemetryFromDroneData(droneData.data)

            if(droneLastTelemetry === false){
                console.warn('invalid drone telemetry in data', droneData)
            } else {
                this.subscribableEventHandlerDroneTelemetry.triggerListener('' + droneData.drone_id, {
                    id: droneData.drone_id,
                    telemetry: droneLastTelemetry
                })
            }
        }

        this.dispatch('insert_drone_data', {
            id: droneData.drone_id
        }, droneData)

        return droneData
    }




    async addDroneData(droneId: number, type: DBType_Drone_Data_TypeType, data: any){

        const drone = await this.get(droneId)

        await insert_Drone_Data({
            drone_id: droneId,
            flight_id: drone.current_flight_id,
            type,
            data
        })
    }

    async getLastPositionOfDrone(droneId: number){
        const droneLastPosition = await db.one<DBType_Drone_Data>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {
            type: DRONE_DATA_TYPES.POSITION,
            droneId
        })

        return this.extractPositionFromDroneData(droneLastPosition)
    }


    private extractPositionFromDroneData(droneData: DBType_Drone_Data){

        if(typeof droneData.data.latitude !== 'number' || typeof droneData.data.longitude !== 'number' || typeof droneData.data.height !== 'number'){
            return false
        }

        return {
            reported_at: droneData.created_at,
            latitude: droneData.data.latitude as number,
            longitude: droneData.data.longitude as number,
            height: droneData.data.height as number
        }
    }


    async getLastTelemetryOfDrone(droneId: number){
        const droneLastTelemetry = await db.one<DBType_Drone_Data>('SELECT * FROM drone_data WHERE drone_id = ${droneId} AND type = ${type} ORDER BY created_at DESC LIMIT 1', {//TODO we need to make sure the data contains the required telemetry
            type: DRONE_DATA_TYPES.TELEMETRY,
            droneId
        })

        return this.extractTelemetryFromDroneData(droneLastTelemetry)
    }


    private extractTelemetryFromDroneData(droneData: DBType_Drone_Data){

        if(typeof droneData.data.capacity_percent_left !== 'number'){
            return false
        }

        return {
            reported_at: droneData.created_at,
            capacity_percent_left: droneData.data.capacity_percent_left as number
        }
    }

    async getDroneForSerialNumber(serialNumber: string){
        return db.oneOrNone<DBType_Drone>('SELECT * FROM drones WHERE serial_number = ${serialNumber};', {
            serialNumber
        })
    }

    async setDroneInFlightState(drone: DBType_Drone, isInFlight: boolean){

        //TODO end flight after some time we saw no messages?

        //TODO start new flight, if last time we saw messages was ages ago?

        if(isInFlight && !drone.in_flight){
            // start new flight and end old one

            const currentFlight = await getCore().modules.flight.get(drone.current_flight_id)

            await getCore().modules.flight.update(drone.current_flight_id, {
                ended_at: new Date().toISOString(),
                landed_at: currentFlight.landed_at || new Date().toISOString()
            })

            const currentWorkspace = await this.getCurrentWorkspaceOfDrone(drone.id)

            const newFlight = await getCore().modules.flight.create({
                drone_id: drone.id,
                workspace_id: currentWorkspace === false ? 0 : currentWorkspace
            })

            if(currentWorkspace === false){
                console.warn('creating new flight but drone has no current connection', newFlight, drone)
            }

            drone = await this.update(drone.id, {
                current_flight_id: newFlight.id,
                in_flight: true
            })
        }

        if(!isInFlight && drone.in_flight){
            // mark flight as landed

            await getCore().modules.flight.update(drone.current_flight_id, {
                landed_at: new Date().toISOString()
            })

            drone = await this.update(drone.id, {
                in_flight: false
            })

        }

        return drone
    }


    async getActiveConnectionForDrone(droneId: number){
        const drone = await this.get(droneId)
        if(typeof drone.last_connection_id !== 'number'){
            return false
        }

        const connection = await getCore().modules.connection.get(drone.last_connection_id)

        if(!connection){
            return false
        }

        if(connection.last_drone_id === droneId){
            return connection
        } else {
            return false
        }
    }

    async getLastConnectionForDrone(droneOrDroneId: DBType_Drone | number){
        if(typeof droneOrDroneId === 'number'){
            droneOrDroneId = await select_Drone(droneOrDroneId)
        }

        if(!droneOrDroneId){
            throw GuardError._410_Gone('drone not found: ' + droneOrDroneId)
        }

        if(typeof droneOrDroneId.last_connection_id !== 'number'){
            return false
        }

        const connection = await db.oneOrNone('SELECT * FROM connections WHERE id = ${id}', {
            id: droneOrDroneId.last_connection_id
        })

        if(connection){
            return connection
        } else {
            return false
        }
    }

    async getCurrentWorkspaceOfDrone(droneId: number){
        const currentConnection = await this.getActiveConnectionForDrone(droneId)

        if(currentConnection === false){
            return false
        }

        return currentConnection.workspace_id
    }
}
