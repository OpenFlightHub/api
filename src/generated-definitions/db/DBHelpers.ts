import * as pgp from 'pg-promise'
    //@ts-ignore
const db = global.db as pgp.IDatabase<any>




//users

import {DBType_User_StateType} from "./DBTypes";

export type DBInsert_User = {
    team_id?: number
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
    created_by_user_id: number
}

export type DBUpdate_User = {
    team_id?: number
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
    created_by_user_id?: number
}
const COLUMN_SET_USERS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "team_id",
        "skip": col => !col.exists
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
    },
    {
        "name": "created_by_user_id"
    }
], {table: "users"})

const COLUMN_SET_USERS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "team_id",
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
    },
    {
        "name": "created_by_user_id",
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
    export async function update_User<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_User): Promise<T extends number ? false | DBType_User : DBType_User[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_User>(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_User>(db.$config.pgp.helpers.update(values,  COLUMN_SET_USERS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_User<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_User : DBType_User[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_User>('DELETE FROM users WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_User>('DELETE FROM users ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_User<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_User : DBType_User[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_User>('SELECT * FROM users ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_User>('SELECT * FROM users ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//teams

import {DBType_Team_StateType} from "./DBTypes";

export type DBInsert_Team = {
    name: string
    owner_user_id: number
    organisation_id?: number
    created_at?: string
    state?: DBType_Team_StateType
    logo_file_id?: number
}

export type DBUpdate_Team = {
    name?: string
    owner_user_id?: number
    organisation_id?: number
    created_at?: string
    state?: DBType_Team_StateType
    logo_file_id?: number
}
const COLUMN_SET_TEAMS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
    },
    {
        "name": "owner_user_id"
    },
    {
        "name": "organisation_id",
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
        "name": "logo_file_id",
        "skip": col => !col.exists
    }
], {table: "teams"})

const COLUMN_SET_TEAMS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "owner_user_id",
        "skip": col => !col.exists
    },
    {
        "name": "organisation_id",
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
        "name": "logo_file_id",
        "skip": col => !col.exists
    }
], {table: "teams"})
import {DBType_Team} from './DBTypes'


    export function insert_Team(values: DBInsert_Team){
        return db.one<DBType_Team>(db.$config.pgp.helpers.insert(values, undefined, 'teams') + ' RETURNING *')
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function update_Team<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Team): Promise<T extends number ? false | DBType_Team : DBType_Team[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Team>(db.$config.pgp.helpers.update(values,  COLUMN_SET_TEAMS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Team>(db.$config.pgp.helpers.update(values,  COLUMN_SET_TEAMS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Team<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Team : DBType_Team[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Team>('DELETE FROM teams WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Team>('DELETE FROM teams ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Team<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Team : DBType_Team[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Team>('SELECT * FROM teams ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Team>('SELECT * FROM teams ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//organisations

import {DBType_Organisation_StateType} from "./DBTypes";

export type DBInsert_Organisation = {
    name: string
    owner_user_id: number
    created_at?: string
    state?: DBType_Organisation_StateType
    logo_file_id?: number
}

export type DBUpdate_Organisation = {
    name?: string
    owner_user_id?: number
    created_at?: string
    state?: DBType_Organisation_StateType
    logo_file_id?: number
}
const COLUMN_SET_ORGANISATIONS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "cnd": true
    },
    {
        "name": "name"
    },
    {
        "name": "owner_user_id"
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
        "name": "logo_file_id",
        "skip": col => !col.exists
    }
], {table: "organisations"})

const COLUMN_SET_ORGANISATIONS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "id",
        "skip": col => !col.exists
    },
    {
        "name": "name",
        "skip": col => !col.exists
    },
    {
        "name": "owner_user_id",
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
        "name": "logo_file_id",
        "skip": col => !col.exists
    }
], {table: "organisations"})
import {DBType_Organisation} from './DBTypes'


    export function insert_Organisation(values: DBInsert_Organisation){
        return db.one<DBType_Organisation>(db.$config.pgp.helpers.insert(values, undefined, 'organisations') + ' RETURNING *')
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function update_Organisation<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Organisation): Promise<T extends number ? false | DBType_Organisation : DBType_Organisation[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Organisation>(db.$config.pgp.helpers.update(values,  COLUMN_SET_ORGANISATIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Organisation>(db.$config.pgp.helpers.update(values,  COLUMN_SET_ORGANISATIONS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Organisation<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Organisation : DBType_Organisation[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Organisation>('DELETE FROM organisations WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Organisation>('DELETE FROM organisations ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Organisation<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Organisation : DBType_Organisation[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Organisation>('SELECT * FROM organisations ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Organisation>('SELECT * FROM organisations ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//files

import {} from "./DBTypes";

export type DBInsert_File = {
    workspace_id: number
    ext: string
    name: string
    created_at?: string
    created_by: number
    thumbnail_format?: string
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
    thumbnail_format?: string
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
        "name": "thumbnail_format",
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
        "name": "thumbnail_format",
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
    export async function update_File<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_File): Promise<T extends number ? false | DBType_File : DBType_File[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_File>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FILES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_File>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FILES_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_File<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_File : DBType_File[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_File>('DELETE FROM files WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_File>('DELETE FROM files ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_File<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_File : DBType_File[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_File>('SELECT * FROM files ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_File>('SELECT * FROM files ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Workspace<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Workspace): Promise<T extends number ? false | DBType_Workspace : DBType_Workspace[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Workspace>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Workspace>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACES_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Workspace<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Workspace : DBType_Workspace[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Workspace>('DELETE FROM workspaces WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Workspace>('DELETE FROM workspaces ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Workspace<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Workspace : DBType_Workspace[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Workspace>('SELECT * FROM workspaces ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Workspace>('SELECT * FROM workspaces ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//workspace_permissions

import {} from "./DBTypes";

export type DBInsert_Workspace_Permission = {
    team_id: number
    workspace_id: number
}

export type DBUpdate_Workspace_Permission = {
    team_id?: number
    workspace_id?: number
}
const COLUMN_SET_WORKSPACE_PERMISSIONS = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "team_id"
    },
    {
        "name": "workspace_id"
    }
], {table: "workspace_permissions"})

const COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE = new db.$config.pgp.helpers.ColumnSet([
    {
        "name": "team_id",
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
    export async function update_Workspace_Permission<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Workspace_Permission): Promise<T extends number ? false | DBType_Workspace_Permission : DBType_Workspace_Permission[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Workspace_Permission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Workspace_Permission>(db.$config.pgp.helpers.update(values,  COLUMN_SET_WORKSPACE_PERMISSIONS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Workspace_Permission<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Workspace_Permission : DBType_Workspace_Permission[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Workspace_Permission>('DELETE FROM workspace_permissions WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Workspace_Permission>('DELETE FROM workspace_permissions ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
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
    stream_is_alive?: boolean
}

export type DBUpdate_Connection = {
    name?: string
    secret?: string
    session_token?: string
    workspace_id?: number
    workspace_uuid?: string
    remote_controller_id?: number
    last_drone_id?: number
    stream_is_alive?: boolean
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
    },
    {
        "name": "stream_is_alive",
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
    },
    {
        "name": "stream_is_alive",
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
    export async function update_Connection<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Connection): Promise<T extends number ? false | DBType_Connection : DBType_Connection[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Connection>(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Connection>(db.$config.pgp.helpers.update(values,  COLUMN_SET_CONNECTIONS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Connection<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Connection : DBType_Connection[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Connection>('DELETE FROM connections WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Connection>('DELETE FROM connections ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Connection<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Connection : DBType_Connection[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Connection>('SELECT * FROM connections ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Connection>('SELECT * FROM connections ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Remote_Controller<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Remote_Controller): Promise<T extends number ? false | DBType_Remote_Controller : DBType_Remote_Controller[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLERS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Remote_Controller<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Remote_Controller : DBType_Remote_Controller[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller>('DELETE FROM remote_controllers WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller>('DELETE FROM remote_controllers ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Remote_Controller<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Remote_Controller : DBType_Remote_Controller[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller>('SELECT * FROM remote_controllers ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller>('SELECT * FROM remote_controllers ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Drone<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Drone): Promise<T extends number ? false | DBType_Drone : DBType_Drone[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONES_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Drone<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone : DBType_Drone[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone>('DELETE FROM drones WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone>('DELETE FROM drones ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Drone<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone : DBType_Drone[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone>('SELECT * FROM drones ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone>('SELECT * FROM drones ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//flights

import {} from "./DBTypes";

export type DBInsert_Flight = {
    drone_id: number
    workspace_id: number
    started_at?: string
    landed_at?: string
    ended_at?: string
}

export type DBUpdate_Flight = {
    drone_id?: number
    workspace_id?: number
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
        "name": "workspace_id"
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
        "name": "workspace_id",
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
    export async function update_Flight<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Flight): Promise<T extends number ? false | DBType_Flight : DBType_Flight[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHTS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHTS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Flight<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Flight : DBType_Flight[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight>('DELETE FROM flights WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight>('DELETE FROM flights ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Flight<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Flight : DBType_Flight[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight>('SELECT * FROM flights ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight>('SELECT * FROM flights ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Flight_Data<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Flight_Data): Promise<T extends number ? false | DBType_Flight_Data : DBType_Flight_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_FLIGHT_DATA_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Flight_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Flight_Data : DBType_Flight_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight_Data>('DELETE FROM flight_data WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight_Data>('DELETE FROM flight_data ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Flight_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Flight_Data : DBType_Flight_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Flight_Data>('SELECT * FROM flight_data ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Flight_Data>('SELECT * FROM flight_data ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Remote_Controller_Data<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Remote_Controller_Data): Promise<T extends number ? false | DBType_Remote_Controller_Data : DBType_Remote_Controller_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_REMOTE_CONTROLLER_DATA_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Remote_Controller_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Remote_Controller_Data : DBType_Remote_Controller_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller_Data>('DELETE FROM remote_controller_data WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller_Data>('DELETE FROM remote_controller_data ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Remote_Controller_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Remote_Controller_Data : DBType_Remote_Controller_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Remote_Controller_Data>('SELECT * FROM remote_controller_data ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Remote_Controller_Data>('SELECT * FROM remote_controller_data ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Drone_Data<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Drone_Data): Promise<T extends number ? false | DBType_Drone_Data : DBType_Drone_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Data>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_DATA_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Drone_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone_Data : DBType_Drone_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Data>('DELETE FROM drone_data WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Data>('DELETE FROM drone_data ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Drone_Data<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone_Data : DBType_Drone_Data[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Data>('SELECT * FROM drone_data ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Data>('SELECT * FROM drone_data ' + whereCondition)

            //@ts-ignore
            return ret
        }

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
    export async function update_Drone_Media<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Drone_Media): Promise<T extends number ? false | DBType_Drone_Media : DBType_Drone_Media[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Media>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Media>(db.$config.pgp.helpers.update(values,  COLUMN_SET_DRONE_MEDIA_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Drone_Media<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone_Media : DBType_Drone_Media[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Media>('DELETE FROM drone_media WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Media>('DELETE FROM drone_media ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Drone_Media<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Drone_Media : DBType_Drone_Media[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Drone_Media>('SELECT * FROM drone_media ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Drone_Media>('SELECT * FROM drone_media ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }


//geo_objects

import {} from "./DBTypes";

export type DBInsert_Geo_Object = {
    uuid?: string
    workspace_id: number
    name: string
    type: number
    sub_type: number
    config: any
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
import {DBType_Geo_Object} from './DBTypes'


    export function insert_Geo_Object(values: DBInsert_Geo_Object){
        return db.one<DBType_Geo_Object>(db.$config.pgp.helpers.insert(values, undefined, 'geo_objects') + ' RETURNING *')
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function update_Geo_Object<T extends number | string>(idOrWhereCondition: T, values: DBUpdate_Geo_Object): Promise<T extends number ? false | DBType_Geo_Object : DBType_Geo_Object[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Geo_Object>(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' WHERE id = ' + id + ' RETURNING *')

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Geo_Object>(db.$config.pgp.helpers.update(values,  COLUMN_SET_GEO_OBJECTS_UPDATE) + ' ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }

    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function delete_Geo_Object<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Geo_Object : DBType_Geo_Object[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Geo_Object>('DELETE FROM geo_objects WHERE id = ${id} RETURNING *', {id})

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret

        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Geo_Object>('DELETE FROM geo_objects ' + whereCondition + ' RETURNING *')

            //@ts-ignore
            return ret
        }
    }



    /**
    @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
    */
    export async function select_Geo_Object<T extends number | string>(idOrWhereCondition: T): Promise<T extends number ? false | DBType_Geo_Object : DBType_Geo_Object[]>{
        if(typeof idOrWhereCondition === 'number'){
            const id = idOrWhereCondition as number
            const ret = await db.oneOrNone<DBType_Geo_Object>('SELECT * FROM geo_objects ' + pgp.as.format('WHERE id = ${id}', {id}))

            if(!ret){
                //@ts-ignore
                return false
            }

            //@ts-ignore
            return ret
        } else {
            let whereCondition = idOrWhereCondition as string
            whereCondition = whereCondition.trim()
            if(whereCondition.endsWith(';')){
                whereCondition = whereCondition.substring(0, whereCondition.length - 1)
            }

            const ret = await db.manyOrNone<DBType_Geo_Object>('SELECT * FROM geo_objects ' + whereCondition)

            //@ts-ignore
            return ret
        }

    }