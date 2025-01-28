// data provided as ObenDB license, we need to follow some rules when publishing this service: https://opendatacommons.org/licenses/odbl/summary/

import { EventManager } from "../../util/event_manager";
import { SensingSourceArea } from "../Source";

import {ISSocket} from 'js-aprs-is'
import {aprsPacket, aprsParser} from 'js-aprs-fap'
import { TrafficData } from "../TrafficSensing";

const GLIDER_NET_RECONNECT_TIMEOUT = 1000 * 5

export default class GliderNetSensingArea extends SensingSourceArea {

    private receiver: GliderNetReceiver

    protected onSetup(): void {
        this.receiver = new GliderNetReceiver(this.latitude, this.longitude, this.radius)

        this.receiver.addListener('aircraft', data=>{
            this.dispatch('traffic', data)
        })

        this.receiver.start()
    }

    protected onShutdown(): void {
        this.receiver.stop()
    }

}

type GliderNetReceiverEvents = {
    'aircraft': TrafficData
}

const aprsMessageParser = new aprsParser()

class GliderNetReceiver extends EventManager<GliderNetReceiverEvents> {

    private readonly latitude: number
    private readonly longitude: number
    private readonly radius: number

    private isSocket: ISSocket

    /**
     * @param radius in meters
     */
    constructor(latitude: number, longitude: number, radius: number){
        super()

        this.latitude = latitude
        this.longitude = longitude
        this.radius = radius
    }

    start(){
        console.log('strating glidernet receiver ...')

        const radiusInKilometers = this.radius / 1000

        this.isSocket = new ISSocket('ofh', 'aprs.glidernet.org', 14580, 'OFH')//, -1, true, 'ARG', `r/${this.latitude}/${this.longitude}/${radiusInKilometers}\r\n`)

        this.isSocket.addListener('error', err=>{
            console.error('glidernet ISSocket error', err)
        })

        this.isSocket.addListener('close', ()=>{
            console.info('glidernet ISSocket closed')

            //TODO reconnect or does the lib do this for us?
        })

        this.isSocket.addListener('connect', ()=>{
            console.info('glidernet ISSocket connected')

            this.isSocket.sendLogin()

            this.isSocket.send(`#filter r/${this.latitude}/${this.longitude}/${radiusInKilometers}`)
        })

        this.isSocket.on('packet', p => {

            const message = p as string
            if(! message.startsWith('#') && ! message.startsWith('user')){
                const parsed: aprsPacket & {flarm?: FlarmData} = aprsMessageParser.parseaprs(message)

                if(parsed.destCallsign === 'OGFLR'){
                    parsed.flarm = parseOGNFlarmComment(parsed.comment)
                }


                // APRS symbols: http://www.aprs.net/vm/DOS/SYMBOLS.HTM

                // Receiver Stations seem to be pac.type = 'location' && pac.symbolcode === '&'
                // (while aircraft have pac.symbolcode === 'g'

                if(parsed.symbolcode !== 'g' && parsed.symbolcode !== '^'){// no aircraft
                    return
                }

                this.dispatch('aircraft', {
                    id: parsed.flarm?.id || parsed.sourceCallsign || ('' + parsed.id),//TODO sourceCallsign and parsed.id are not really helpfull...
                    position: {
                        latitude: parsed.latitude,
                        longitude: parsed.longitude,
                        height: parsed.altitude,
                        reported_at: new Date(parsed.receivedTime).toISOString()
                    }
                })
            }
        })


        this.isSocket.connect()

    }

    stop(){

        if(!this.isSocket){
            return
        }

        this.isSocket.destroySoon()
    }
}

type FlarmData = {
    id: string
    address: string
    stealth: boolean
    noTracking: boolean
    senderType: FlarmSenderType
    addressType: FlarmAddressType
    climbRate: number  // climb rate in feet per minute
    turnRate: number // turn rate in half turns per minute (lol)
    signalToNoiseRatio: number // in dB
    bitErrorsCorrected: number
    frequencyOffset: number // in kHz
}

type FlarmSenderType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 // 0 = unknown, 1 = gliders, 2 = planes, 3 = ultralights, 4 = helicopters, 5 = drones/uav, 6 = other, 7 = paragliders, 8 none

type FlarmAddressType = 0 | 1 | 2 | 3 // 0 = unknown, 1 = ICAO, 2 = flarm, 3 = ogn tracker


// Note: some fields my be undefined if comment does not include them
function parseOGNFlarmComment(comment: string){
    //parse ogn data, see section "OGN-specific beacons" http://wiki.glidernet.org/wiki:ogn-flavoured-aprs

    const ret: Partial<FlarmData> = {}

    if(typeof comment !== 'string'){
       throw new Error('arg must be a string')
    }

    let commentFields = comment.split(' ')

    if(commentFields.length < 1){
        throw new Error('not enough fields contained in ogn comment: "' + comment + '"')
    }

    for(const field of commentFields){

        if(field.startsWith('id')){
            ret.id = field

            ret.address = field.substring(4)

            let encoded = parseInt(field.substring(2, 4), 16)

            ret.stealth = (encoded & 128) == 128 //bool should never be true

            ret.noTracking = (encoded & 64) == 64 //bool

            ret.senderType = ((encoded & 60) >> 2) as FlarmSenderType // 0 = unknown, 1 = gliders, 2 = planes, 3 = ultralights, 4 = helicopters, 5 = drones/uav, 6 = other, 7 = paragliders, 8 = none

            ret.addressType = (encoded & 3) as FlarmAddressType// 0 = unknown, 1 = ICAO, 2 = flarm, 3 = ogn tracker

        } else if(field.endsWith('fpm')){
            ret.climbRate = parseInt(commentFields[1].replace('fpm', ''))

        } else if(field.endsWith('rot')){
            ret.turnRate = parseFloat(field.replace('rot', ''))

        } else if(field.endsWith('dB')){
            ret.signalToNoiseRatio = parseFloat(field.replace('dB', ''))

        } else if(field.endsWith('e')){
            ret.bitErrorsCorrected = parseInt(field.replace('e', ''))

        } else if(field.endsWith('id')){
            ret.frequencyOffset = parseFloat(field.replace('kHz', ''))
        } else {
            // ignore field
        }
    }

    return ret as FlarmData
}



//TODO remove code
// const gliderNetReceiver = new GliderNetReceiver(47, 10, 500000)
// gliderNetReceiver.start()


// // documentation see http://www.aprs-is.net/Connecting.aspx

// class GliderNetReceiver extends EventManager<GliderNetReceiverEvents> {

//     private readonly latitude: number
//     private readonly longitude: number
//     private readonly radius: number

//     private commandSocket: net.Socket
//     private commandSocketShouldClose = false

//     private listenSocket: dgram.Socket
//     private listenSocketShouldClose = false

//     private isRunning = false

//     /**
//      * @param radius in meters
//      */
//     constructor(latitude: number, longitude: number, radius: number){
//         super()

//         this.latitude = latitude
//         this.longitude = longitude
//         this.radius = radius
//     }

//     start(){

//         if(this.isRunning){
//             return
//         }

//         this.isRunning = true

//         this.commandSocket = new net.Socket()

//         this.commandSocket.addListener('error', err=>{
//             console.error('glidernet commandSocket error', err)
//         })

//         this.commandSocket.addListener('connect', ()=>{
//             console.info('glidernet commandSocket connected')

//             const radiusInKilometers = this.radius / 1000

//             setTimeout(()=>{
//                 console.log('glidernet commandSocket is logging in ...')
//                 this.commandSocket.write(`user OFH-OF pass -1 vers ofh 1.0 UDP 6003\r\n`)

//                 setTimeout(()=>{
//                     this.commandSocket.write(`#filter r/${this.latitude}/${this.longitude}/${radiusInKilometers}\r\n`)
//                 }, 1000 * 1)

//             }, 1000 * 1)

//         })

//         this.commandSocket.addListener('data', msg=>{
//             const messageString = msg.toString('utf-8')

//             console.log('glidernet commandSocket message', messageString)
//         })

//         this.commandSocket.addListener('close', ()=>{
//             console.info('glidernet commandSocket closed')
//             if(this.isRunning){
//                 setTimeout(()=>{
//                     this.start()
//                 }, GLIDER_NET_RECONNECT_TIMEOUT)
//             }
//         })

//         this.commandSocket.connect(14580, 'aprs.glidernet.org')


//         this.listenSocket = dgram.createSocket({
//             type: 'udp4',
//             reuseAddr: true
//         })

//         this.listenSocket.addListener('error', err=>{
//             console.error('glidernet listenSocket error', err)
//         })

//         this.listenSocket.addListener('listening', ()=>{
//             console.info('glidernet listenSocket listening', this.listenSocket.address())
//         })

//         this.listenSocket.addListener('connect', ()=>{
//             console.info('glidernet listenSocket connected')
//         })

//         this.listenSocket.addListener('message', (msg, rinfo)=>{
//             const messageString = msg.toString('utf-8')

//             console.log('glidernet listenSocket message', messageString)
//         })

//         this.listenSocket.addListener('close', ()=>{
//             console.info('glidernet listenSocket closed')

//             if(this.isRunning){
//                 setTimeout(()=>{
//                     this.start()
//                 }, GLIDER_NET_RECONNECT_TIMEOUT)
//             }
//         })

//         this.listenSocket.bind(6003)
//     }

//     stop(){

//         if(!this.isRunning){
//             return
//         }

//         this.isRunning = false

//         if(this.commandSocket){
//             this.commandSocket.destroySoon()
//         }

//         if(this.listenSocket){
//             this.listenSocket.close()
//         }
//     }
// }

// //TODO remove code
// const gliderNetReceiver = new GliderNetReceiver(47, 10, 10000)
// gliderNetReceiver.start()
