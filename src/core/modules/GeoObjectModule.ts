
import {DBType_Geo_Object, DBType_Geo_Object_SubType_TYPES, DBType_Geo_Object_Type_TYPES} from '../../generated-definitions/db/DBTypes'
import {DBInsert_Geo_Object, DBUpdate_Geo_Object, delete_Geo_Object, insert_Geo_Object, select_Geo_Object, update_Geo_Object} from '../../generated-definitions/db/DBHelpers'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'

import { registerSubscribableEvent, SubscribableEventHandler } from '../../live-websocket/websocket'
import { ClientId } from '../../live-websocket/websocket'
import TrafficSensing, { SensingHandle } from '../../aircraft_sensing/TrafficSensing'


import pgp from 'pg-promise'
import { getCore } from '..'
const db : pgp.IDatabase<any> = global.db

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

    constructor(){
        super()

        this.subscribableEventHandlerGeoObjects = registerSubscribableEvent('geo_object', async(event, filter, client)=>{

            if(this.activeHandles.has(client.id)){
                console.warn('prevented a client from subscribing to multiple traffic sensing filters', client.id)
                return 'can not have multiple traffic filters'
            }

            const filterOptions = this.parseFilter(filter)

            const workspaceId = parseInt(filterOptions.default)

            if(!(await getCore().modules.user.userHasPermissionForWorkspace(client.userId, workspaceId))){
                return 'no permission to access this workspace'
            }

            const sensingArea = filterOptions.area

            if(sensingArea){
                const handle = this.aircraftSensing.startSensing(parseFloat(sensingArea.latitude), sensingArea.longitude, sensingArea.radius)

                handle.addListener('traffic', async (data)=>{

                    let existingGeoObject = await db.oneOrNone<DBType_Geo_Object>('SELECT * FROM geo_objects WHERE type = ${type} AND name = ${name};', {
                        type: DBType_Geo_Object_Type_TYPES.traffic,
                        name: data.id
                    })

                    if(existingGeoObject){
                        existingGeoObject = await this.updateGeoObjectSafe(existingGeoObject.id, {
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
                        existingGeoObject = await insert_Geo_Object({
                            type: DBType_Geo_Object_Type_TYPES.traffic,
                            name: data.id,
                            workspace_id: workspaceId,
                            sub_type: DBType_Geo_Object_SubType_TYPES.traffic.other, //TODO implement type from sensing area
                            config: {
                                longitude: data.position.longitude,
                                latitude: data.position.latitude,
                                height: data.position.height
                            }
                        })

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
    }

    async createGeoObject(data: DBInsert_Geo_Object){
        const geoObject = await insert_Geo_Object(data)

        this.dispatch('create_geo_object', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, geoObject)

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
                filterOptions['default'] === keyValueSplit[1]
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

