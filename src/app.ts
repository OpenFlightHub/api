
import express from 'express'

import SecretsLoader from './util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets([
    'db_host', 'db_port', 'db_database', 'db_user', 'db_password',
    'mail_hostname', 'mail_port', 'mail_secure', 'mail_username', 'mail_password', 'mail_from',
    'emailHashPepper'])

global.emailHashPepper = secrets.emailHashPepper

import {setupMail} from './mail'
setupMail(secrets.mail_hostname, secrets.mail_port, secrets.mail_secure, secrets.mail_username, secrets.mail_password, secrets.mail_from).then(()=>{
    console.log('mail is setup')
})

import pgp from 'pg-promise'
const db = pgp({
    error: (error)=>{
        if(error.code === 'ECONNREFUSED' || error.routine === 'auth_failed'){
            console.error('DB:', error)
            process.exit(1)
        }
    }
})
({
    host: secrets.db_host,
    port: secrets.db_port,
    database: secrets.db_database,
    user: secrets.db_user,
    password: secrets.db_password,
    max: 10
})

db.connect({
    direct: true,
    onLost: ()=>{
        console.warn('lost db connection, restarting')
        process.exit(1)
    }
}).then(sco => {
    return liveUpdateRoute.setupNotifications(sco)
}).catch(error => {
    console.error(error)
    process.exit(1)
})



global.db = db



import { GuardError } from './ManInTheMiddleware'

const app = express();
export default app //for testing

import expressWs from 'express-ws'
const ws = expressWs(app)

//req.body will be an object if content-type header is set to application/json
app.use(express.json({limit: '100mb'}))

app.use(express.static('public'))

app.disable('x-powered-by')


// prevent query parameter pollution
import hpp from 'hpp'
app.use(hpp())

const ALLOWED_ORIGIN_HOSTNAMES = ['http://localhost', 'http://localhost:5173', 'https://openflighthub.org', 'https://editor.swagger.io']

/** CORS setting with OPTIONS pre-flight handling */
app.use(function(req, res, next){

    const origin = req.header('origin')

    if(ALLOWED_ORIGIN_HOSTNAMES.includes(origin)){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE,OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, accept, access-control-allow-origin')
        res.header('Access-Control-Allow-Credentials', 'true')
    }

    if (req.method === 'OPTIONS'){
        res.sendStatus(200)
    } else {
        next()
    }
})

import cookieParser from 'cookie-parser'
app.use(cookieParser())


// guarded middleware before the actual routes are being use() d
import { guardedMiddleware, GuardedMiddleware } from './ManInTheMiddleware'
app.use(guardedMiddleware(app))


import morgan from 'morgan'
const IS_TEST_ENVIRONMENT = process.env.JEST_WORKER_ID !== undefined
if(!IS_TEST_ENVIRONMENT){
    app.use(morgan('combined'))
}


import path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , './public/index.html'))
})

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname , './public/docs.html'))
})

import { getLoginToken } from './util/user'
import asyncHandler from 'express-async-handler'
app.post('/make-login-token', asyncHandler(async(req, res) => {
    //TODO remove this unsafe endpoint which is only needed as dirty fix for worker-scheduler!!!

    if(req.body.secret !== 'a987ds766kjhkads6'){
        res.status(404).send()
        return
    }

    const body = req.GM.guardBodySchema<{
        user_id: number
    }>({
        type: 'object',
        required: ['user_id'],
        properties: {
            user_id: {
                type: 'number'
            }
        }
    })

    const token = await getLoginToken(body.user_id)

    res.GM.guardSend({token}, {type: 'object', required: ['token'], properties: {token: {type: 'string'}}})
}))

import authRoute from './routes/auth'
app.use('/auth', authRoute)

import userRoute from './routes/user'
app.use('/user', userRoute)

//websockets

import liveUpdateRoute from './routes/live-update'
app.use('/live-update', liveUpdateRoute.router)


// 404 handler at almost the end of the use() chain
app.use((req, res, next)=> {
    res.status(404)
    res.GM.unguardedSend('404 not found: ' + req.url)
})

// error handler at the very end of the use() chain
app.use((err, req: express.Request, res: express.Response, next)=> {
    if(err instanceof GuardError){// handle ManInTheMiddleware guardedMiddleware errors
        res.status(err.statusCode)
        res.GM.unguardedSend(err.statusText)
    } else {
        console.warn('Unhandled ' + err.name , '@url', req.method, req.baseUrl + req.url, err)
        res.status(500).GM.unguardedSend('Something went wrong')
    }
})



import './mqtt/mqtt_server'
import './mqtt/mqtt_client'


declare global {

    namespace Express {

        export interface Request {
            GM: GuardedMiddleware
            file?: MulterFile // for multer: uplad.single('file')
            files?: MulterFile[] // for multer: uplad.array('files')

            //query: {[key: string] : string} // hpp middleware TODO uncomment this line again and fix the ts error in express
        }

        /**
         * @property isGuarded internal use only: for ManInTheMiddleware guardedMiddleware()
         */
        export interface Response {
            GM: GuardedMiddleware
            isGuarded?: true
        }
    }
}

export type MulterFile = {
    filename: string,
    originalname: string,
    path: string
}
