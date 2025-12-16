import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_Dji_Pilot_2_Api_Media_Fast_Upload_Post, ApiType_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response, ApiType_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post, ApiType_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post_Response, ApiType_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post, ApiType_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post_Response, ApiType_Dji_Pilot_2_Api_Media_Upload_Callback_Post, ApiType_Dji_Pilot_2_Api_Media_Upload_Callback_Post_Response } from '../../../../generated-definitions/api/ApiTypes';
import { ApiSchema_Dji_Pilot_2_Api_Media_Fast_Upload_Post, ApiSchema_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response, ApiSchema_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post, ApiSchema_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post_Response, ApiSchema_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post, ApiSchema_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post_Response, ApiSchema_Dji_Pilot_2_Api_Media_Upload_Callback_Post, ApiSchema_Dji_Pilot_2_Api_Media_Upload_Callback_Post_Response } from '../../../../generated-definitions/api/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import {deleteObject, downloadObject, getBucketNameForConnectionId} from '../../../../s3-store'
import { DBType_Connection, DBType_Drone_Media, DBType_Drone_Media_TYPES, DBType_Drone_Media_TypeType } from '../../../../generated-definitions/db/DBTypes';
import { GuardError } from '../../../../ManInTheMiddleware';
import { delete_File, insert_Drone_Media, insert_File, select_Drone } from '../../../../generated-definitions/db/DBHelpers';
import {generateExifDataForFile, generateThumbnailForFile, getAbsoluteFilePathForFile, getFileExtension} from '../../../../util/file'
import { getDroneMetaFromFile } from '../../../../util/media';

const router = express.Router()


router.post('/fast-upload', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Media_Fast_Upload_Post>(ApiSchema_Dji_Pilot_2_Api_Media_Fast_Upload_Post)

    //TODO check if fingerprint is fine or if we need body.ext.tinny_fingerprint

    if(body.fingerprint.length === 0){
        throw GuardError._400_invalidBody('fingerprint')
    }

    const existingMedia = await db.oneOrNone<DBType_Drone_Media>('SELECT * FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.last_drone_id ' + pgp.as.format('WHERE fingerprint = ${fingerprint} AND connections.id = ${connectionId}', {
        fingerprint: body.fingerprint,
        connectionId: connection.id
    }))

    if(existingMedia){
        res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response>({
            code: 0,
            data: {},
            message: 'success'
        }, ApiSchema_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response)
    } else {
        res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response>({
            code: 404,
            data: {},
            message: 'no file with this fingerprint exists'
        }, ApiSchema_Dji_Pilot_2_Api_Media_Fast_Upload_Post_Response)
    }

}))

router.post('/files/tiny-fingerprints', asyncHandler(async (req, res) => {// this endpoint is used by m300 (not by mavic 3)

    const connection = await req.GM.getCurrentConnection()


    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post>(ApiSchema_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post)

    const existingTinyFingerprints = await db.manyOrNone<{tiny_fingerprint: string}>('SELECT tiny_fingerprint FROM drone_media INNER JOIN connections ON drone_media.drone_id = connections.last_drone_id ' + pgp.as.format('WHERE connections.id = ${connectionId}', {
        connectionId: connection.id
    }))

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post_Response>({
        code: 0,
        message: 'success',
        data: {
            tiny_fingerprints: existingTinyFingerprints.map(etf => etf.tiny_fingerprint)
        }
    }, ApiSchema_Dji_Pilot_2_Api_Media_Files_Tiny_Fingerprints_Post_Response)

}))

router.post('/upload-callback', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Media_Upload_Callback_Post>(ApiSchema_Dji_Pilot_2_Api_Media_Upload_Callback_Post)


    const mediaType: DBType_Drone_Media_TypeType = typeof body.sub_file_type === 'number' ? (body.sub_file_type === 1 ? DBType_Drone_Media_TYPES.panorama : DBType_Drone_Media_TYPES.picture) : DBType_Drone_Media_TYPES.video

    //TODO support differentiation between picture and panorama

    await addDroneMediaFromBucket(connection, getBucketNameForConnectionId(connection.id), body.object_key, mediaType, body.fingerprint, body.ext.tinny_fingerprint, JSON.stringify({ext: body.ext, metadata: body.metadata}))

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Media_Upload_Callback_Post_Response>({
        code: 0,
        message: 'success',
        data: {
            object_key: body.object_key
        }
    }, ApiSchema_Dji_Pilot_2_Api_Media_Upload_Callback_Post_Response)

}))

router.post('/group-upload-callback', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    const body = req.GM.guardBodySchema<ApiType_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post>(ApiSchema_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post)

    //TODO what do we need to implement here?
    console.log('group-upload-callback', body)

    res.GM.guardSend<ApiType_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post_Response>({
        code: 0,
        message: 'success',
        data: {}
    }, ApiSchema_Dji_Pilot_2_Api_Media_Group_Upload_Callback_Post_Response)
}))

export default router


async function addDroneMediaFromBucket(connection: DBType_Connection, bucketName: string, objectKey: string, type: DBType_Drone_Media_TypeType, fingerprint: string, tinyFingerprint: string, meta: string){

    const file = await insert_File({
        created_by: 0,
        workspace_id: connection.workspace_id,
        name: objectKey,
        ext: getFileExtension(objectKey)
    })

    try {
        await downloadObject(bucketName, objectKey, getAbsoluteFilePathForFile(file))
    } catch (err){

        try {
            await delete_File(file.id)
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

    try {
        await generateExifDataForFile(file.id)
    } catch (err){
        console.warn('failed to generateExifDataForFile', file.id, err)
    }


    const droneMeta = await getDroneMetaFromFile(file.id)

    let droneMedia: DBType_Drone_Media
    try {
        droneMedia = await insert_Drone_Media({
            drone_id: connection.last_drone_id!,
            type,
            fingerprint,
            tiny_fingerprint: tinyFingerprint,
            meta,
            file_id: file.id,
            captured_at: droneMeta === false ? undefined : droneMeta.createdAt,
            camera_location: droneMeta === false ? undefined : JSON.stringify({position: droneMeta.position, height: droneMeta.altitude}),
            camera_angles: droneMeta === false ? undefined : JSON.stringify({heading: droneMeta.gimbal.yaw, pitch: droneMeta.gimbal.pitch, roll: droneMeta.gimbal.roll}),
            flight_id: (await select_Drone(connection.last_drone_id!)).current_flight_id
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