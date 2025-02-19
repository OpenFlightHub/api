import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_DjiPilot2ApiMediaFastUploadPost, ApiType_DjiPilot2ApiMediaFastUploadPostResponse, ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPost, ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse, ApiType_DjiPilot2ApiMediaGroupUploadCallbackPost, ApiType_DjiPilot2ApiMediaGroupUploadCallbackPostResponse, ApiType_DjiPilot2ApiMediaStsPostResponse, ApiType_DjiPilot2ApiMediaUploadCallbackPost, ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse } from '../../../../definitions/ApiTypes';
import { ApiSchema_DjiPilot2ApiMediaFastUploadPost, ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse, ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost, ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse, ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPost, ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPostResponse, ApiSchema_DjiPilot2ApiMediaStsPostResponse, ApiSchema_DjiPilot2ApiMediaUploadCallbackPost, ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse } from '../../../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import {createTemporaryCredentialsForFileUpload, deleteObject, downloadObject} from '../../../../s3-store'
import SecretsLoader from '../../../../util/SecretsLoader'
import { DBType_Connection, DBType_DroneMedia, DBType_DroneMedia_TYPES, DBType_DroneMedia_TypeType } from '../../../../db/DBTypes';
import { GuardError } from '../../../../ManInTheMiddleware';
import { deleteFile, insertDroneMedia, insertFile, updateFile } from '../../../../db/DBHelpers';
import {getAbsoluteFilePathForFileIdAnName} from '../../../../util/file'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['minio_api_url', 'minio_region', 'minio_bucket_dji_pilot_2_media'])

const router = express.Router()


router.post('/fast_upload', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaFastUploadPost>(ApiSchema_DjiPilot2ApiMediaFastUploadPost)

    //TODO check if fingerprint is fine or if we need body.ext.tinny_fingerprint

    if(body.fingerprint.length === 0){
        throw GuardError._400_invalidBody('fingerprint')
    }

    const existingMedia = await db.oneOrNone<DBType_DroneMedia>('SELECT * FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.drone_id' + pgp.as.format('WHERE fingerprint = ${fingerprint} AND connection.id = ${connectionId}', {
        fingerprint: body.fingerprint,
        connectionId: connection.id
    }))

    if(existingMedia){
        res.GM.guardSend<ApiType_DjiPilot2ApiMediaFastUploadPostResponse>({
            code: 0,
            data: {},
            message: 'success'
        }, ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse)
    } else {
        res.GM.guardSend<ApiType_DjiPilot2ApiMediaFastUploadPostResponse>({
            code: 404,
            data: {},
            message: 'no file with this fingerprint exists'
        }, ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse)
    }

}))

router.post('/tiny-fingerprints', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPost>(ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost)

    const existingTinyFingerprints = await db.manyOrNone<string>('SELECT tiny_fingerprint FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.drone_id' + pgp.as.format('WHERE connection.id = ${connectionId}', {
        connectionId: connection.id
    }))

    res.GM.guardSend<ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse>({
        code: 0,
        message: 'success',
        data: {
            tiny_fingerprints: existingTinyFingerprints
        }
    }, ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse)

}))

router.post('/sts', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    // see https://min.io/docs/minio/linux/developers/security-token-service.html

    const credentials = await createTemporaryCredentialsForFileUpload(connection.id)

    res.GM.guardSend<ApiType_DjiPilot2ApiMediaStsPostResponse>({
        code: 0,
        data: {
            bucket: secrets.minio_bucket_dji_pilot_2_media,
            endpoint: secrets.minio_api_url,
            object_key_prefix: 'from_drone_',
            provider: 'minio',
            region: secrets.minio_region,
            credentials: {
                access_key_id: credentials.accessKey,
                access_key_secret: credentials.secretKey
            }
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMediaStsPostResponse)

}))

router.post('/upload-callback', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaUploadCallbackPost>(ApiSchema_DjiPilot2ApiMediaUploadCallbackPost)

    if(body.result === 0){
        // upload successfull

        const mediaType = typeof body.sub_file_type === 'number' ? (body.sub_file_type === 1 ? 'panorama' : 'picture') : 'video'

        //TODO support differentiation between picture and panorama

        await addDroneMediaFromBucket(connection, secrets.minio_bucket_dji_pilot_2_media, body.object_key, mediaType === 'video' ? DBType_DroneMedia_TYPES.video : DBType_DroneMedia_TYPES.image, body.fingerprint, body.ext.tinny_fingerprint)

        res.GM.guardSend<ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse>({
            code: 0,
            message: 'success',
            data: {
                object_key: body.object_key
            }
        }, ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse)


    } else {
        // upload failed

        console.warn('upload of dji pilot 2 media to s3 bucket failed:', body)
        //TODO retry?

        res.GM.guardSend<ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse>({
            code: 0,
            message: 'success',
            data: {
                object_key: body.object_key
            }
        }, ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse)

    }
}))

router.post('/group-upload-callback', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaGroupUploadCallbackPost>(ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPost)

    //TODO what do we need to implement here?
    console.log('group-upload-callback', body)

    res.GM.guardSend<ApiType_DjiPilot2ApiMediaGroupUploadCallbackPostResponse>({
        code: 0,
        message: 'success',
        data: {}
    }, ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPostResponse)
}))

export default router


async function addDroneMediaFromBucket(connection: DBType_Connection, bucketName: string, objectKey: string, type: DBType_DroneMedia_TypeType, fingerprint: string, tinyFingerprint: string){
    //TODO

    const file = await insertFile({
        created_by: 0, // TODO change this
        workspace_id: connection.workspace_id,
        name: objectKey
    })

    let droneMedia: DBType_DroneMedia
    try {
        droneMedia = await insertDroneMedia({
            drone_id: connection.drone_id!,
            type,
            fingerprint,
            tiny_fingerprint: tinyFingerprint,
            file_id: file.id
        })

    } catch (err){
        //TODO delete file

        throw err
    }

    try {
        await downloadObject(bucketName, objectKey, getAbsoluteFilePathForFileIdAnName(file.id, file.name))
    } catch (err){
        //TODO delete file and delete dronemedia
        throw err
    }

    try {
        await deleteObject(bucketName, objectKey)
    } catch (err){
        console.error('failed to delete object after it was downloaded', err)
    }

    return droneMedia
}