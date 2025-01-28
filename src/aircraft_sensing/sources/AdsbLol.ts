// data provided as ObenDB license, we need to follow some rules when publishing this service: https://opendatacommons.org/licenses/odbl/summary/

import { EventManager } from "../../util/event_manager";
import { SensingSourceArea } from "../Source";

import * as net from 'net'

const ADSB_LOL_RECONNECT_TIMEOUT = 1000 * 5

export default class AdsbLolSensingArea extends SensingSourceArea {

    private listenerFunction = this.handleAircraft.bind(this)

    protected onSetup(): void {
        adsbLolReceiver.addListener('todo', this.listenerFunction)
    }

    protected onShutdown(): void {
        adsbLolReceiver.removeListener('todo', this.listenerFunction)
    }

    private handleAircraft(todo){

    }
}

type AdsbLolReceiverEvents = {
    'todo'
}

class AdsbLolReceiver extends EventManager<AdsbLolReceiverEvents> {

    private socket: net.Socket

    private socketShouldClose = false

    constructor(){
        super()

        this.start()
    }

    start(){

        this.socket = new net.Socket()
        this.socket.connect(1337, 'out.adsb.lol')

        this.socket.addListener('error', err=>{
            console.error('adsb beast socket error', err)
        })

        this.socket.addListener('connect', ()=>{
            console.info('adsb beast socket connected')
        })

        this.socket.addListener('message', msg=>{
            const messageString = msg.toString('utf-8')

            console.log(messageString)
        })

        this.socket.addListener('close', ()=>{
            console.info('adsb beast socket closed')
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
