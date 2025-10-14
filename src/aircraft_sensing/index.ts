import { ClientId, registerSubscribableEvent } from '../live-websocket/websocket'
import TrafficSensing, { SensingHandle } from './TrafficSensing'

const activeHandles = new Map<ClientId, SensingHandle>()

export function setupTrafficSensing(){
    const aircraftSensing = new TrafficSensing()

    const subscribableEventHandlerAircraft = registerSubscribableEvent('traffic', (event, filter, client)=>{

        if(activeHandles.has(client.id)){
            console.warn('prevented a client from subscribing to multiple traffic sensing filters', client.id)
            return 'can not have multiple traffic filters'
        }

        const parsed = parseFilter(filter)

        const handle = aircraftSensing.startSensing(parsed.latitude, parsed.longitude, parsed.distance)

        handle.addListener('traffic', (data)=>{
            subscribableEventHandlerAircraft.triggerListener(filter, data)
        })

        activeHandles.set(client.id, handle)

    }, (event, filter, client)=>{
        const handle = activeHandles.get(client.id)
        if(handle){
            handle.stop()
        }
    })

    return aircraftSensing
}

function parseFilter(filter: string){
    const match = filter.match(/^(\d+(\.\d+)?)\$(\d+(\.\d+)?)\$(\d+(\.\d+)?)$/)

    const latitude = parseFloat(match[1])
    const longitude = parseFloat(match[3])
    const distance = parseFloat(match[5])

    return {
        latitude,
        longitude,
        distance
    }
}