import {DBInsert_Flight, DBInsert_Flight_Data, DBUpdate_Flight, delete_Flight, insert_Flight, insert_Flight_Data, select_Flight, update_Flight} from '../../generated-definitions/db/DBHelpers'
import Module_Base from './Module_Base'
import * as pgp from 'pg-promise'
import { DBType_Flight, DBType_Flight_Data } from '../../generated-definitions/db/DBTypes'
const db : pgp.IDatabase<any> = global.db

export default class FlightModule extends Module_Base<
    {
        id: number
        workspaceId: number
    },

    {
        create: {
            eventDataType: DBType_Flight,
            availableContexts: 'id' | 'workspaceId'
        },
        update: {
            eventDataType: DBType_Flight,
            availableContexts: 'id' | 'workspaceId'
        },
        delete: {
            eventDataType: DBType_Flight,
            availableContexts: 'id' | 'workspaceId'
        },
        create_flight_data: {
            eventDataType: DBType_Flight_Data,
            availableContexts: 'workspaceId'
        }
    }
> {

    constructor(){
        super()
    }

    async create(data: DBInsert_Flight){
        const flight = await insert_Flight(data)

        this.dispatch('create', {
            id: flight.id,
            workspaceId: flight.workspace_id
        }, flight)

        return flight
    }

    async update(id: number, data: DBUpdate_Flight){
        const flight = await update_Flight(data, id)

        this.dispatch('update', {
            id: flight.id,
            workspaceId: flight.workspace_id
        }, flight)

        return flight
    }

    async delete(id: number){
        const flight = await delete_Flight(id)

        this.dispatch('delete', {
            id: flight.id,
            workspaceId: flight.workspace_id
        }, flight)
    }

    async get(id: number){
        return await select_Flight(id)
    }


    async insertFlightData(data: DBInsert_Flight_Data){
        const flightData = await insert_Flight_Data(data)

        const workspaceId = await this.getWorkspaceIdForFlight(flightData.flight_id)

        this.dispatch('create_flight_data', {
            workspaceId
        }, flightData)

        return flightData
    }


    async getTrackForFlight(flightId: number){

        return await db.manyOrNone<{created_at: string, height: number, longitude: number, latitude: number}>("SELECT created_at, data->'height' as height, data->'longitude' as longitude,  data->'latitude' as latitude FROM flight_data WHERE flight_id = ${flightId} ORDER BY created_at ASC", {
            flightId
        })
    }

    async getWorkspaceIdForFlight(flightId: number){
        const flight = await this.get(flightId)

        return flight.workspace_id
    }

}
