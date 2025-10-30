
import {DBType_GeoObject} from '../../db/DBTypes'
import Module_Base from './Module_Base'


class GeoObjectModule extends Module_Base<

{
    workspaceId: number,
    id: number
},

{
    create: {
        eventDataType: DBType_GeoObject,
        availableContexts: 'workspaceId' | 'id'
    },
    update: {
        eventDataType: DBType_GeoObject,
        availableContexts: 'workspaceId' | 'id'
    },
    delete: {
        eventDataType: Pick<DBType_GeoObject, 'id' | 'uuid'>,
        availableContexts: 'workspaceId' | 'id'
    }
}> {

    constructor(){
        super()

    }

}



const mapObject = new GeoObjectModule()

mapObject.listenTo('delete', {
    workspaceId: 42
}, (eventName, contexts, data)=>{

})