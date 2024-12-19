import * as express from 'express'
import {generateUniqueToken} from './crypto'
import {ApiType_Id} from '../definitions/ApiTypes'
import pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db


const SESSION_TOKEN_BYTE_LENGTH = 42

function generateSessionCookie(){
    return generateUniqueToken(SESSION_TOKEN_BYTE_LENGTH)
}

function setSessionCookie(cookieName: string, cookieValue: string, res: express.Response){

    res.cookie(cookieName, cookieValue, {
        //secure: true, TODO enable for production (but does this not kill api client sdk?)
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24
    })
}

export async function generateUserSessionCookieAndSet(userId: number, res: express.Response){

    const sessionToken = generateSessionCookie()

    await db.none('UPDATE users SET session_token = ${sessionToken} WHERE id = ${id};', {
        id: userId,
        sessionToken
    })

    setSessionCookie('user-auth', sessionToken, res)
}

export async function generateConnectionSessionCookieAndSet(connectionId: number, res: express.Response){

    const sessionToken = generateSessionCookie()

    await db.none('UPDATE connections SET session_token = ${sessionToken} WHERE id = ${id};', {
        id: connectionId,
        sessionToken
    })

    setSessionCookie('connection-link-auth', sessionToken, res)
}
