import * as pgp from 'pg-promise'
    const db : pgp.IDatabase<any> = global.db




//users

import {DBType_User_StateType} from "./DBTypes";

export type DBInsert_User = {
    name: string
    email: string
    email_hash: string
    password?: string
    login_token?: string
    session_token?: string
    stream_token?: string
    reset_code?: string
    created_at?: string
    state?: DBType_User_StateType
    locale?: string
}

export type DBUpdate_User = {
    name?: string
    email?: string
    email_hash?: string
    password?: string
    login_token?: string
    session_token?: string
    stream_token?: string
    reset_code?: string
    created_at?: string
    state?: DBType_User_StateType
    locale?: string
}
const COLUMN_SET_USERS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
    },
    {
        "name": "email"
    },
    {
        "name": "email_hash"
    },
    {
        "name": "password",
        "skip": col => !col.exists
    },
    {
        "name": "login_token",
        "skip": col => !col.exists
    },
    {
        "name": "session_token",
        "skip": col => !col.exists
    },
    {
        "name": "stream_token",
        "skip": col => !col.exists
    },
    {
        "name": "reset_code",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "state",
        "skip": col => !col.exists
    },
    {
        "name": "locale",
        "skip": col => !col.exists
    }
], {table: "users"})

const COLUMN_SET_USERS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "email",
        "skip": col => !col.exists
    },
    {
        "name": "email_hash",
        "skip": col => !col.exists
    },
    {
        "name": "password",
        "skip": col => !col.exists
    },
    {
        "name": "login_token",
        "skip": col => !col.exists
    },
    {
        "name": "session_token",
        "skip": col => !col.exists
    },
    {
        "name": "stream_token",
        "skip": col => !col.exists
    },
    {
        "name": "reset_code",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "state",
        "skip": col => !col.exists
    },
    {
        "name": "locale",
        "skip": col => !col.exists
    }
], {table: "users"})
import {DBType_User} from './DBTypes'


    export function insertUser(values: DBInsert_User){
        return db.one<DBType_User>(db.$config.pgp.helpers.insert(values, undefined, 'users') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateUser<T extends number | string>(values: DBUpdate_User, idOrWhereCondition: T): T extends number ? Promise<DBType_User> : Promise<DBType_User[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_User>(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteUser(id: number){
        return db.one<DBType_User>('DELETE FROM users WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectUser(id: number){
        return db.one<DBType_User>('SELECT * FROM users ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//files

import {} from "./DBTypes";

export type DBInsert_File = {
    workspace_id: number
    ext: string
    name: string
    created_at?: string
    created_by: number
    has_thumbnail?: boolean
    thumbnail_generation_has_failed?: boolean
    exif_data?: string
    exif_data_generation_has_failed?: boolean
}

export type DBUpdate_File = {
    workspace_id?: number
    ext?: string
    name?: string
    created_at?: string
    created_by?: number
    has_thumbnail?: boolean
    thumbnail_generation_has_failed?: boolean
    exif_data?: string
    exif_data_generation_has_failed?: boolean
}
const COLUMN_SET_FILES = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "workspace_id"
    },
    {
        "name": "ext"
    },
    {
        "name": "name"
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "created_by"
    },
    {
        "name": "has_thumbnail",
        "skip": col => !col.exists
    },
    {
        "name": "thumbnail_generation_has_failed",
        "skip": col => !col.exists
    },
    {
        "name": "exif_data",
        "skip": col => !col.exists
    },
    {
        "name": "exif_data_generation_has_failed",
        "skip": col => !col.exists
    }
], {table: "files"})

const COLUMN_SET_FILES_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id",
        "skip": col => !col.exists
    },
    {
        "name": "ext",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "created_by",
        "skip": col => !col.exists
    },
    {
        "name": "has_thumbnail",
        "skip": col => !col.exists
    },
    {
        "name": "thumbnail_generation_has_failed",
        "skip": col => !col.exists
    },
    {
        "name": "exif_data",
        "skip": col => !col.exists
    },
    {
        "name": "exif_data_generation_has_failed",
        "skip": col => !col.exists
    }
], {table: "files"})
import {DBType_File} from './DBTypes'


    export function insertFile(values: DBInsert_File){
        return db.one<DBType_File>(db.$config.pgp.helpers.insert(values, undefined, 'files') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateFile<T extends number | string>(values: DBUpdate_File, idOrWhereCondition: T): T extends number ? Promise<DBType_File> : Promise<DBType_File[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_File>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FILES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_FILES_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteFile(id: number){
        return db.one<DBType_File>('DELETE FROM files WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectFile(id: number){
        return db.one<DBType_File>('SELECT * FROM files ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//workspaces

import {} from "./DBTypes";

export type DBInsert_Workspace = {
    name: string
    longitude: number
    latitude: number
}

export type DBUpdate_Workspace = {
    name?: string
    longitude?: number
    latitude?: number
}
const COLUMN_SET_WORKSPACES = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
    },
    {
        "name": "longitude"
    },
    {
        "name": "latitude"
    }
], {table: "workspaces"})

const COLUMN_SET_WORKSPACES_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "longitude",
        "skip": col => !col.exists
    },
    {
        "name": "latitude",
        "skip": col => !col.exists
    }
], {table: "workspaces"})
import {DBType_Workspace} from './DBTypes'


    export function insertWorkspace(values: DBInsert_Workspace){
        return db.one<DBType_Workspace>(db.$config.pgp.helpers.insert(values, undefined, 'workspaces') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateWorkspace<T extends number | string>(values: DBUpdate_Workspace, idOrWhereCondition: T): T extends number ? Promise<DBType_Workspace> : Promise<DBType_Workspace[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Workspace>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteWorkspace(id: number){
        return db.one<DBType_Workspace>('DELETE FROM workspaces WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectWorkspace(id: number){
        return db.one<DBType_Workspace>('SELECT * FROM workspaces ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//workspace_permissions

import {} from "./DBTypes";

export type DBInsert_WorkspacePermission = {
    user_id: number
    workspace_id: number
}

export type DBUpdate_WorkspacePermission = {
    user_id?: number
    workspace_id?: number
}
const COLUMN_SET_WORKSPACE_PERMISSIONS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "user_id"
    },
    {
        "name": "workspace_id"
    }
], {table: "workspace_permissions"})

const COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "user_id",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id",
        "skip": col => !col.exists
    }
], {table: "workspace_permissions"})
import {DBType_WorkspacePermission} from './DBTypes'


    export function insertWorkspacePermission(values: DBInsert_WorkspacePermission){
        return db.one<DBType_WorkspacePermission>(db.$config.pgp.helpers.insert(values, undefined, 'workspace_permissions') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateWorkspacePermission<T extends number | string>(values: DBUpdate_WorkspacePermission, idOrWhereCondition: T): T extends number ? Promise<DBType_WorkspacePermission> : Promise<DBType_WorkspacePermission[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_WorkspacePermission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteWorkspacePermission(id: number){
        return db.one<DBType_WorkspacePermission>('DELETE FROM workspace_permissions WHERE id = ${id} RETURNING *', {id})
    }

    


//connections

import {} from "./DBTypes";

export type DBInsert_Connection = {
    name: string
    secret: string
    session_token?: string
    workspace_id: number
    workspace_uuid: string
    remote_controller_id?: number
    last_drone_id?: number
}

export type DBUpdate_Connection = {
    name?: string
    secret?: string
    session_token?: string
    workspace_id?: number
    workspace_uuid?: string
    remote_controller_id?: number
    last_drone_id?: number
}
const COLUMN_SET_CONNECTIONS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
    },
    {
        "name": "secret"
    },
    {
        "name": "session_token",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id"
    },
    {
        "name": "workspace_uuid"
    },
    {
        "name": "remote_controller_id",
        "skip": col => !col.exists
    },
    {
        "name": "last_drone_id",
        "skip": col => !col.exists
    }
], {table: "connections"})

const COLUMN_SET_CONNECTIONS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "secret",
        "skip": col => !col.exists
    },
    {
        "name": "session_token",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_uuid",
        "skip": col => !col.exists
    },
    {
        "name": "remote_controller_id",
        "skip": col => !col.exists
    },
    {
        "name": "last_drone_id",
        "skip": col => !col.exists
    }
], {table: "connections"})
import {DBType_Connection} from './DBTypes'


    export function insertConnection(values: DBInsert_Connection){
        return db.one<DBType_Connection>(db.$config.pgp.helpers.insert(values, undefined, 'connections') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateConnection<T extends number | string>(values: DBUpdate_Connection, idOrWhereCondition: T): T extends number ? Promise<DBType_Connection> : Promise<DBType_Connection[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Connection>(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteConnection(id: number){
        return db.one<DBType_Connection>('DELETE FROM connections WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectConnection(id: number){
        return db.one<DBType_Connection>('SELECT * FROM connections ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//remote_controllers

import {DBType_RemoteController_TypeType} from "./DBTypes";

export type DBInsert_RemoteController = {
    serial_number: string
    type?: DBType_RemoteController_TypeType
}

export type DBUpdate_RemoteController = {
    serial_number?: string
    type?: DBType_RemoteController_TypeType
}
const COLUMN_SET_REMOTE_CONTROLLERS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "serial_number"
    },
    {
        "name": "type",
        "skip": col => !col.exists
    }
], {table: "remote_controllers"})

const COLUMN_SET_REMOTE_CONTROLLERS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "serial_number",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    }
], {table: "remote_controllers"})
import {DBType_RemoteController} from './DBTypes'


    export function insertRemoteController(values: DBInsert_RemoteController){
        return db.one<DBType_RemoteController>(db.$config.pgp.helpers.insert(values, undefined, 'remote_controllers') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateRemoteController<T extends number | string>(values: DBUpdate_RemoteController, idOrWhereCondition: T): T extends number ? Promise<DBType_RemoteController> : Promise<DBType_RemoteController[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_RemoteController>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteRemoteController(id: number){
        return db.one<DBType_RemoteController>('DELETE FROM remote_controllers WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectRemoteController(id: number){
        return db.one<DBType_RemoteController>('SELECT * FROM remote_controllers ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//drones

import {DBType_Drone_TypeType} from "./DBTypes";

export type DBInsert_Drone = {
    serial_number: string
    name: string
    type?: DBType_Drone_TypeType
    last_connection_id?: number
    current_flight_id?: number
    in_flight?: boolean
}

export type DBUpdate_Drone = {
    serial_number?: string
    name?: string
    type?: DBType_Drone_TypeType
    last_connection_id?: number
    current_flight_id?: number
    in_flight?: boolean
}
const COLUMN_SET_DRONES = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "serial_number"
    },
    {
        "name": "name"
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "last_connection_id",
        "skip": col => !col.exists
    },
    {
        "name": "current_flight_id",
        "skip": col => !col.exists
    },
    {
        "name": "in_flight",
        "skip": col => !col.exists
    }
], {table: "drones"})

const COLUMN_SET_DRONES_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "serial_number",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "last_connection_id",
        "skip": col => !col.exists
    },
    {
        "name": "current_flight_id",
        "skip": col => !col.exists
    },
    {
        "name": "in_flight",
        "skip": col => !col.exists
    }
], {table: "drones"})
import {DBType_Drone} from './DBTypes'


    export function insertDrone(values: DBInsert_Drone){
        return db.one<DBType_Drone>(db.$config.pgp.helpers.insert(values, undefined, 'drones') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateDrone<T extends number | string>(values: DBUpdate_Drone, idOrWhereCondition: T): T extends number ? Promise<DBType_Drone> : Promise<DBType_Drone[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Drone>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteDrone(id: number){
        return db.one<DBType_Drone>('DELETE FROM drones WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectDrone(id: number){
        return db.one<DBType_Drone>('SELECT * FROM drones ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//flights

import {} from "./DBTypes";

export type DBInsert_Flight = {
    drone_id: number
    started_at?: string
    landed_at?: string
    ended_at?: string
}

export type DBUpdate_Flight = {
    drone_id?: number
    started_at?: string
    landed_at?: string
    ended_at?: string
}
const COLUMN_SET_FLIGHTS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "drone_id"
    },
    {
        "name": "started_at",
        "skip": col => !col.exists
    },
    {
        "name": "landed_at",
        "skip": col => !col.exists
    },
    {
        "name": "ended_at",
        "skip": col => !col.exists
    }
], {table: "flights"})

const COLUMN_SET_FLIGHTS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "drone_id",
        "skip": col => !col.exists
    },
    {
        "name": "started_at",
        "skip": col => !col.exists
    },
    {
        "name": "landed_at",
        "skip": col => !col.exists
    },
    {
        "name": "ended_at",
        "skip": col => !col.exists
    }
], {table: "flights"})
import {DBType_Flight} from './DBTypes'


    export function insertFlight(values: DBInsert_Flight){
        return db.one<DBType_Flight>(db.$config.pgp.helpers.insert(values, undefined, 'flights') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateFlight<T extends number | string>(values: DBUpdate_Flight, idOrWhereCondition: T): T extends number ? Promise<DBType_Flight> : Promise<DBType_Flight[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Flight>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHTS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHTS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteFlight(id: number){
        return db.one<DBType_Flight>('DELETE FROM flights WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectFlight(id: number){
        return db.one<DBType_Flight>('SELECT * FROM flights ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//flight_data

import {DBType_FlightData_TypeType} from "./DBTypes";

export type DBInsert_FlightData = {
    flight_id: number
    received_at?: string
    created_at: string
    type: DBType_FlightData_TypeType
    data: string
}

export type DBUpdate_FlightData = {
    flight_id?: number
    received_at?: string
    created_at?: string
    type?: DBType_FlightData_TypeType
    data?: string
}
const COLUMN_SET_FLIGHT_DATA = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "flight_id"
    },
    {
        "name": "received_at",
        "skip": col => !col.exists
    },
    {
        "name": "created_at"
    },
    {
        "name": "type"
    },
    {
        "name": "data"
    }
], {table: "flight_data"})

const COLUMN_SET_FLIGHT_DATA_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "flight_id",
        "skip": col => !col.exists
    },
    {
        "name": "received_at",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "data",
        "skip": col => !col.exists
    }
], {table: "flight_data"})
import {DBType_FlightData} from './DBTypes'


    export function insertFlightData(values: DBInsert_FlightData){
        return db.one<DBType_FlightData>(db.$config.pgp.helpers.insert(values, undefined, 'flight_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateFlightData<T extends number | string>(values: DBUpdate_FlightData, idOrWhereCondition: T): T extends number ? Promise<DBType_FlightData> : Promise<DBType_FlightData[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_FlightData>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteFlightData(id: number){
        return db.one<DBType_FlightData>('DELETE FROM flight_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectFlightData(id: number){
        return db.one<DBType_FlightData>('SELECT * FROM flight_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//remote_controller_data

import {DBType_RemoteControllerData_TypeType} from "./DBTypes";

export type DBInsert_RemoteControllerData = {
    remote_controller_id: number
    type?: DBType_RemoteControllerData_TypeType
    data: string
    created_at?: string
}

export type DBUpdate_RemoteControllerData = {
    remote_controller_id?: number
    type?: DBType_RemoteControllerData_TypeType
    data?: string
    created_at?: string
}
const COLUMN_SET_REMOTE_CONTROLLER_DATA = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "remote_controller_id"
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "data"
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    }
], {table: "remote_controller_data"})

const COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "remote_controller_id",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "data",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    }
], {table: "remote_controller_data"})
import {DBType_RemoteControllerData} from './DBTypes'


    export function insertRemoteControllerData(values: DBInsert_RemoteControllerData){
        return db.one<DBType_RemoteControllerData>(db.$config.pgp.helpers.insert(values, undefined, 'remote_controller_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateRemoteControllerData<T extends number | string>(values: DBUpdate_RemoteControllerData, idOrWhereCondition: T): T extends number ? Promise<DBType_RemoteControllerData> : Promise<DBType_RemoteControllerData[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_RemoteControllerData>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteRemoteControllerData(id: number){
        return db.one<DBType_RemoteControllerData>('DELETE FROM remote_controller_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectRemoteControllerData(id: number){
        return db.one<DBType_RemoteControllerData>('SELECT * FROM remote_controller_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//drone_data

import {DBType_DroneData_TypeType} from "./DBTypes";

export type DBInsert_DroneData = {
    drone_id: number
    flight_id: number
    type?: DBType_DroneData_TypeType
    data: string
    created_at?: string
}

export type DBUpdate_DroneData = {
    drone_id?: number
    flight_id?: number
    type?: DBType_DroneData_TypeType
    data?: string
    created_at?: string
}
const COLUMN_SET_DRONE_DATA = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "drone_id"
    },
    {
        "name": "flight_id"
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "data"
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    }
], {table: "drone_data"})

const COLUMN_SET_DRONE_DATA_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "drone_id",
        "skip": col => !col.exists
    },
    {
        "name": "flight_id",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "data",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    }
], {table: "drone_data"})
import {DBType_DroneData} from './DBTypes'


    export function insertDroneData(values: DBInsert_DroneData){
        return db.one<DBType_DroneData>(db.$config.pgp.helpers.insert(values, undefined, 'drone_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateDroneData<T extends number | string>(values: DBUpdate_DroneData, idOrWhereCondition: T): T extends number ? Promise<DBType_DroneData> : Promise<DBType_DroneData[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_DroneData>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteDroneData(id: number){
        return db.one<DBType_DroneData>('DELETE FROM drone_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectDroneData(id: number){
        return db.one<DBType_DroneData>('SELECT * FROM drone_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//drone_media

import {DBType_DroneMedia_TypeType} from "./DBTypes";

export type DBInsert_DroneMedia = {
    drone_id: number
    flight_id: number
    type: DBType_DroneMedia_TypeType
    file_id: number
    fingerprint: string
    tiny_fingerprint: string
    meta?: string
    captured_at?: string
    received_at?: string
    coverage?: string
    coverage_generated_at?: string
    camera_location?: string
    camera_angles?: string
}

export type DBUpdate_DroneMedia = {
    drone_id?: number
    flight_id?: number
    type?: DBType_DroneMedia_TypeType
    file_id?: number
    fingerprint?: string
    tiny_fingerprint?: string
    meta?: string
    captured_at?: string
    received_at?: string
    coverage?: string
    coverage_generated_at?: string
    camera_location?: string
    camera_angles?: string
}
const COLUMN_SET_DRONE_MEDIA = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "drone_id"
    },
    {
        "name": "flight_id"
    },
    {
        "name": "type"
    },
    {
        "name": "file_id"
    },
    {
        "name": "fingerprint"
    },
    {
        "name": "tiny_fingerprint"
    },
    {
        "name": "meta",
        "skip": col => !col.exists
    },
    {
        "name": "captured_at",
        "skip": col => !col.exists
    },
    {
        "name": "received_at",
        "skip": col => !col.exists
    },
    {
        "name": "coverage",
        "skip": col => !col.exists
    },
    {
        "name": "coverage_generated_at",
        "skip": col => !col.exists
    },
    {
        "name": "camera_location",
        "skip": col => !col.exists
    },
    {
        "name": "camera_angles",
        "skip": col => !col.exists
    }
], {table: "drone_media"})

const COLUMN_SET_DRONE_MEDIA_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "drone_id",
        "skip": col => !col.exists
    },
    {
        "name": "flight_id",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "file_id",
        "skip": col => !col.exists
    },
    {
        "name": "fingerprint",
        "skip": col => !col.exists
    },
    {
        "name": "tiny_fingerprint",
        "skip": col => !col.exists
    },
    {
        "name": "meta",
        "skip": col => !col.exists
    },
    {
        "name": "captured_at",
        "skip": col => !col.exists
    },
    {
        "name": "received_at",
        "skip": col => !col.exists
    },
    {
        "name": "coverage",
        "skip": col => !col.exists
    },
    {
        "name": "coverage_generated_at",
        "skip": col => !col.exists
    },
    {
        "name": "camera_location",
        "skip": col => !col.exists
    },
    {
        "name": "camera_angles",
        "skip": col => !col.exists
    }
], {table: "drone_media"})
import {DBType_DroneMedia} from './DBTypes'


    export function insertDroneMedia(values: DBInsert_DroneMedia){
        return db.one<DBType_DroneMedia>(db.$config.pgp.helpers.insert(values, undefined, 'drone_media') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateDroneMedia<T extends number | string>(values: DBUpdate_DroneMedia, idOrWhereCondition: T): T extends number ? Promise<DBType_DroneMedia> : Promise<DBType_DroneMedia[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_DroneMedia>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteDroneMedia(id: number){
        return db.one<DBType_DroneMedia>('DELETE FROM drone_media WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectDroneMedia(id: number){
        return db.one<DBType_DroneMedia>('SELECT * FROM drone_media ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//geo_objects

import {DBType_GeoObject_TypeType, DBType_GeoObject_SubTypeType} from "./DBTypes";

export type DBInsert_GeoObject = {
    uuid?: string
    workspace_id: number
    name: string
    type: DBType_GeoObject_TypeType
    sub_type: DBType_GeoObject_SubTypeType
    config: string
    created_at?: string
    updated_at?: string
}

export type DBUpdate_GeoObject = {
    uuid?: string
    workspace_id?: number
    name?: string
    type?: DBType_GeoObject_TypeType
    sub_type?: DBType_GeoObject_SubTypeType
    config?: string
    created_at?: string
    updated_at?: string
}
const COLUMN_SET_GEO_OBJECTS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "uuid",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id"
    },
    {
        "name": "name"
    },
    {
        "name": "type"
    },
    {
        "name": "sub_type"
    },
    {
        "name": "config"
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "updated_at",
        "skip": col => !col.exists
    }
], {table: "geo_objects"})

const COLUMN_SET_GEO_OBJECTS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "uuid",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "type",
        "skip": col => !col.exists
    },
    {
        "name": "sub_type",
        "skip": col => !col.exists
    },
    {
        "name": "config",
        "skip": col => !col.exists
    },
    {
        "name": "created_at",
        "skip": col => !col.exists
    },
    {
        "name": "updated_at",
        "skip": col => !col.exists
    }
], {table: "geo_objects"})
import {DBType_GeoObject} from './DBTypes'


    export function insertGeoObject(values: DBInsert_GeoObject){
        return db.one<DBType_GeoObject>(db.$config.pgp.helpers.insert(values, undefined, 'geo_objects') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function updateGeoObject<T extends number | string>(values: DBUpdate_GeoObject, idOrWhereCondition: T): T extends number ? Promise<DBType_GeoObject> : Promise<DBType_GeoObject[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_GeoObject>(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function deleteGeoObject(id: number){
        return db.one<DBType_GeoObject>('DELETE FROM geo_objects WHERE id = ${id} RETURNING *', {id})
    }

    


    export function selectGeoObject(id: number){
        return db.one<DBType_GeoObject>('SELECT * FROM geo_objects ' + pgp.as.format('WHERE id = ${id}', {id}))
    }