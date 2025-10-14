import FakeTrack from "../../util/FakeTrack";
import { SensingSourceArea } from "../Source";

let myIdCounter = 0

export default class FakeArea extends SensingSourceArea {

    private readonly myId = 'fake' + myIdCounter++
    private fakeTrack: FakeTrack
    private intervalHandle: any

    protected onSetup(): void {
        this.fakeTrack = new FakeTrack([
            [10.221,47.558,1400],
            [10.285,47.544,1600],
            [10.350,47.561,1900],
            [10.290,47.587,1600]], 200)

        this.intervalHandle = setInterval(()=>{

            const currentPosition = this.fakeTrack.getCurrentPosition()

            this.dispatch('traffic', {
                id: this.myId,
                name: this.myId,
                position: {
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                    height: this.fakeTrack.getCurrentHeight(),
                    reported_at: new Date().toISOString()
                }
            })

        }, 1000 * 2)
    }

    protected onShutdown(): void {
        clearInterval(this.intervalHandle)
    }
}
