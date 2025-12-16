
import {DBType_Geo_Object, DBType_Geo_Object_SubType_TYPES, DBType_Geo_Object_SubTypeType, DBType_Geo_Object_Type_TYPES, DBType_Geo_Object_TypeType} from '../../generated-definitions/db/DBTypes'
import {DBInsert_Geo_Object, DBUpdate_Geo_Object, delete_Geo_Object, insert_Geo_Object, update_Geo_Object} from '../../generated-definitions/db/DBHelpers'
import Module_Base from './Module_Base'
import { joinObjects } from '../../util/object'
import {filterObject, validate} from '../../util/schema'
import { JSONSchema4 } from '../../util/types/JSONSchema'


type Deserialized_DBType_GeoObject = Omit<DBType_Geo_Object, 'config'> & {config: GeoObjectConfig}

export default class GeoObjectModule extends Module_Base<
    {
        workspaceId: number,
        id: number
    },

    {
        create: {
            eventDataType: Deserialized_DBType_GeoObject,
            availableContexts: 'workspaceId' | 'id'
        },
        update: {
            eventDataType: Deserialized_DBType_GeoObject,
            availableContexts: 'workspaceId' | 'id'
        },
        delete: {
            eventDataType: Deserialized_DBType_GeoObject,
            availableContexts: 'workspaceId' | 'id'
        }
    }
> {

    constructor(){
        super()
    }

    private async create(data: DBInsert_Geo_Object){
        const geoObject = await insert_Geo_Object(data)

        this.dispatch('create', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, joinObjects(geoObject, {
            config: GeoObjectSerializer.deserializeConfigFor(geoObject.config)
        }))

        return geoObject
    }

    private async update(id: number, data: DBUpdate_Geo_Object){
        const geoObject = await update_Geo_Object(data, id)

        this.dispatch('update', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, geoObject)

        return geoObject
    }

    async delete(id: number){
        const geoObject = await delete_Geo_Object(id)

        this.dispatch('delete', {
            id: geoObject.id,
            workspaceId: geoObject.workspace_id
        }, geoObject)
    }



    // Marking

    create_marking_point(baseData: Insert_GeoObject_BaseData, point: GeoObjectConfig_Marking_Point){
        this.create(joinObjects(baseData, {
            type: DBType_GeoObject_TYPES.marking,
            sub_type: DBType_GeoObject_SUB_TYPES.marking_point,
            config: GeoObjectSerializer.serializeConfig(point, GeoObjectConfig_Schema_Marking_Point)
        }))
    }

}


type Insert_GeoObject_BaseData = Omit<DBInsert_Geo_Object, 'type' | 'sub_type' | 'config' | 'created_at' | 'updated_at'>



type GeoObjectConfig = GeoObjectConfig_Marking_Point // TODO |

type GeoObjectConfig_Marking_Point = {
    longitude: number
    latitude: number
}

//const GeoObjectConfig_Schemas: {[key: DBType_GeoObject_TypeType]: {[key: DBType_GeoObject_SubTypeType]: JSONSchema}}

type GeoObjectConfig_Schema = JSONSchema4

const GeoObjectConfig_Schema_Marking_Point: GeoObjectConfig_Schema = {
    type: 'object',
    required: ['longitude', 'latitude'],
    properties: {
        longitude: {
            type: 'number'
        },
        latitude: {
            type: 'number'
        }
    }
}

class GeoObjectSerializer {

    static serializeConfig(configObject: {[key: string]: any}, schema: GeoObjectConfig_Schema){
        return JSON.stringify(filterObject(configObject, schema))
    }

    static deserializeConfig<T extends GeoObjectConfig>(json: string, schema: GeoObjectConfig_Schema){
        const parsed = JSON.parse(json)

        return filterObject<T>(parsed, schema)
    }

    static deserializeConfigFor<T extends GeoObjectConfig>(json: string, type: DBType_Geo_Object_TypeType, subType: DBType_Geo_Object_SubTypeType){
        const parsed = JSON.parse(json)

        return filterObject<T>(parsed, schema)
    }
}