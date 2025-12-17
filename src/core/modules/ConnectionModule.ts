
import { DBInsert_Connection, DBUpdate_Connection, delete_Connection, insert_Connection, select_Connection, update_Connection } from '../../generated-definitions/db/DBHelpers'
import {DBType_Connection} from '../../generated-definitions/db/DBTypes'
import Module_Base from './Module_Base'
import { isConnectionOnline } from '../../connector/dji-pilot-2'
import dayjs from 'dayjs'
import { getCore } from '../index'
import { generateUniqueTokenUrlSafe } from '../../util/crypto'
import { createBucketForConnection } from '../../s3-store'
import { getRandomUUIDFromId } from '../../util/uuid'
import * as express from 'express'

import pgp from 'pg-promise'
import { setSessionCookie } from '../../util/cookie'
import type DroneModule from './DroneModule'
const db: pgp.IDatabase<any> = global.db

const TOKEN_BYTE_LENGTH = 42

export default class ConnectionModule extends Module_Base<
    {
        workspaceId: number,
        id: number
    },

    {
        create: {
            eventDataType: DBType_Connection,
            availableContexts: 'workspaceId' | 'id'
        },
        update: {
            eventDataType: DBType_Connection,
            availableContexts: 'workspaceId' | 'id'
        },
        delete: {
            eventDataType: DBType_Connection,
            availableContexts: 'workspaceId' | 'id'
        }
    }
> {

    constructor(){
        super()
    }

    async create(data: DBInsert_Connection){
        const connection = await insert_Connection(data)

        this.dispatch('create', {
            id: connection.id,
            workspaceId: connection.workspace_id
        }, connection)

        return connection
    }

    async update(id: number, data: DBUpdate_Connection){
        const connection = await update_Connection(data, id)

        this.dispatch('update', {
            id: connection.id,
            workspaceId: connection.workspace_id
        }, connection)

        return connection
    }

    async delete(id: number){
        const connection = await delete_Connection(id)

        this.dispatch('delete', {
            id: connection.id,
            workspaceId: connection.workspace_id
        }, connection)
    }

    async get(id: number){
        return await select_Connection(id)
    }




    async createConnection(workspaceId: number, name: string){

        const connection = await getCore().modules.connection.create({
            secret: generateUniqueTokenUrlSafe(25),
            workspace_id: workspaceId,
            name,
            workspace_uuid: getRandomUUIDFromId(workspaceId)
        })
        //TODO: delete connection if create bucket was unsuccessfull
        await createBucketForConnection(connection.id)

        return connection
    }


    async getDroneConnectionOnlineStatus(connectionId: number): Promise<{
        remoteController: boolean
        drone: boolean
    }> {

        const connection = await select_Connection(connectionId)

        const mqttIsConnected = isConnectionOnline(connectionId)

        if(typeof connection.last_drone_id !== 'number'){
            return {
                remoteController: mqttIsConnected,
                drone: false
            }
        }

        let lastPos: Awaited<ReturnType<DroneModule['getLastTelemetryOfDrone']>> | false

        try {
            lastPos = await getCore().modules.drone.getLastTelemetryOfDrone(connection.last_drone_id)
        } catch (err){
            lastPos = false
        }

        return {
            remoteController: mqttIsConnected,
            drone: lastPos && dayjs(lastPos.reported_at).isAfter( dayjs().subtract(120, 'second') )// last telemetry is not older then 120 seconds
        }
    }

    async generateConnectionSessionCookieAndSet(connectionId: number, res: express.Response){

        const sessionToken = generateUniqueTokenUrlSafe(TOKEN_BYTE_LENGTH)

        await db.none('UPDATE connections SET session_token = ${sessionToken} WHERE id = ${id};', {
            id: connectionId,
            sessionToken
        })

        const longTime = 1000 * 60 * 60 * 24 * 365 * 10 // 10 years

        setSessionCookie('connection-link-auth', sessionToken, res, longTime)
    }
}
