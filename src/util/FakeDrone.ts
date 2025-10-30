import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { addDroneData, DRONE_DATA_TYPES } from "./drone"
import FakeTrack from './FakeTrack'
import { insertFlightData, selectDrone } from '../generated-definitions/db/DBHelpers'
import { DBType_FlightData_TYPES } from '../generated-definitions/db/DBTypes'

export default class FakeDrone {

    private droneId: number
    private fakeTrack: FakeTrack

    constructor(droneId: number, fakeVehicle: FakeTrack){
        this.droneId = droneId

        this.fakeTrack = fakeVehicle


        setInterval(()=>{

            const currentPosition = this.fakeTrack.getCurrentPosition()

            addDroneData(this.droneId, DRONE_DATA_TYPES.POSITION, {//TODO latitude and longitude seems to be reversed
                longitude: currentPosition.longitude,
                latitude: currentPosition.latitude,
                height: this.fakeTrack.getCurrentHeight()
            })

            this.getFlightId().then(flightId=>{
                insertFlightData({
                    created_at: new Date().toISOString(),
                    data: JSON.stringify({
                        longitude: currentPosition.longitude,
                        latitude: currentPosition.latitude,
                        height: this.fakeTrack.getCurrentHeight()
                    }),
                    flight_id: flightId,
                    type: DBType_FlightData_TYPES.position
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
        return (await selectDrone(this.droneId)).current_flight_id
    }

}