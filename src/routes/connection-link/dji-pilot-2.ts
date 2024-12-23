import express from 'express';
import asyncHandler from 'express-async-handler'
import pgp from 'pg-promise'
import { ApiType_ConnectionLinkDjiPilot2SdkConfig } from '../../definitions/ApiTypes';
import { ApiSchema_ConnectionLinkDjiPilot2SdkConfig } from '../../definitions/ApiSchemas';
const db : pgp.IDatabase<any> = global.db

import SecretsLoader from '../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets([
    'dji_cloud_app_id', 'dji_cloud_app_key', 'dji_cloud_app_license', 'platform_url', 'mqtt_port', 'rtmp_url'])

const router = express.Router()

if(('' + secrets.platform_url).indexOf(':') >= 0){
    throw new Error('platform_url must not contain a port!')
}

router.get('/sdk-config', asyncHandler(async (req, res) => {

    req.GM.guardSend<ApiType_ConnectionLinkDjiPilot2SdkConfig>({
        app_id: secrets.dji_cloud_app_id,
        app_key: secrets.dji_cloud_app_key,
        app_license: secrets.dji_cloud_app_license,
        mqtt_url: secrets.platform_url + ':' + secrets.mqtt_port,
        rtmp_url:secrets.rtmp_url
    }, ApiSchema_ConnectionLinkDjiPilot2SdkConfig)

}))

export default router
