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
        return db.one<DBTypeUser>(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_User>(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteUser(id: number){
    return db.none('DELETE FROM users WHERE id = ${id}', {id})
}




export function selectUser(id: number){
    return db.one<DBType_User>('SELECT * FROM users ' + pgp.as.format('WHERE id = ${id}', {id}))
}


//workspaces

import {} from "./DBTypes";

export type DBInsert_Workspace = {
    name: string
}

export type DBUpdate_Workspace = {
    name?: string
}
const COLUMN_SET_WORKSPACES = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
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
        return db.one<DBTypeWorkspace>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_Workspace>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteWorkspace(id: number){
    return db.none('DELETE FROM workspaces WHERE id = ${id}', {id})
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
        return db.one<DBTypeWorkspacePermission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_WorkspacePermission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteWorkspacePermission(id: number){
    return db.none('DELETE FROM workspace_permissions WHERE id = ${id}', {id})
}




//connections

import {} from "./DBTypes";

export type DBInsert_Connection = {
    access_key: string
    workspace_id: number
    remote_controller_id?: number
    drone_id?: number
}

export type DBUpdate_Connection = {
    access_key?: string
    workspace_id?: number
    remote_controller_id?: number
    drone_id?: number
}
const COLUMN_SET_CONNECTIONS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "access_key"
    },
    {
        "name": "workspace_id"
    },
    {
        "name": "remote_controller_id",
        "skip": col => !col.exists
    },
    {
        "name": "drone_id",
        "skip": col => !col.exists
    }
], {table: "connections"})

const COLUMN_SET_CONNECTIONS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "access_key",
        "skip": col => !col.exists
    },
    {
        "name": "workspace_id",
        "skip": col => !col.exists
    },
    {
        "name": "remote_controller_id",
        "skip": col => !col.exists
    },
    {
        "name": "drone_id",
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
        return db.one<DBTypeConnection>(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_Connection>(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteConnection(id: number){
    return db.none('DELETE FROM connections WHERE id = ${id}', {id})
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
        return db.one<DBTypeRemoteController>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_RemoteController>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteRemoteController(id: number){
    return db.none('DELETE FROM remote_controllers WHERE id = ${id}', {id})
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
}

export type DBUpdate_Drone = {
    serial_number?: string
    name?: string
    type?: DBType_Drone_TypeType
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
        return db.one<DBTypeDrone>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_Drone>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function deleteDrone(id: number){
    return db.none('DELETE FROM drones WHERE id = ${id}', {id})
}




export function selectDrone(id: number){
    return db.one<DBType_Drone>('SELECT * FROM drones ' + pgp.as.format('WHERE id = ${id}', {id}))
}