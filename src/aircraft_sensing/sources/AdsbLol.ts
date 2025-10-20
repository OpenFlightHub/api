// data provided as ObenDB license, we need to follow some rules when publishing this service: https://opendatacommons.org/licenses/odbl/summary/

import { SensingSourceArea } from "../Source";

import { validate } from "../../util/schema";
import dayjs from "dayjs";

const FETCH_INTERVAL = 1000 * 5

export default class AdsbLolSensingArea extends SensingSourceArea {


    private callApiInterval: ReturnType<typeof setInterval>

    protected onSetup(): void {

        this.callApiInterval = setInterval(async ()=>{

            try {
                const response = await fetch('https://api.adsb.lol/v2/point/' + this.latitude + '/' + this.longitude + '/' + this.radiusInNm())

                const json = await response.json()

                const valid = validate(json, {
                    type: 'object',
                    required: ['ac'],
                    properties: {
                        ac: {
                            type: "array",
                            items: {
                                type: 'object'
                            }
                        }
                    }
                })

                if(valid !== true){
                    throw new Error('invalid structure: ' + valid)
                }

                for(const aircraft of json.ac){
                    if(typeof aircraft.hex === 'string' && typeof aircraft.lon === 'number' && typeof aircraft.lat === 'number'){
                        this.dispatch('traffic', {
                            id: aircraft.hex,
                            name: '[adsb.lol] ' + aircraft.hex,
                            position: {
                                latitude: aircraft.lat,
                                longitude: aircraft.lon,
                                reported_at: dayjs().toISOString(),//TODO add timefrom packet
                                height: typeof aircraft.alt_baro === 'number' ? feetToMeter(aircraft.alt_baro) : typeof aircraft.alt_geom === 'number' ? feetToMeter(aircraft.alt_geom) : undefined
                            }
                        })
                    }
                }

            } catch (err){
                console.warn('error occured when calling adsb.lol api', err)
            }

        }, FETCH_INTERVAL)
    }

    protected onShutdown(): void {
        clearInterval(this.callApiInterval)
    }

    private radiusInNm(){
        return this.radius / 1852
    }

}

function feetToMeter(feet: number){
    return feet / 3.281
}
