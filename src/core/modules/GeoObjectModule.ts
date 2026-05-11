
import {DBType_Geo_Object, DBType_Geo_Object_SubType_TYPES, DBType_Geo_Object_Type_TYPES} from '../../generated-definitions/db/DBTypes'
import {DBInsert_Geo_Object, DBUpdate_Geo_Object, delete_Geo_Object, insert_Geo_Object, select_Geo_Object, update_Geo_Object} from '../../generated-definitions/db/DBHelpers'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'

import { registerSubscribableEvent, SubscribableEventHandler } from '../../live-websocket/websocket'
import { ClientId } from '../../live-websocket/websocket'
import TrafficSensing, { SensingHandle } from '../../aircraft_sensing/TrafficSensing'


import pgp from 'pg-promise'
import { getCore } from '..'
//@ts-ignore
const db = global.db as pgp.IDatabase<any>

export default class GeoObjectModule extends Module_Base<
    {
        workspaceId: number,
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

    private readonly aircraftSensing = new TrafficSensing()

    private readonly activeHandles = new Map<ClientId, SensingHandle>()

    private existingGeoObjectsNameIdMap = new Map<string, number>()

    constructor(){
        super()

        this.subscribableEventHandlerGeoObjects = registerSubscribableEvent('geo_object', async(event, filter, client)=>{

            if(this.activeHandles.has(client.id)){
                console.warn('prevented a client from subscribing to multiple traffic sensing filters', client.id)
                return 'can not have multiple traffic filters'
            }

            const filterOptions = this.parseFilter(filter)

            const workspaceId = parseInt(filterOptions.default)

            if(isNaN(workspaceId)){
                throw new Error('invalid workspaceId')
            }

            if(!(await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspaceId))){
                return 'no permission to access this workspace'
            }

            const sensingArea = filterOptions.area

            if(sensingArea){
                //TODO validate sensing area
                const handle = this.aircraftSensing.startSensing(sensingArea.latitude, sensingArea.longitude, sensingArea.radius)

                handle.addListener('traffic', async(data)=>{

                    const name = data.name

                    //TODO urgent: race condition: if two updates for the same traffic data come in at the same time, we might end up with two geoObjects for the same traffic, because both will check if a geoObject with the same name (which is the traffic id) exists, see that it does not exist and then both will create a new one. We should add some locking mechanism to prevent this, or at least add some retry logic to update an existing one if it was created in the meantime

                    // using a hasmap fixes a nasty race condition
                    let existingGeoObjectId = this.existingGeoObjectsNameIdMap.get(name)
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
                            }
                        })

                        this.subscribableEventHandlerGeoObjects.triggerListener(filter, {
                            event_type: 'update',
                            uuid: existingGeoObject.uuid,
                            data: existingGeoObject
                        })

                    } else {

                        this.existingGeoObjectsNameIdMap.set(name, -1)

                        existingGeoObject = await insert_Geo_Object({
                            type: DBType_Geo_Object_Type_TYPES.traffic,
                            name: name,
                            workspace_id: workspaceId,
                            sub_type: DBType_Geo_Object_SubType_TYPES.traffic.other, //TODO implement type from sensing area
                            config: {
                                longitude: data.position.longitude,
                                latitude: data.position.latitude,
                                height: data.position.height
                            }
                        })

                        this.existingGeoObjectsNameIdMap.set(existingGeoObject.name, existingGeoObject.id)

                        this.subscribableEventHandlerGeoObjects.triggerListener(filter, {
                            event_type: 'create',
                            uuid: existingGeoObject.uuid,
                            data: existingGeoObject
                        })
                    }

                    //TODO add something that checks if traffic has not been seen for 60 seconds and then trigger 'delete' event and kill it from database
                })

                this.activeHandles.set(client.id, handle)
            }

        }, (event, filter, client)=>{
            const handle = this.activeHandles.get(client.id)
            if(handle){
                handle.stop()
            }
        })

        //TODO ensure this is done before any traffic sensing data is processed, otherwise we might end up with duplicates
        select_Geo_Object(pgp.as.format('WHERE type = ${type}', {type: DBType_Geo_Object_Type_TYPES.traffic})).then(geoObjects => {
            for(const geoObject of geoObjects){
                this.existingGeoObjectsNameIdMap.set(geoObject.name, geoObject.id)
            }
        }).catch(err=>{
            console.error('failed to initialize existingGeoObjectsNameIdMap', err)
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
            workspaceId: geoObject.workspace_id
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
        let geoObject = (await update_Geo_Object(typeof idOrUUID === 'string' ? pgp.as.format('WHERE uuid = ${uuid}', {uuid: idOrUUID}) : idOrUUID, data))

        if(geoObject === false){
            return false
        }

        if(geoObject instanceof Array){
            geoObject = geoObject[0]
        }

        this.dispatch('update_geo_object', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, geoObject)

        this.subscribableEventHandlerGeoObjects.triggerListener('' + geoObject.workspace_id, {
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

        this.dispatch('delete_geo_object', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, geoObject)


        this.subscribableEventHandlerGeoObjects.triggerListener('' + geoObject.workspace_id, {
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
