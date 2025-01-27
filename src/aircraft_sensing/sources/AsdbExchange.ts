// see https://rapidapi.com/adsbx/api/adsbexchange-com1
// schemas of the rest result can be better found here: https://www.adsbexchange.com/api/aircraft/v2/docs and https://www.adsbexchange.com/version-2-api-wip/

import { fetchUrl } from "../../util/http";
import { SensingSourceArea } from "../Source";

import SecretsLoader from '../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets([
    'rapidapi_adsb_exchange_key'])

//TODO when publishing we must inform adsb exchange that we us the lite API and we must show a information note in the website somewhere

const TIMEOUT_BETWEEN_API_FETCH = 1000 * 30 // 30 secs


type ApiResult = {
    ac: Aircraft[]
    msg: string
    now: number // the time the file was generated (UTC timestamp)
    total: number // length of field "ac"
    ctime: number // the time the file was cached (UTC timestamp)
    ptime: number // the time the request took to process in milliseconds
}

type Aircraft = {
    hex: string // "407e53",
    type: string
    flight?: string // callsign (always 8 chars, might contain trailing whitespaces!)
    r?: string, // aircraft registration "G-SUNE"
    t?: string, // aircraft type
    alt_baro?: number,
    alt_geom?: number,
    gs?: number // ground speed in knots
    track?: number // track (heading) over ground in degrees 0-359
    track_rate?: number // track change in degrees per second
    baro_rate?: number // rate of change in barometric altitude in feet per minute
    geom_rate?: number // rate of change in gps altitude in feet per minute
    squawk?: string // as 4 octal digits (e.g. "5170")
    category?: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' // see https://www.adsbexchange.com/emitter-category-ads-b-do-260b-2-2-3-2-5-2/
    lat: number
    lon: number
    seen_pos: number // how long ago the position was last update (in seconds before now)
}


export default class AdsbExchangeSensinArea extends SensingSourceArea {

    private intervalHandle: any

    protected onSetup(): void {
        this.intervalHandle = setInterval(()=>{
            this.fetchAircrafts()
        }, TIMEOUT_BETWEEN_API_FETCH)
    }

    protected onShutdown(): void {
        clearInterval(this.intervalHandle)
    }

    /**
     *
     * @param radius in nautical miles
     */
    private async fetchAircrafts(){

        const result = await fetchUrl({
            url: `https://adsbexchange-com1.p.rapidapi.com/v2/lat/${this.latitude}/lon/${this.longitude}/dist/${this.radius}/`,
            method: 'get',
            headers: {
                'x-rapidapi-host': 'adsbexchange-com1.p.rapidapi.com',
	            'x-rapidapi-key': secrets.rapidapi_adsb_exchange_key
            }
        }) as ApiResult


        if(typeof result.now !== 'number'){
            console.warn('result missing "now"', result)
            return
        }

        for(const aircraft of result.ac){

            if(typeof aircraft.hex !== 'string'){
                console.warn('aircraft missing "hex"', aircraft)
                continue
            }

            if(typeof aircraft.lat !== 'number' || typeof aircraft.lon !== 'number'){
                console.warn('aircraft missing "lat" or "lon"', aircraft)
                continue
            }

            this.dispatch('traffic', {
                id: aircraft.hex,
                position: {
                    latitude: aircraft.lat,
                    longitude: aircraft.lon,
                    height: typeof aircraft.alt_baro === 'number' ? aircraft.alt_baro : (typeof aircraft.alt_geom === 'number' ? aircraft.alt_geom : undefined),
                    reported_at: new Date(result.now).toISOString()
                }
            })
        }
    }

}
