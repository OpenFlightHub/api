import { NextFunction, RequestHandler, Request, Response, Express } from 'express'
import { validate, filterObject, FilterError } from './util/schema'
import { DBType_User, DBType_Connection, DBType_WorkspacePermission } from './db/DBTypes'
import * as pgp from 'pg-promise'
import { ApiType_Id } from './definitions/ApiTypes'
import { JSONSchema } from 'json-schema-to-typescript'
import { selectUser } from './db/DBHelpers'
import { DBType_User_STATES } from './db/DBTypes'

const db : pgp.IDatabase<any> = global.db


export function guardedMiddleware(app: Express) : RequestHandler {

    app.use((req, res, next)=>{ //prevent someone from using the res.send() function with any value instead of guardSendResult() or unguardedSend()

        const origSend = res.send

        //@ts-ignore
        res.send = function (responseBody: any){

            if(responseBody !== undefined && !res.isGuarded){
                const err = new Error('tried to access prohibited res.send() with a responseBody!')
                console.error(err)
                throw err
            }
            res.isGuarded = true

            return origSend.call(this, responseBody)
        }

        const origJson = res.json

        res.json = function(responseBody: object){

            if(responseBody !== undefined && !res.isGuarded){
                const err = new Error('tried to access prohibited res.json() with a responseBody!')
                console.error(err)
                throw err
            }

            res.isGuarded = true

            return origJson.call(this, responseBody)
        }

        next()
    })

    return (req: Request, res: Response, next: NextFunction) => {

        const gm = new GuardedMiddleware(req, res)

        req.GM = gm
        res.GM = gm

        next()
    }
}


export function getUserForLoginToken(token: string) : Promise<false | DBType_User> {
    return new Promise(resolve=>{
        db.one('SELECT * FROM users WHERE login_token = ${login_token};', {
            login_token: token
        }).then(result => {
            resolve(result)
        }).catch(()=>{
            resolve(false)
        })
    })
}

export function getUserForSessionToken(token: string) : Promise<false | DBType_User> {
    return new Promise(resolve=>{
        db.one('SELECT * FROM users WHERE session_token = ${session_token};', {
            session_token: token
        }).then(result => {
            resolve(result)
        }).catch(()=>{
            resolve(false)
        })
    })
}

export function getConnectionForAccessKey(accessKey: string) : Promise<false | DBType_Connection> {
    return new Promise(resolve=>{
        db.one('SELECT * FROM connections WHERE access_key = ${accessKey};', {
            accessKey
        }).then(result => {
            resolve(result)
        }).catch(()=>{
            resolve(false)
        })
    })
}


export class GuardedMiddleware {

    private readonly req: Request
    private readonly res: Response

    private readonly requestBody: any
    private readonly requestParams: any

    currentUser: DBType_User | undefined
    currentConnection: DBType_Connection | undefined

    constructor(req: Request, res: Response){
        this.req = req
        this.res = res

        this.requestBody = req.body
    }

    async guardUserIsAuthenticated() : Promise<DBType_User> {
        const cookie = this.req.cookies['user-auth']

        if(!cookie){
            throw GuardError._401_Unauthorized()
        }

        const user = await getUserForSessionToken(cookie)

        if(user === false){ //invalid token
            throw GuardError._401_Unauthorized()
        }

        if(user.state === DBType_User_STATES.locked || user.state === DBType_User_STATES.deleted){
            throw GuardError._401_Unauthorized()
        }

        this.currentUser = user

        return user
    }

    async guardUserHasPermissionForWorkspace(workspaceId: number){
        const user = await this.getCurrentUser()

        const permission = await db.oneOrNone<DBType_WorkspacePermission>('SELECT * FROM workspace_permissions WHERE user_id = ${userId} AND workspace_id = ${workspaceId}', {
            userId: user.id,
            workspaceId
        })

        return !!permission
    }

    async getCurrentUser(){
        if(this.currentUser){
            return this.currentUser
        } else {
            return await this.guardUserIsAuthenticated()
        }
    }

    async guardLinkIsAuthenticatedAsConnection() : Promise<DBType_Connection> {
        const cookie = this.req.cookies['connect-auth']

        if(!cookie){
            throw GuardError._401_Unauthorized()
        }

        const connection = await getConnectionForAccessKey(cookie)

        if(connection === false){ //invalid token
            throw GuardError._401_Unauthorized()
        }

        this.currentConnection = connection

        return connection
    }

    async getCurrentConnection(){
        if(this.currentConnection){
            return this.currentConnection
        } else {
            return await this.guardLinkIsAuthenticatedAsConnection()
        }
    }


    /**
     * if db query yields no result will execute res.status(410).send()
     * @param retrieveDBObject must return a pg promise like db.one()
     * @returns the result of retrieveDBObject()
     */
    async guardDBGone<T>(retrieveDBObject: () => Promise<T>){
        try {
            const result = await retrieveDBObject()

            return result

        } catch (error) {
            if(error instanceof pgp.errors.QueryResultError){
                throw GuardError._410_Gone('Gone')
            } else {
                throw error
            }
        }
    }

    /**
     * tries to convert e.g. "2" into 2, if the schema requires a number
     * applies changes inplace!
     */
    private recursivelyTryToParseObjectAccordingToSchema(context: any, schema: JSONSchema, path: string){//TODO test this code
        if(schema.type === 'object'){
            if(typeof context !== 'object' || Array.isArray(context) || context == null){
                throw GuardError._400_invalidBody(path)
            } else {
                for(const key of Object.keys(schema.properties)){

                    if(schema.required instanceof Array && schema.required.includes(key) && context[key] === undefined){
                        throw GuardError._400_invalidBody(path) + '.' + key
                    }

                    if(context[key] !== undefined){
                        context[key] = this.recursivelyTryToParseObjectAccordingToSchema(context[key], schema.properties[key], path + '.' + key)
                    }
                }
            }
        } else if(schema.type === 'array'){

            if(schema.items instanceof Array){
                throw new Error('schema.items -> [] not supported')
            }

            if(context instanceof Array === false){
                throw GuardError._400_invalidBody(path)
            } else {

                for(let i = 0; i < context.length; i++){
                    context[i] = this.recursivelyTryToParseObjectAccordingToSchema(context[i], schema.items, path + '[' + i + ']')
                }
            }
        } else if(schema.type === 'integer'){
            const parsed = parseInt(context)
            if(isNaN(parsed)){
                throw GuardError._400_invalidBody(path)
            }
            return parsed
        } else if(schema.type === 'number'){
            const parsed = parseFloat(context)
            if(isNaN(parsed)){
                throw GuardError._400_invalidBody(path)
            }
            return parsed
        } else if(schema.type === 'boolean'){
            if(context === 'true'){
                return true
            } else if(context === 'false'){
                return false
            } else {
                throw GuardError._400_invalidBody(path)
            }
        }

        return context
    }

    guardBodySchema<T>(schema: JSONSchema, isMultiFormData?: boolean){

        let body = this.req.body

        if(isMultiFormData){
            body = this.recursivelyTryToParseObjectAccordingToSchema(body, schema, '')
        }

        const valid = validate(body, schema)

        if(valid !== true){
            throw GuardError._400_invalidBody(valid)
        }

        return body as T
    }

    guardParam<T extends 'integer' | 'id' | 'string' | 'uuid'>(paramName: string, schema: T) : T extends 'integer' ? number : ( T extends 'id' ? number : string) {
        const value = this.req.params[paramName]

        switch(schema){
            case 'string': {
                if(typeof value !== 'string'){
                    throw GuardError._400_BadRequest('invalid param ' + paramName)
                }

                //@ts-ignore
                return '' + value
            }

            case 'uuid': {
                if(typeof value !== 'string'){
                    throw GuardError._400_BadRequest('invalid param ' + paramName)
                }

                if(!value.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)){
                    throw GuardError._400_BadRequest('invalid param ' + paramName)
                }

                //@ts-ignore
                return '' + value
            }

            case 'id':
            case 'integer': {

                if(typeof value !== 'string' || !value.match(/[0-9]+/)){
                    throw GuardError._400_BadRequest('invalid param ' + paramName)
                }

                const parsed = parseInt(value)

                if(isNaN(parsed)){
                    throw GuardError._400_BadRequest('invalid param ' + paramName)
                }

                //@ts-ignore
                return parsed
            }

            default: {
                throw new Error('unsupport param type: ' + schema)
            }
        }
    }

    guardSend(responseBody: object, schema: JSONSchema){

        if(responseBody instanceof Promise){
            throw new Error('responseBody is a Promise, did you forget await?')
        }

        try {
            const filtered = filterObject(responseBody, schema)
            this.res.isGuarded = true
            this.res.send(filtered)
        } catch(err){
            if(err instanceof FilterError){
                console.error('guardSend', this.req.baseUrl + this.req.url, 'responseBody did not satisfy schema:', err, 'responseBody:', responseBody)
                throw err
            } else {
                throw err
            }
        }
    }

    unguardedSend(responseBody: any){
        this.res.isGuarded = true
        this.res.send(responseBody)
    }
}


export type ParamsSchema = {[key: string] : 'integer' | 'string'}

export class GuardError extends Error {

    readonly statusCode: number
    readonly statusText: string

    constructor(statusCode: number, statusText?: string){
        super('' + statusCode + ': ' + statusText)

        this.statusCode = statusCode
        this.statusText = statusText
    }

    static _make(statusCode: number, message: string, detailedMessage?: string){
        return new GuardError(statusCode, message + (detailedMessage ? ': ' + detailedMessage : ''))
    }

    static _400_BadRequest(detailedMessage?: string){
        return this._make(400, 'Bad Request', detailedMessage)
    }

    static _400_invalidBody(path: string){
        return this._400_BadRequest('Invalid Body Schema: ' + path)
    }

    static _401_Unauthorized(detailedMessage?: string){
        return this._make(401, 'Unauthorized', detailedMessage)
    }

    static _403_Forbidden(detailedMessage?: string){
        return this._make(403, 'Forbidden', detailedMessage)
    }

    static _410_Gone(detailedMessage?: string){
        return this._make(410, 'Gone (Record not found)', detailedMessage)
    }

}


