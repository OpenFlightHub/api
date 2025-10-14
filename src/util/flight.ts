import pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
export async function getTrackForFlight(flightId: number){

    return await db.manyOrNone<{created_at: string, height: number, longitude: number, latitude: number}>("SELECT created_at, data->'height' as height, data->'longitude' as longitude,  data->'latitude' as latitude FROM flight_data WHERE flight_id = ${flightId} ORDER BY created_at ASC", {
        flightId
    })
}