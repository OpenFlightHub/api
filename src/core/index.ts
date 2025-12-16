import GeoObjectModule from './modules/GeoObjectModule'

export default class Core {

    geoObject: GeoObjectModule

    constructor(){
        this.geoObject = new GeoObjectModule()
    }
}

const core = new Core()

core.geoObject.create_marking_point({
    name: 'name',
    workspaceId: 1
}, {
    longitude: 42,
    latitude: 10
})