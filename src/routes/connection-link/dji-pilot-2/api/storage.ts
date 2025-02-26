import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_DjiPilot2ApiMediaStsPostResponse } from '../../../../definitions/ApiTypes';
import { ApiSchema_DjiPilot2ApiMediaStsPostResponse } from '../../../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import {createTemporaryCredentialsForFileUpload} from '../../../../s3-store'
import SecretsLoader from '../../../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['minio_api_url', 'minio_host', 'minio_region', 'minio_bucket_dji_pilot_2_media'])

const router = express.Router()

router.post('/sts', asyncHandler(async (req, res) => {

    const connection = await req.GM.getCurrentConnection()

    // see https://min.io/docs/minio/linux/developers/security-token-service.html

    const credentials = await createTemporaryCredentialsForFileUpload(connection.id)

    res.GM.guardSend<ApiType_DjiPilot2ApiMediaStsPostResponse>({
        code: 0,
        data: {
            bucket: secrets.minio_bucket_dji_pilot_2_media,
            endpoint: secrets.minio_host,
            object_key_prefix: 'from_drone_',
            provider: 'minio',
            region: secrets.minio_region,
            credentials: {
                access_key_id: credentials.accessKey,
                access_key_secret: credentials.secretKey,
                security_token: credentials.token// TODO looks like when this is missing, dji calls the /sts endpoint quite often (so probably it is a required property?)
            }
        },
        message: 'success'
    }, ApiSchema_DjiPilot2ApiMediaStsPostResponse)

}))


export default router
