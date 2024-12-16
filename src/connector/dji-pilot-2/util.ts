import * as turf from "@turf/turf"

export type PathWithHeightEntry = [number, number, number]
export type PathWithHeight = PathWithHeightEntry[]

/**
 *
 * @param path
 * @param distance in meters
 * @returns in meters
 */
export function heightAlong(path: PathWithHeight, distance: number){
    let traveledDistance = 0

    for(let i = 0; i < path.length; i++){

        const current = path[i]
        const next = path[i+1]

        if(next instanceof Array === false){
            console.warn('distance is beyond path', distance, path)
            return 0
        }

        const distanceUntilNext = turf.distance([current[0], current[1]], [next[0], next[1]], {units: 'meters'})

        const traveledDistanceIncludingNext = traveledDistance + distanceUntilNext
        if(distance <= traveledDistanceIncludingNext){
            const relativeDistanceFromCurrentToNext = (distance - traveledDistance) / distanceUntilNext
            return getIntermediateHeight(current, next, relativeDistanceFromCurrentToNext)
        }

        traveledDistance = traveledDistanceIncludingNext
    }


}


/**
 *
 * @param relativePath e.g. 0.3 for the height at 30% distance from "begin" to "end"
 */
function getIntermediateHeight(begin: PathWithHeightEntry, end: PathWithHeightEntry, relativePath: number){
    return begin[2] + (end[2] - begin[2]) * relativePath
}