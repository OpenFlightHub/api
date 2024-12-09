import * as request from "supertest"
import { App } from "supertest/types"

export async function getAuthCookieValue(app: App, loginToken: string){
    const login = await request(app).post('/auth/login-with-token').send({
        token: loginToken
    })

    const cookie = login.get('Set-Cookie')[0]
    if(!cookie){
        throw new Error('Set-Cookie header missing')
    }

    return cookie
}