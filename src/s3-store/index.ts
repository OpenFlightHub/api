
// see https://min.io/docs/minio/linux/developers/security-token-service.html
// and https://github.com/minio/minio/blob/master/docs/sts/assume-role.md

import * as fs from 'fs'
import * as minio from 'minio'
import { fetchUrl } from "../util/http";
import {generateUniqueTokenUrlSafe} from '../util/crypto'

import SecretsLoader from '../util/SecretsLoader'
import { validate } from '../util/schema';
import Credentials from 'minio/dist/main/Credentials';
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['minio_api_url', 'minio_api_access_key_readwrite', 'minio_api_secret_key_readwrite', 'minio_api_access_key_writeonly', 'minio_api_secret_key_writeonly', 'minio_region'])

const API_BASE_URL = secrets.minio_api_url + (('' + secrets.minio_api_url).endsWith('/') ? '' : '/' )
const MY_ARN_ID = 'ofh'


const minioClientReadWrite = new minio.Client({
    endPoint: API_BASE_URL.split(':')[0],
    useSSL: false,
    port: parseInt(API_BASE_URL.split(':')[1]),
    accessKey: secrets.minio_api_access_key_readwrite,
    secretKey: secrets.minio_api_secret_key_readwrite,
    region: secrets.minio_region
})

const minioClientWriteOnly = new minio.Client({
    endPoint: API_BASE_URL.split(':')[0],
    useSSL: false,
    port: parseInt(API_BASE_URL.split(':')[1]),
    accessKey: secrets.minio_api_access_key_writeonly,
    secretKey: secrets.minio_api_secret_key_writeonly,
    region: secrets.minio_region
})

//TODO make bucket for each connection (with minio client)

export type TemporaryCredentials = {
    access_key_id: string
    access_key_secret: string
    expire: number
    security_token: string
}

export async function createTemporaryCredentialsForFileUpload(){

    const token = generateUniqueTokenUrlSafe(42)

    //TODO login first
    const res = await fetchUrl({
        url: API_BASE_URL
        + '?Action=AssumeRoleWithCustomToken&Token=' + token
        + '&Version=2011-06-15'
        + '&RoleArn=' + MY_ARN_ID //TODO what does this do?
        + '&DurationSeconds=3600',
        method: 'post'
    })

    const validationResult = validate(res, {
        type: 'object',
        required: ['access_key_id', 'access_key_secret', 'expire', 'security_token'],
        properties: {
            access_key_id: {
                type: 'string'
            },
            access_key_secret: {
                type: 'string'
            },
            expire: {
                type: 'number'
            },
            security_token: {
                type: 'string'
            }
        }
    })

    console.log(res)

    if(validationResult !== true){
        throw new Error('could not create temporary credentials, minio response did not satisfy schema: ' + validationResult)
    }

    return res as TemporaryCredentials
}

export async function uploadObject(bucketName: string, objectKey: string, sourceFilePath: string){
    const readBuffer = await fs.promises.readFile(sourceFilePath)
    await minioClientWriteOnly.putObject(bucketName, objectKey, readBuffer)
}

export function downloadObject(bucketName: string, objectKey: string, targetFilePath: string){
    return new Promise<void>((resolve, reject)=>{

        let state: 'running' | 'rejected' | 'resolved' = 'running'

        const writeStream = fs.createWriteStream(targetFilePath)

        writeStream.on('error', err =>{
            if(state === 'running'){
                reject(err)
                state = 'rejected'
            }
        })

        writeStream.on('finish', ()=>{
            state = 'resolved'
            resolve()
        })

        minioClientReadWrite.getObject(bucketName, objectKey).then(readStream => {

            readStream.pipe(writeStream)

            readStream.on('error', err => {
                if(state !== 'rejected'){
                    state = 'rejected'
                    reject(err)
                }
            })

        }).catch(reject)
    })
}

export async function deleteObject(bucketName: string, objectKey: string){

    await minioClientReadWrite.removeObject(bucketName, objectKey)
}
