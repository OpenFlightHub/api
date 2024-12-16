import * as turf from "@turf/turf"
import { Feature, LineString } from "geojson"
import { addDroneData, DRONE_DATA_TYPES } from "../../util/drone"
import { PathWithHeight, heightAlong } from './util'

export default class FakeDrone {

    private droneId: number
    private path: PathWithHeight
    private line: Feature<LineString>
    private lineLength: number // in meters
    private currentDistance = 0 // in meters

    private speed: number // in meters per tick

    private lastTick = Date.now()
    /**
     *
     * @param droneId
     * @param path [[long, lat, height]] height is being ignored right now!
     * @param speed in meters/second
     */
    constructor(droneId: number, path: PathWithHeight, speed: number){//TODO implement height
        this.droneId = droneId

        this.path = path
        this.line = turf.lineString(this.removeHeightFromPath(path))
        this.lineLength = turf.length(this.line, {
            units: 'meters'
        })

        this.speed = speed

        const millisecondsBetweenTicks = 100
        setInterval(this.nextTick.bind(this), millisecondsBetweenTicks)
    }

    private nextTick(){
        const now = Date.now()
        const tickDelta = now - this.lastTick
        this.lastTick = now

        const distanceTraveled = this.speed * (tickDelta / 1000)

        this.currentDistance += distanceTraveled

        if(this.currentDistance > this.lineLength){
            this.currentDistance = 0
        }

        const currentPosition = turf.along(this.line, this.currentDistance, {units: "meters"})

        addDroneData(this.droneId, DRONE_DATA_TYPES.POSITION, {
            longitude: currentPosition.geometry.coordinates[0],
            latitude: currentPosition.geometry.coordinates[1],
            height: this.currentHeight()
        })
    }

    private removeHeightFromPath(path: PathWithHeight): [number, number][]{
        return path.map(p=>[p[0], p[1]])
    }

    private currentHeight(){
        return heightAlong(this.path, this.currentDistance)
    }

}