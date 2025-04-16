import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { addDroneData, DRONE_DATA_TYPES } from "./drone"
import FakeTrack from './FakeTrack'
import { selectDrone } from '../db/DBHelpers'

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