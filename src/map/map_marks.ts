import { DBType_WorkspaceMapElement } from '../generated-definitions/db/DBTypes';
import { ApiType_MapElementCircle, ApiType_MapElementLine, ApiType_MapElementPoint, ApiType_MapElementPolygon, ApiType_WorkspaceMapElementsGet } from '../generated-definitions/api/ApiTypes';
import { registerSubscribableEvent, SubscribableEventHandler } from '../live-websocket/websocket'

export function setupMapMarks(subscribeableEventHandlermapElements: SubscribableEventHandler<'map_element'>){

    //TODO implement map_elements sync (create http api, create ws event dispatching)
}

export function convertDbMapElementToApiMapElement(mapElement: DBType_WorkspaceMapElement){


    const ret = {
        id: mapElement.id,
        uuid: mapElement.uuid,
        name: mapElement.name,
        created_at: mapElement.created_at,
        updated_at: mapElement.created_at,
        type: mapElement.type,

        color: parseColorOfContentOrDefault(mapElement.content)
    }


    const parsedCoordinates = parseCoordinatesOfContent(mapElement.content)

    switch(mapElement.type){
        case 0: {
            (ret as ApiType_MapElementPoint).longitude = parsedCoordinates[0];
            (ret as ApiType_MapElementPoint).latitude = parsedCoordinates[1];

            (ret as ApiType_MapElementPoint).elevation = parsedCoordinates[2];
        } break

        case 1: {
            (ret as ApiType_MapElementLine).coordinates = parsedCoordinates.map(c => {
                return {
                    longitude: c[0],
                    latitude: c[1],
                    elevation: c[2]
                }
            })
        } break

        case 2: {
            (ret as ApiType_MapElementPolygon).coordinates = parsedCoordinates.map(p => {
                return p.map(c => {
                    return {
                        longitude: c[0],
                        latitude: c[1],
                        elevation: c[2]
                    }
                })
            })
        } break

        case 7: {
            (ret as ApiType_MapElementCircle).longitude = parsedCoordinates[0];
            (ret as ApiType_MapElementCircle).latitude = parsedCoordinates[1];

            (ret as ApiType_MapElementCircle).radius = JSON.parse(mapElement.content).geometry.radius;
        } break

        default: {
            throw new Error('unsupported map_element type: ' + mapElement.type)
        }
    }

    return ret as ApiType_WorkspaceMapElementsGet[0]
}



export function parseColorOfContentOrDefault(contentString: string){
    const DEFAULT_COLOR = '#2D8CF0'

    let parsed: any

    try {
        parsed = JSON.parse(contentString)
    } catch (err){
        console.warn('invalid content json string:', err)
        return DEFAULT_COLOR
    }

    try {
        return parsed.properties.color
    } catch (_){
        return DEFAULT_COLOR
    }
}

export function parseCoordinatesOfContent(contentString: string){
    let parsed: any

    try {
        parsed = JSON.parse(contentString)
    } catch (err){
        throw new Error('invalid content json string:', err)
    }

    return parsed.geometry.coordinates
}
