import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { DRONE_DATA_TYPES } from "../core/modules/DroneModule"
import FakeTrack from './FakeTrack'
import { DBType_Flight_Data_TYPES } from '../generated-definitions/db/DBTypes'
import { getCore } from '../core'

export default class FakeDrone {

    private droneId: number
    private fakeTrack: FakeTrack

    constructor(droneId: number, fakeVehicle: FakeTrack){
        this.droneId = droneId

        this.fakeTrack = fakeVehicle


        setInterval(()=>{

            const currentPosition = this.fakeTrack.getCurrentPosition()

            getCore().modules.drone.addDroneData(this.droneId, DRONE_DATA_TYPES.POSITION, {//TODO latitude and longitude seems to be reversed
                longitude: currentPosition.longitude,
                latitude: currentPosition.latitude,
                height: this.fakeTrack.getCurrentHeight()
            })

            this.getFlightId().then(flightId=>{
                getCore().modules.flight.insertFlightData({
                    created_at: new Date().toISOString(),
                    data: JSON.stringify({
                        longitude: currentPosition.longitude,
                        latitude: currentPosition.latitude,
                        height: this.fakeTrack.getCurrentHeight()
                    }),
                    flight_id: flightId,
                    type: DBType_Flight_Data_TYPES.position
                })
            })

        }, 1000 * 2)
    }

    public getId(){
        return this.droneId
    }

    public getTrack(){
        return this.fakeTrack
    }

    public async getFlightId(){
        return (await getCore().modules.drone.get(this.droneId)).current_flight_id
    }

}