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


    export function insert_User(values: DBInsert_User){
        return db.one<DBType_User>(db.$config.pgp.helpers.insert(values, undefined, 'users') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_User<T extends number | string>(values: DBUpdate_User, idOrWhereCondition: T): T extends number ? Promise<DBType_User> : Promise<DBType_User[]>{
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

    export function delete_User(id: number){
        return db.one<DBType_User>('DELETE FROM users WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_User(id: number){
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


    export function insert_File(values: DBInsert_File){
        return db.one<DBType_File>(db.$config.pgp.helpers.insert(values, undefined, 'files') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_File<T extends number | string>(values: DBUpdate_File, idOrWhereCondition: T): T extends number ? Promise<DBType_File> : Promise<DBType_File[]>{
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

    export function delete_File(id: number){
        return db.one<DBType_File>('DELETE FROM files WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_File(id: number){
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


    export function insert_Workspace(values: DBInsert_Workspace){
        return db.one<DBType_Workspace>(db.$config.pgp.helpers.insert(values, undefined, 'workspaces') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Workspace<T extends number | string>(values: DBUpdate_Workspace, idOrWhereCondition: T): T extends number ? Promise<DBType_Workspace> : Promise<DBType_Workspace[]>{
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

    export function delete_Workspace(id: number){
        return db.one<DBType_Workspace>('DELETE FROM workspaces WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Workspace(id: number){
        return db.one<DBType_Workspace>('SELECT * FROM workspaces ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//workspace_permissions

import {} from "./DBTypes";

export type DBInsert_Workspace_Permission = {
    user_id: number
    workspace_id: number
}

export type DBUpdate_Workspace_Permission = {
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
import {DBType_Workspace_Permission} from './DBTypes'


    export function insert_Workspace_Permission(values: DBInsert_Workspace_Permission){
        return db.one<DBType_Workspace_Permission>(db.$config.pgp.helpers.insert(values, undefined, 'workspace_permissions') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Workspace_Permission<T extends number | string>(values: DBUpdate_Workspace_Permission, idOrWhereCondition: T): T extends number ? Promise<DBType_Workspace_Permission> : Promise<DBType_Workspace_Permission[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Workspace_Permission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Workspace_Permission(id: number){
        return db.one<DBType_Workspace_Permission>('DELETE FROM workspace_permissions WHERE id = ${id} RETURNING *', {id})
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


    export function insert_Connection(values: DBInsert_Connection){
        return db.one<DBType_Connection>(db.$config.pgp.helpers.insert(values, undefined, 'connections') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Connection<T extends number | string>(values: DBUpdate_Connection, idOrWhereCondition: T): T extends number ? Promise<DBType_Connection> : Promise<DBType_Connection[]>{
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

    export function delete_Connection(id: number){
        return db.one<DBType_Connection>('DELETE FROM connections WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Connection(id: number){
        return db.one<DBType_Connection>('SELECT * FROM connections ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//remote_controllers

import {DBType_Remote_Controller_TypeType} from "./DBTypes";

export type DBInsert_Remote_Controller = {
    serial_number: string
    type?: DBType_Remote_Controller_TypeType
}

export type DBUpdate_Remote_Controller = {
    serial_number?: string
    type?: DBType_Remote_Controller_TypeType
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
import {DBType_Remote_Controller} from './DBTypes'


    export function insert_Remote_Controller(values: DBInsert_Remote_Controller){
        return db.one<DBType_Remote_Controller>(db.$config.pgp.helpers.insert(values, undefined, 'remote_controllers') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Remote_Controller<T extends number | string>(values: DBUpdate_Remote_Controller, idOrWhereCondition: T): T extends number ? Promise<DBType_Remote_Controller> : Promise<DBType_Remote_Controller[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Remote_Controller>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Remote_Controller(id: number){
        return db.one<DBType_Remote_Controller>('DELETE FROM remote_controllers WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Remote_Controller(id: number){
        return db.one<DBType_Remote_Controller>('SELECT * FROM remote_controllers ' + pgp.as.format('WHERE id = ${id}', {id}))
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


    export function insert_Drone(values: DBInsert_Drone){
        return db.one<DBType_Drone>(db.$config.pgp.helpers.insert(values, undefined, 'drones') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Drone<T extends number | string>(values: DBUpdate_Drone, idOrWhereCondition: T): T extends number ? Promise<DBType_Drone> : Promise<DBType_Drone[]>{
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

    export function delete_Drone(id: number){
        return db.one<DBType_Drone>('DELETE FROM drones WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Drone(id: number){
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


    export function insert_Flight(values: DBInsert_Flight){
        return db.one<DBType_Flight>(db.$config.pgp.helpers.insert(values, undefined, 'flights') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Flight<T extends number | string>(values: DBUpdate_Flight, idOrWhereCondition: T): T extends number ? Promise<DBType_Flight> : Promise<DBType_Flight[]>{
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

    export function delete_Flight(id: number){
        return db.one<DBType_Flight>('DELETE FROM flights WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Flight(id: number){
        return db.one<DBType_Flight>('SELECT * FROM flights ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//flight_data

import {DBType_Flight_Data_TypeType} from "./DBTypes";

export type DBInsert_Flight_Data = {
    flight_id: number
    received_at?: string
    created_at: string
    type: DBType_Flight_Data_TypeType
    data: any
}

export type DBUpdate_Flight_Data = {
    flight_id?: number
    received_at?: string
    created_at?: string
    type?: DBType_Flight_Data_TypeType
    data?: any
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
import {DBType_Flight_Data} from './DBTypes'


    export function insert_Flight_Data(values: DBInsert_Flight_Data){
        return db.one<DBType_Flight_Data>(db.$config.pgp.helpers.insert(values, undefined, 'flight_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Flight_Data<T extends number | string>(values: DBUpdate_Flight_Data, idOrWhereCondition: T): T extends number ? Promise<DBType_Flight_Data> : Promise<DBType_Flight_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Flight_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Flight_Data(id: number){
        return db.one<DBType_Flight_Data>('DELETE FROM flight_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Flight_Data(id: number){
        return db.one<DBType_Flight_Data>('SELECT * FROM flight_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//remote_controller_data

import {DBType_Remote_Controller_Data_TypeType} from "./DBTypes";

export type DBInsert_Remote_Controller_Data = {
    remote_controller_id: number
    type?: DBType_Remote_Controller_Data_TypeType
    data: any
    created_at?: string
}

export type DBUpdate_Remote_Controller_Data = {
    remote_controller_id?: number
    type?: DBType_Remote_Controller_Data_TypeType
    data?: any
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
import {DBType_Remote_Controller_Data} from './DBTypes'


    export function insert_Remote_Controller_Data(values: DBInsert_Remote_Controller_Data){
        return db.one<DBType_Remote_Controller_Data>(db.$config.pgp.helpers.insert(values, undefined, 'remote_controller_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Remote_Controller_Data<T extends number | string>(values: DBUpdate_Remote_Controller_Data, idOrWhereCondition: T): T extends number ? Promise<DBType_Remote_Controller_Data> : Promise<DBType_Remote_Controller_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Remote_Controller_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Remote_Controller_Data(id: number){
        return db.one<DBType_Remote_Controller_Data>('DELETE FROM remote_controller_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Remote_Controller_Data(id: number){
        return db.one<DBType_Remote_Controller_Data>('SELECT * FROM remote_controller_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//drone_data

import {DBType_Drone_Data_TypeType} from "./DBTypes";

export type DBInsert_Drone_Data = {
    drone_id: number
    flight_id: number
    type?: DBType_Drone_Data_TypeType
    data: any
    created_at?: string
}

export type DBUpdate_Drone_Data = {
    drone_id?: number
    flight_id?: number
    type?: DBType_Drone_Data_TypeType
    data?: any
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
import {DBType_Drone_Data} from './DBTypes'


    export function insert_Drone_Data(values: DBInsert_Drone_Data){
        return db.one<DBType_Drone_Data>(db.$config.pgp.helpers.insert(values, undefined, 'drone_data') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Drone_Data<T extends number | string>(values: DBUpdate_Drone_Data, idOrWhereCondition: T): T extends number ? Promise<DBType_Drone_Data> : Promise<DBType_Drone_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Drone_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Drone_Data(id: number){
        return db.one<DBType_Drone_Data>('DELETE FROM drone_data WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Drone_Data(id: number){
        return db.one<DBType_Drone_Data>('SELECT * FROM drone_data ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//drone_media

import {DBType_Drone_Media_TypeType} from "./DBTypes";

export type DBInsert_Drone_Media = {
    drone_id: number
    flight_id: number
    type: DBType_Drone_Media_TypeType
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

export type DBUpdate_Drone_Media = {
    drone_id?: number
    flight_id?: number
    type?: DBType_Drone_Media_TypeType
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
import {DBType_Drone_Media} from './DBTypes'


    export function insert_Drone_Media(values: DBInsert_Drone_Media){
        return db.one<DBType_Drone_Media>(db.$config.pgp.helpers.insert(values, undefined, 'drone_media') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Drone_Media<T extends number | string>(values: DBUpdate_Drone_Media, idOrWhereCondition: T): T extends number ? Promise<DBType_Drone_Media> : Promise<DBType_Drone_Media[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Drone_Media>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Drone_Media(id: number){
        return db.one<DBType_Drone_Media>('DELETE FROM drone_media WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Drone_Media(id: number){
        return db.one<DBType_Drone_Media>('SELECT * FROM drone_media ' + pgp.as.format('WHERE id = ${id}', {id}))
    }


//geo_objects

import {} from "./DBTypes";

export type DBInsert_Geo_Object = {
    uuid?: string
    workspace_id: number
    name: string
    type: number
    sub_type: number
    config?: any
    created_at?: string
    updated_at?: string
}

export type DBUpdate_Geo_Object = {
    uuid?: string
    workspace_id?: number
    name?: string
    type?: number
    sub_type?: number
    config?: any
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
import {DBType_Geo_Object} from './DBTypes'


    export function insert_Geo_Object(values: DBInsert_Geo_Object){
        return db.one<DBType_Geo_Object>(db.$config.pgp.helpers.insert(values, undefined, 'geo_objects') + ' RETURNING *')
    }

/**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export function update_Geo_Object<T extends number | string>(values: DBUpdate_Geo_Object, idOrWhereCondition: T): T extends number ? Promise<DBType_Geo_Object> : Promise<DBType_Geo_Object[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            //@ts-ignore
            return db.one<DBType_Geo_Object>(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            return db.none(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' ' + whereCondition)
        }
    }

    export function delete_Geo_Object(id: number){
        return db.one<DBType_Geo_Object>('DELETE FROM geo_objects WHERE id = ${id} RETURNING *', {id})
    }

    


    export function select_Geo_Object(id: number){
        return db.one<DBType_Geo_Object>('SELECT * FROM geo_objects ' + pgp.as.format('WHERE id = ${id}', {id}))
    }