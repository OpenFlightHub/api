
import {DBType_Geo_Object, DBType_Geo_Object_SubType_TYPES, DBType_Geo_Object_Type_TYPES} from '../../generated-definitions/db/DBTypes'
import {DBInsert_Geo_Object, DBUpdate_Geo_Object, delete_Geo_Object, insert_Geo_Object, select_Geo_Object, update_Geo_Object} from '../../generated-definitions/db/DBHelpers'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'

import { registerSubscribableEvent, SubscribableEventHandler } from '../../live-websocket/websocket'
import { ClientId } from '../../live-websocket/websocket'
import { TrafficData, TrafficType } from '../../aircraft_sensing/TrafficSensing'
import { getCore } from '..'

import pgp from 'pg-promise'
import { assignObject } from '../../util/typescript'
import dayjs from 'dayjs'
import { WorkspaceTrafficSensingHandle } from './WorkspaceModule'
//@ts-ignore
const db = global.db as pgp.IDatabase<any>

export default class GeoObjectModule extends Module_Base<
    {
        workspaceId: number | true,//true means global context
        id: number
    },

    {
        create_geo_object: {
            eventDataType: DBType_Geo_Object,
            availableContexts: 'workspaceId' | 'id'
        },
        update_geo_object: {
            eventDataType: DBType_Geo_Object,
            availableContexts: 'workspaceId' | 'id'
        },
        delete_geo_object: {
            eventDataType: DBType_Geo_Object,
            availableContexts: 'workspaceId' | 'id'
        }
    }
> {

    readonly subscribableEventHandlerGeoObjects: SubscribableEventHandler<'geo_object'>

    private readonly activeHandles = new Map<ClientId, WorkspaceTrafficSensingHandle>()

    private existingGeoObjectsNameIdMap = new Map<number, Map<string, number>>()//workspaceId -> name -> id (if workspaceId = -1, it means global)
    private existingGeoObjectsNameIdMap_isInitialized = false

    constructor(){
        super()

        this.initExistingGeoObjectsNameIdMap().catch(err => {
            console.error('failed to initialize existingGeoObjectsNameIdMap', err)
        })

        setInterval(()=>{
            this.cleanupOldTrafficGeoObjects()
        }, 1000 * 30)//every 30 seconds

        this.subscribableEventHandlerGeoObjects = registerSubscribableEvent('geo_object', async(event, filter, client)=>{

            const filterOptions = this.parseFilter(filter)

            const workspaceId = parseInt(filterOptions.default)

            if(isNaN(workspaceId)){
                throw new Error('invalid workspaceId')
            }

            if(!(await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspaceId))){
                return 'no permission to access this workspace'
            }

            const handle = await getCore().modules.workspace.activateTrafficSensing(workspaceId)
            this.activeHandles.set(client.id, handle)

        }, (event, filter, client)=>{
            const handle = this.activeHandles.get(client.id)
            if(handle){
                handle.stop()
            }
        })

    }

    /**
     * if the new geoObject has the same uuid as an existing one, and the same data, no error wil be thrown!
     */
    async createGeoObject(data: DBInsert_Geo_Object){
        const existingObject = (await select_Geo_Object(pgp.as.format('WHERE uuid = ${uuid}', {uuid: data.uuid})))[0]

        if(existingObject){
            const areSame = areSameGeoObjects(existingObject, data)
            if(areSame === true){
                console.log('a geoObject with the same uuid and same data already exists', existingObject.uuid)
                return existingObject
            } else {
                console.error(existingObject, data)
                throw new Error(`a different geoObject with the same uuid already exists, difference: ${areSame}, id: ${existingObject.id}, uuid: ${existingObject.uuid}`)
            }
        }

        const geoObject = await insert_Geo_Object(data)

        this.dispatch('create_geo_object', {
            id: geoObject.id,
            workspaceId: typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : true
        }, geoObject)

        this.subscribableEventHandlerGeoObjects.triggerListener('' + geoObject.workspace_id, {
            event_type: 'create',
            uuid: geoObject.uuid,
            data: geoObject
        })

        return geoObject
    }

    /**
     *
     * @param idOrUUID id = number, uuid = string
     * @returns false if does not exist
     * @see updateGeoObjectSafe
     */
    async updateGeoObject(idOrUUID: number | string, data: DBUpdate_Geo_Object){

        data.updated_at = dayjs().toISOString()

        let geoObject = (await update_Geo_Object(typeof idOrUUID === 'string' ? pgp.as.format('WHERE uuid = ${uuid}', {uuid: idOrUUID}) : idOrUUID, data))

        if(geoObject === false){
            return false
        }

        if(geoObject instanceof Array){
            geoObject = geoObject[0]
        }

        this.dispatch('update_geo_object', {
            id: geoObject.id,
            workspaceId: typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : true
        }, geoObject)

        this.subscribableEventHandlerGeoObjects.triggerListener('' + (typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : 'global'), {
            event_type: 'update',
            uuid: geoObject.uuid,
            data: geoObject
        })

        return geoObject
    }

    /**
     *
     * @see updateGeoObject
     */
    updateGeoObjectSafe = makeFunctionIdSafe(this, this.updateGeoObject)

    /**
     *
     * @returns false if does not exist
     * @see deleteGeoObjectSafe
     */
    async deleteGeoObject(idOrUUID: number | string){
        let geoObject = await delete_Geo_Object(typeof idOrUUID === 'string' ? pgp.as.format('WHERE uuid = ${uuid}', {uuid: idOrUUID}) : idOrUUID)

        if(geoObject === false){
            return false
        }

        if(geoObject instanceof Array){
            geoObject = geoObject[0]
        }

        const workspaceKey = typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : -1
        let workspaceMap = this.existingGeoObjectsNameIdMap.get(workspaceKey)
        if(workspaceMap){
            workspaceMap.delete(geoObject.name)
        }

        this.dispatch('delete_geo_object', {
            id: geoObject.id,
            workspaceId: typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : true
        }, geoObject)


        this.subscribableEventHandlerGeoObjects.triggerListener(typeof geoObject.workspace_id === 'number' ? '' + geoObject.workspace_id : '', {
            event_type: 'delete',
            uuid: geoObject.uuid,
            data: undefined
        })
    }

    /**
     *
     * @see deleteGeoObject
     */
    deleteGeoObjectSafe = makeFunctionIdSafe(this, this.deleteGeoObject)

    /**
     *
     * @returns false if does not exist
     * @see getGeoObjectSafe
     */
    async getGeoObject(idOrUUID: number | string){
        let ret = await select_Geo_Object(typeof idOrUUID === 'string' ? pgp.as.format('WHERE uuid = ${uuid}', {uuid: idOrUUID}) : idOrUUID)

        if(ret instanceof Array){
            ret = ret[0]
        }

        return ret
    }

    /**
     *
     * @see getGeoObject
     */
    getGeoObjectSafe = makeFunctionIdSafe(this, this.getGeoObject)

    async getGeoObjectsWithTasks(geoObjects: DBType_Geo_Object[]) {

        const geoObjectsWithTasks: (DBType_Geo_Object & {tasks: {id: number}[]})[] = []

        await Promise.all(geoObjects.map(geoObject => {
            return db.manyOrNone<{id: number}>('SELECT tasks.id FROM tasks INNER JOIN task_geo_objects ON tasks.id = task_geo_objects.task_id WHERE task_geo_objects.geo_object_id = ${geoObjectId}', {
                geoObjectId: geoObject.id
            }).then(tasks => {
                geoObjectsWithTasks.push(assignObject(geoObject, {
                    tasks
                }))
            })
        }))

        return geoObjectsWithTasks
    }

    /**
     *
     * @param data
     * @param workspaceId only set for traffic data, that you dont want to make globally available
     * @returns
     */
    async processTrafficSensingData(data: TrafficData, workspaceId?: number){

        if(this.existingGeoObjectsNameIdMap_isInitialized === false){
            return
        }

        const filter = typeof workspaceId === 'number' ? '' + workspaceId : ''

        // using a hasmap fixes a nasty race condition
        const workspaceKey = typeof workspaceId === 'number' ? workspaceId : -1
        let workspaceMap = this.existingGeoObjectsNameIdMap.get(workspaceKey)

        if(!workspaceMap){
            workspaceMap = new Map<string, number>()
            this.existingGeoObjectsNameIdMap.set(workspaceKey, workspaceMap)
        }

        let existingGeoObjectId = workspaceMap.get(data.name)//TODO use id
        let existingGeoObject: DBType_Geo_Object | undefined

        if(typeof existingGeoObjectId === 'number'){
            if(existingGeoObjectId === -1){
                //skip: insert is not done yet
                return
            }

            existingGeoObject = await this.updateGeoObjectSafe(existingGeoObjectId, {
                config: {
                    longitude: data.position.longitude,
                    latitude: data.position.latitude,
                    height: data.position.height
                },
                workspace_id: typeof workspaceId === 'number' ? workspaceId : undefined
            })

            this.subscribableEventHandlerGeoObjects.triggerListener(filter, {
                event_type: 'update',
                uuid: existingGeoObject.uuid,
                data: existingGeoObject
            })

        } else {

            workspaceMap.set(data.name, -1)// a flag to prevent race conditions, see above

            existingGeoObject = await insert_Geo_Object({
                type: DBType_Geo_Object_Type_TYPES.traffic,
                name: data.name,
                workspace_id: workspaceId,
                sub_type: mapTrafficTypeToDBType(data.type),
                config: {
                    longitude: data.position.longitude,
                    latitude: data.position.latitude,
                    height: data.position.height
                }
            })

            workspaceMap.set(existingGeoObject.name, existingGeoObject.id)

            this.subscribableEventHandlerGeoObjects.triggerListener(filter, {
                event_type: 'create',
                uuid: existingGeoObject.uuid,
                data: existingGeoObject
            })
        }
    }

    private parseFilter(filter: string){
        const filterOptions: Record<string, any> & {default: string} = {
            default: ''
        }

        const filterParts = filter.split('&')
        filterParts.map(fp => {
            const keyValueSplit = fp.split('=')
            if(keyValueSplit.length === 1){
                filterOptions['default'] = keyValueSplit[0]
            } else if(keyValueSplit.length === 2) {
                const key = keyValueSplit[0]
                let value = keyValueSplit[1]

                try {
                    const parsed = JSON.parse(value)
                    value = parsed
                } catch (err){
                    //ignored
                }

                filterOptions[key] = value
            } else {
                throw new Error('invalid syntax for filter options "' + filter + '"')
            }
        })

        return filterOptions
    }

    private async initExistingGeoObjectsNameIdMap() {

        const oldGeoObjects = await select_Geo_Object(pgp.as.format('WHERE type = ${type} AND updated_at < ${cleanupDate}', {
            type: DBType_Geo_Object_Type_TYPES.traffic,
            cleanupDate: dayjs().subtract(1, 'hour').toISOString()
        }))

        await Promise.all(oldGeoObjects.map(geoObject => {
            return this.deleteGeoObject(geoObject.id)
        }))


        const trafficGeoObjects = await db.manyOrNone('SELECT name, id FROM geo_objects WHERE type = ${type}', {type: DBType_Geo_Object_Type_TYPES.traffic})


        for(const geoObject of trafficGeoObjects){
            const workspaceKey = typeof geoObject.workspace_id === 'number' ? geoObject.workspace_id : -1

            let workspaceMap = this.existingGeoObjectsNameIdMap.get(workspaceKey)

            if(!workspaceMap){
                workspaceMap = new Map<string, number>()
                this.existingGeoObjectsNameIdMap.set(workspaceKey, workspaceMap)
            }

            workspaceMap.set(geoObject.name, geoObject.id)
        }
        this.existingGeoObjectsNameIdMap_isInitialized = true
    }

    private async cleanupOldTrafficGeoObjects(){
        const oldTrafficGeoObjects = await db.manyOrNone('SELECT * FROM geo_objects WHERE type = ${type} AND updated_at < ${cleanupDate}', {
            type: DBType_Geo_Object_Type_TYPES.traffic,
            cleanupDate: dayjs().subtract(1, 'minute').toISOString()
        })

        for(const geoObject of oldTrafficGeoObjects){
            await this.deleteGeoObject(geoObject.id)
        }
    }

}


/**
 *
 * @returns true or a string describing what is different between the two geoObjects
 */
function areSameGeoObjects(geoObject1: DBType_Geo_Object, geoObject2: DBInsert_Geo_Object){
    if(geoObject1.uuid !== geoObject2.uuid) return 'uuid'
    if(geoObject1.name !== geoObject2.name) return 'name'
    if(geoObject1.type !== geoObject2.type) return 'type'
    if(geoObject1.sub_type !== geoObject2.sub_type) return 'sub_type'
    if(geoObject1.workspace_id !== geoObject2.workspace_id) return 'workspace_id'
    if(JSON.stringify(geoObject1.config) !== JSON.stringify(geoObject2.config)) return 'config'

    return true
}

function mapTrafficTypeToDBType(trafficType: TrafficType): number {
    switch (trafficType) {
        case 'aircraft':
            return DBType_Geo_Object_SubType_TYPES.traffic.airplane
        case 'helicopter':
            return DBType_Geo_Object_SubType_TYPES.traffic.helicopter
        case 'glider':
            return DBType_Geo_Object_SubType_TYPES.traffic.glider
        case 'uav':
            return DBType_Geo_Object_SubType_TYPES.traffic.uav
        case 'chute':
            return DBType_Geo_Object_SubType_TYPES.traffic.chute
            case 'other':
            return DBType_Geo_Object_SubType_TYPES.traffic.other
    }
}
