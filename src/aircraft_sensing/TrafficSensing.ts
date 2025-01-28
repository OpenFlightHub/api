import { EventManager } from '../util/event_manager'
import SensingSource, { SensingSourceAreaFactory, SensingSourceHandle } from './Source'
import FakeSensingArea from './sources/Fake'
import AdsbExchangeSensingArea from './sources/AdsbExchange'
import AdsbLolSensingArea from './sources/AdsbLol'
import GliderNetSensingArea from './sources/GliderNet'

export type TrafficData = {
    id: string
    position: {
        latitude: number
        longitude: number
        height?: number
        reported_at: string // ISO 8601 timestamp
    }
}


export default class TrafficSensing {

    private readonly sources: SensingSource[] = []

    constructor(){
        this.addSource(FakeSensingArea.getFactory())
        //this.addSource(AdsbExchangeSensingArea.getFactory())
        //this.addSource(AdsbLolSensingArea.getFactory())
        this.addSource(GliderNetSensingArea.getFactory())
    }

    private addSource(factory: SensingSourceAreaFactory){
        this.sources.push(new SensingSource(factory))//TODO each source should have its own id prefix, also we should try to aggregate all sources and remove duplicates
    }


    /**
     * @param radius in meters
     */
    startSensing(latitude: number, longitude: number, radius: number){

        const sourceHandles: SensingSourceHandle[] = []

        for(const source of this.sources){
            sourceHandles.push(source.startSensing(latitude, longitude, radius))
        }

        return new SensingHandle(sourceHandles)
    }
}


export type SensingHandleEvents = {
    'traffic': TrafficData
    'stopped': undefined
}

/**
 * Combines multiple SensingSourceHandles
 */
export class SensingHandle extends EventManager<SensingHandleEvents> {

    private readonly sourceHandles: SensingSourceHandle[]

    constructor(sourceHandles: SensingSourceHandle[]){
        super()

        this.sourceHandles = sourceHandles

        for(const sourceHandle of this.sourceHandles){
            sourceHandle.addListener('traffic', data => {
                this.dispatch('traffic', data)
            })
        }
    }

    stop(){

        for(const sourceHandle of this.sourceHandles){
            sourceHandle.stop()
        }

        this.dispatch('stopped', undefined)
    }
}


