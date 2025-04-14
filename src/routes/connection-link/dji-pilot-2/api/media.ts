import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_DjiPilot2ApiMediaFastUploadPost, ApiType_DjiPilot2ApiMediaFastUploadPostResponse, ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPost, ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse, ApiType_DjiPilot2ApiMediaGroupUploadCallbackPost, ApiType_DjiPilot2ApiMediaGroupUploadCallbackPostResponse, ApiType_DjiPilot2ApiMediaUploadCallbackPost, ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse } from '../../../../definitions/ApiTypes';
import { ApiSchema_DjiPilot2ApiMediaFastUploadPost, ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse, ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost, ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse, ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPost, ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPostResponse, ApiSchema_DjiPilot2ApiMediaUploadCallbackPost, ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse } from '../../../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import {deleteObject, downloadObject, getBucketNameForConnectionId} from '../../../../s3-store'
import { DBType_Connection, DBType_DroneMedia, DBType_DroneMedia_TYPES, DBType_DroneMedia_TypeType } from '../../../../db/DBTypes';
import { GuardError } from '../../../../ManInTheMiddleware';
import { deleteFile, insertDroneMedia, insertFile } from '../../../../db/DBHelpers';
import {generateThumbnailForFile, getAbsoluteFilePathForFile, getFileExtension} from '../../../../util/file'

const router = express.Router()


router.post('/fast-upload', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaFastUploadPost>(ApiSchema_DjiPilot2ApiMediaFastUploadPost)

    //TODO check if fingerprint is fine or if we need body.ext.tinny_fingerprint

    if(body.fingerprint.length === 0){
        throw GuardError._400_invalidBody('fingerprint')
    }

    const existingMedia = await db.oneOrNone<DBType_DroneMedia>('SELECT * FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.last_drone_id ' + pgp.as.format('WHERE fingerprint = ${fingerprint} AND connections.id = ${connectionId}', {
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

router.post('/files/tiny-fingerprints', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPost>(ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost)

    const existingTinyFingerprints = await db.manyOrNone<string>('SELECT tiny_fingerprint FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.last_drone_id ' + pgp.as.format('WHERE connections.id = ${connectionId}', {
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

router.post('/upload-callback', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_DjiPilot2ApiMediaUploadCallbackPost>(ApiSchema_DjiPilot2ApiMediaUploadCallbackPost)


    const mediaType: DBType_DroneMedia_TypeType = typeof body.sub_file_type === 'number' ? (body.sub_file_type === 1 ? DBType_DroneMedia_TYPES.panorama : DBType_DroneMedia_TYPES.picture) : DBType_DroneMedia_TYPES.video

    //TODO support differentiation between picture and panorama

    await addDroneMediaFromBucket(connection, getBucketNameForConnectionId(connection.id), body.object_key, mediaType, body.fingerprint, body.ext.tinny_fingerprint, JSON.stringify({ext: body.ext, metadata: body.metadata}))

    res.GM.guardSend<ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse>({
        code: 0,
        message: 'success',
        data: {
            object_key: body.object_key
        }
    }, ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse)

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


async function addDroneMediaFromBucket(connection: DBType_Connection, bucketName: string, objectKey: string, type: DBType_DroneMedia_TypeType, fingerprint: string, tinyFingerprint: string, meta: string){

    const file = await insertFile({
        created_by: 0,
        workspace_id: connection.workspace_id,
        name: objectKey,
        ext: getFileExtension(objectKey)
    })

    try {
        await downloadObject(bucketName, objectKey, getAbsoluteFilePathForFile(file))
    } catch (err){

        try {
            await deleteFile(file.id)
        } catch (err){
            console.error('failed to cleanup file after downloading did not work', err)
        }

        throw err
    }

    try {
        await generateThumbnailForFile(file.id)
    } catch (err){
        console.warn('failed to generate thumbnail for file', file.id, err)
    }

    let droneMedia: DBType_DroneMedia
    try {
        droneMedia = await insertDroneMedia({
            drone_id: connection.last_drone_id!,
            type,
            fingerprint,
            tiny_fingerprint: tinyFingerprint,
            meta,
            file_id: file.id
        })

    } catch (err){
        //TODO delete file

        throw err
    }

    try {
        await deleteObject(bucketName, objectKey)
    } catch (err){
        console.error('failed to delete object after it was downloaded', err)
    }

    return droneMedia
}