import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db
import { insertConnection } from '../db/DBHelpers'
import { generateUniqueToken } from '../util/crypto'


export async function addDroneData(droneId: number, type: number, data: any){

//TODO
}
