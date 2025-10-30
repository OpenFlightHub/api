
import {DBType_GeoObject} from '../../db/DBTypes'
import Module_Base from './Module_Base'


class GeoObjectModule extends Module_Base<{
    create: {
        eventDataType: DBType_GeoObject,
        availableContexts: {
            workspaceId: number
        }
    },
    update: {
        eventDataType: DBType_GeoObject,
        availableContexts: {
            workspaceId: number
        }
    },
    delete: {
        eventDataType: Pick<DBType_GeoObject, 'id' | 'uuid'>,
        availableContexts: {
            workspaceId: number
        }
    }
}> {

    constructor(){
        super()

    }

}



const mapObject = new GeoObjectModule()

mapObject.listenTo('create', {
    a: 2
}, (eventName, contexts, data)=>{

})