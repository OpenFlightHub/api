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
 @param whereCondition shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = ${id}', {id: 42})
*/
export function updateUser(values: DBUpdate_User, whereCondition: string){
    whereCondition = whereCondition.trim()
    if(whereCondition.endsWith(';')){
        whereCondition = whereCondition.substring(0, whereCondition.length - 1)
    }

    return db.one<DBType_User>(db.$config.pgp.helpers.update(values, COLUMN_SET_USERS_UPDATE) + ' ' + whereCondition + ' RETURNING *')
}

export function deleteUser(id: number){
    return db.none('DELETE FROM users WHERE id = ${id}', {id})
}




export function selectUser(id: number){
    return db.one<DBType_User>('SELECT * FROM users ' + pgp.as.format('WHERE id = ${id}', {id}))
}