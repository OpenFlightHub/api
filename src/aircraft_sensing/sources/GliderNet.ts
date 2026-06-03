// data provided as ObenDB license, we need to follow some rules when publishing this service: https://opendatacommons.org/licenses/odbl/summary/

import { EventManager } from "../../util/event_manager";
import { SensingSourceArea } from "../Source";

import {ISSocket} from 'js-aprs-is'
import {aprsPacket, aprsParser} from 'js-aprs-fap'
import { TrafficData, TrafficType } from "../TrafficSensing";



export default class GliderNetSensingArea extends SensingSourceArea {

    private receiver: GliderNetReceiver

    protected onSetup(): void {
        this.receiver = new GliderNetReceiver(this.latitude, this.longitude, this.radius)

        this.receiver.addListener('aircraft', data=>{

            this.dispatch('traffic', {
                id: data.id,
                name: '[Glidernet] ' + data.id,
                type: data.type,
                position: data.position
            })
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
        console.log('starting glidernet receiver ...')

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
            console.info('glidernet ISSocket connected: lat ', this.latitude, 'lon', this.longitude, 'radius in km', radiusInKilometers)

            this.isSocket.sendLogin()

            this.isSocket.send(`#filter r/${this.latitude}/${this.longitude}/${radiusInKilometers}`)
        })

        this.isSocket.on('packet', p => {

            const message = p as string
            if(! message.startsWith('#') && ! message.startsWith('user')){
                const parsed: aprsPacket & {flarm?: FlarmData} = aprsMessageParser.parseaprs(message)

                if(parsed.destCallsign === 'OGFLR'){
                    parsed.flarm = parseOGNFlarmComment(parsed.comment)
                    if(typeof parsed.flarm === 'undefined'){
                        console.warn('no comment provided for OGN Flarm data: ', parsed)
                    }
                }


                // APRS symbols: http://www.aprs.net/vm/DOS/SYMBOLS.HTM

                // Receiver Stations seem to be pac.type = 'location' && pac.symbolcode === '&'
                // (while aircraft have pac.symbolcode === 'g'

                if(parsed.symbolcode !== 'g' && parsed.symbolcode !== '\'' && parsed.symbolcode !== '^'){// no glider, small aircraft, large aicraft
                    return
                }

                const id = parsed.flarm?.id || parsed.sourceCallsign || ('' + parsed.id)//TODO sourceCallsign and parsed.id are not really helpfull...

                this.dispatch('aircraft', {
                    id,
                    name: id,
                    type: parsed.flarm ? mapFlarmTypeToTrafficType(parsed.flarm.senderType) : (parsed.symbolcode === 'g' ? 'glider' : 'aircraft'),
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
function parseOGNFlarmComment(comment?: string){
    //parse ogn data, see section "OGN-specific beacons" http://wiki.glidernet.org/wiki:ogn-flavoured-aprs

    const ret: Partial<FlarmData> = {}

    if(typeof comment !== 'string'){
       return undefined
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
            //TODO add source for definition!
            //TODO what are: 13 and 9?

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

function mapFlarmTypeToTrafficType(flarmType: FlarmSenderType): TrafficType {
    switch (flarmType) {
        case 1:
            return 'glider'
        case 2:
        case 3:
            return 'aircraft'
        case 4:
            return 'helicopter'
        case 5:
            return 'uav'

        case 7:
            return 'chute'

        case 0:
        case 6:
        case 8:
            return 'other'

        default:
            console.warn('unknown flarm sender type received from glidernet: ' + flarmType)
            return 'other'
    }
}
