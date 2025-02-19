// data provided as ObenDB license, we need to follow some rules when publishing this service: https://opendatacommons.org/licenses/odbl/summary/

import { BeastHandler } from "beast-decoder";
import { EventManager } from "../../util/event_manager";
import { SensingSourceArea } from "../Source";
import * as turf from '@turf/turf'

import * as net from 'net'

const ADSB_LOL_RECONNECT_TIMEOUT = 1000 * 5

export default class AdsbLolSensingArea extends SensingSourceArea {

    private listenerFunction = this.handleAircraft.bind(this)

    protected onSetup(): void {
        adsbLolReceiver.addListener('aircraft', this.listenerFunction)
    }

    protected onShutdown(): void {
        adsbLolReceiver.removeListener('aircraft', this.listenerFunction)
    }

    private handleAircraft(ac: {
        icaoAddress: string
        location: {
            latitude: number
            longitude: number
        }
    }){
        const distance = turf.distance([this.latitude, this.longitude], [ac.location.latitude, ac.location.longitude])

        if(distance < this.radius){
            this.dispatch('traffic', {
                id: '[adsb.lol] ' + ac.icaoAddress,
                position: {
                    latitude: ac.location.latitude,
                    longitude: ac.location.longitude,
                    reported_at: new Date().toISOString() //TODO implement reported at and height in beast-decoder
                }
            })
        }
    }
}

type AdsbLolReceiverEvents = {
    'aircraft': {
        icaoAddress: string
        location: {
            latitude: number
            longitude: number
        }
    }
}

class AdsbLolReceiver extends EventManager<AdsbLolReceiverEvents> {

    private socket: net.Socket

    private socketShouldClose = false

    private readonly beastHandler: BeastHandler

    constructor(){
        super()

        this.beastHandler = new BeastHandler()
        this.beastHandler.addListener('aircraft_update_with_location', data => {
            this.dispatch('aircraft', data)
        })

        this.beastHandler.addListener('warning', wa => {
            console.warn(wa.message, wa.context)
        })

        this.start()
    }

    start(){

        this.socket = new net.Socket()
        this.socket.connect({
            port: 1337,
            host: 'out.adsb.lol',
            family: 4 // force ipv4
        })

        this.socket.on('error', err=>{
            console.error('adsb.lol socket error', err)
        })

        this.socket.on('connect', ()=>{
            console.info('adsb.lol socket connect')

            this.socket.write('hello', 'utf-8', err => console.error)
        })

        this.socket.on('data', (d)=>{
            this.beastHandler.handleBeastData(d)
        })

        this.socket.on('close', ()=>{
            console.info('adsb.lol socket closed')
            if(!this.socketShouldClose){
                setTimeout(()=>{
                    this.start()
                }, ADSB_LOL_RECONNECT_TIMEOUT)
            }
        })
    }

    stop(){
        this.socketShouldClose = true

        if(this.socket){
            this.socket.destroySoon()
        }
    }
}

const adsbLolReceiver = new AdsbLolReceiver()
