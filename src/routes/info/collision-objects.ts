import { bbox, circle } from '@turf/turf';
import express from 'express';
import asyncHandler from 'express-async-handler'
import { GuardError } from '../../ManInTheMiddleware';
import { ApiSchema_Info_Collision_Objects } from '../../generated-definitions/api/ApiSchemas';
import { ApiType_Info_Collision_Objects, ApiType_Info_Collision_Objects_Marking } from '../../generated-definitions/api/ApiTypes';


/*
getCollisionObjects(10.2571, 47.5422, 5000).then(result => {
    collisionObjectsCache = result
    console.log('preloaded collision objects cache with', result.length, 'objects')
}).catch(err => {
    console.error('failed to preload collision objects cache', err)
})*/

type OsmElement = {
    type: 'node'
    id: number
    lat: number
    lon: number
    tags: OpenStreetMapTags
} | {
    type: 'way'
    id: number
    nodes: number[]
    geometry: {lat: number, lon: number}[]
    tags: OpenStreetMapTags
}

type OpenStreetMapTags = {
    name?: string
    power?: 'line' | 'tower' | 'minor_line' | 'pole' | 'catenary_mast'
    aerialway?: 'pylon' | 'chair_lift' | 'goods' | 'zip_line' | 'gondola' | 'cable_car' | 'yes' | 'mixed_lift'
}

const router = express.Router()

let collisionObjectsCache: ApiType_Info_Collision_Objects | null = null

router.get('/', asyncHandler(async (req, res) => {

    const longitude = req.GM.guardQueryParam('longitude', 'number')
    const latitude = req.GM.guardQueryParam('latitude', 'number')
    const radius = req.GM.guardQueryParam('radius', 'number')

    if(radius <= 0){
        res.GM.guardSend<ApiType_Info_Collision_Objects>([], ApiSchema_Info_Collision_Objects)
        return
    }

    if(collisionObjectsCache){
        res.GM.guardSend<ApiType_Info_Collision_Objects>(collisionObjectsCache, ApiSchema_Info_Collision_Objects)
        return
    }

    const ret = await getCollisionObjects(longitude, latitude, radius)
    collisionObjectsCache = ret

    res.GM.guardSend<ApiType_Info_Collision_Objects>(ret, ApiSchema_Info_Collision_Objects)
}))

async function getCollisionObjects(longitude: number, latitude: number, radius: number){

    const area = bbox(circle([longitude, latitude], radius, {units: 'meters'}))


    const body = 'data=' + encodeURIComponent(`[out:json];
    (
    nwr["power"="line"]({{bbox}});
    nwr["power"="tower"]({{bbox}});
    nwr["power"="minor_line"]({{bbox}});
    nwr["power"="pole"]({{bbox}});
    nwr["power"="catenary_mast"]({{bbox}});
    nwr["aerialway"="pylon"]({{bbox}});
    nwr["aerialway"="chair_lift"]({{bbox}});
    nwr["aerialway"="goods"]({{bbox}});
    nwr["aerialway"="zip_line"]({{bbox}});
    nwr["aerialway"="gondola"]({{bbox}});
    nwr["aerialway"="cable_car"]({{bbox}});
    nwr["aerialway"="yes"]({{bbox}});
    nwr["aerialway"="mixed_lift"]({{bbox}});
    );
    out geom;`.replaceAll("{{bbox}}", `${area[1]},${area[0]},${area[3]},${area[2]}`))

    let result: Response
    try {
        result = await fetch("https://overpass-api.de/api/interpreter", {
            "credentials": "omit",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
                "Priority": "u=0",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            },
            "referrer": "https://overpass-turbo.eu/",
            "body": body,
            "method": "POST",
            "mode": "cors"
        })

        if(('' + result.status).startsWith('2') == false){
            throw new Error(result.status + ': ' + result.statusText + ' - ' + await result.text())
        }

    } catch (ex){
        console.error('failed to fetch collision objects from overpass api', ex)
        throw new GuardError(500, 'failed to fetch collision objects')
    }


    const jsonResult = await result.json() as {elements: OsmElement[]}

    //TODO possible improvement: if height tag exists, we could use that to determine height_above_ground. E.g. for aerialways, if height for a node is gifen, we could use that
    // right now the most elements in openstreetmap lack this information, so probably not worth it

    const ret: ApiType_Info_Collision_Objects = jsonResult.elements.map(convertOsmElementToCollisionObject).filter(e => e !== false)

    return ret
}

function convertOsmElementToCollisionObject(element: OsmElement): ApiType_Info_Collision_Objects[number] | false {

    //   5 = aerialway (like chair lift or gondola), 6 = building (e.g. tower)"
    if(element.type === 'node'){

        if(element.tags.power === 'tower'){
            return {
                type: 0,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 0,
                    longitude: element.lon,
                    latitude: element.lat,
                    height_above_ground: 80
                }
            }
        } else if (element.tags.power === 'pole' || element.tags.power === 'catenary_mast'){
            return {
                type: 1,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 0,
                    longitude: element.lon,
                    latitude: element.lat,
                    height_above_ground: 30
                }
            }
        } else if(element.tags.aerialway === 'pylon'){
            return {
                type: 4,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 0,
                    longitude: element.lon,
                    latitude: element.lat,
                    height_above_ground: 50
                }
            }
        }

    } else if(element.type === 'way'){

        if(element.tags.power === 'line'){
            return {
                type: 2,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 1,
                    points: element.geometry.map(g => {
                        return {
                            longitude: g.lon,
                            latitude: g.lat,
                            height_above_ground: 80
                        }
                    })
                }
            }
        } else if(element.tags.power === 'minor_line'){
            return {
                type: 3,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 1,
                    points: element.geometry.map(g => {
                        return {
                            longitude: g.lon,
                            latitude: g.lat,
                            height_above_ground: 30
                        }
                    })
                }
            }
        } else if(element.tags.aerialway === 'cable_car' || element.tags.aerialway === 'gondola' || element.tags.aerialway === 'chair_lift' || element.tags.aerialway === 'zip_line' || element.tags.aerialway === 'goods' || element.tags.aerialway === 'mixed_lift' || element.tags.aerialway === 'yes'){
            return {
                type: 5,
                id: element.id,
                name: element.tags.name ?? '',
                marking: {
                    type: 1,
                    points: element.geometry.map(g => {
                        return {
                            longitude: g.lon,
                            latitude: g.lat,
                            height_above_ground: 50
                        }
                    })
                }
            }
        }
    }

    return false
}

export default router
