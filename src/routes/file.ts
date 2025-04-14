import * as express from 'express';
import * as pgp from 'pg-promise'
import asyncHandler from 'express-async-handler'
const db : pgp.IDatabase<any> = global.db

import { selectFile } from '../db/DBHelpers';
import { ApiSchema_File } from '../definitions/ApiSchemas';
import { ApiType_File } from '../definitions/ApiTypes';
import { getAbsoluteFilePathForFile, getAbsoluteThumbnailPathForFile } from '../util/file';
import { GuardError } from '../ManInTheMiddleware';

const router = express.Router()

router.get('/:file_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const fileId = req.GM.guardParam('file_id', 'id')

    const file = await req.GM.guardDBGone(()=>{
        return selectFile(fileId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(file.workspace_id)

    res.GM.guardSend<ApiType_File>(file, ApiSchema_File)
}))

router.get('/data/:file_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const fileId = req.GM.guardParam('file_id', 'id')

    const file = await req.GM.guardDBGone(()=>{
        return selectFile(fileId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(file.workspace_id)

    res.appendHeader('Content-Disposition', `attachment; filename="${file.name}"`)

    try {
        res.sendFile(getAbsoluteFilePathForFile(file))
    } catch (err){
        console.error('error while sending file', err)
        res.status(500).send()
    }
}))


router.get('/thumbnail/:file_id', asyncHandler(async (req, res) => {

    await req.GM.guardUserIsAuthenticated()

    const fileId = req.GM.guardParam('file_id', 'id')

    const file = await req.GM.guardDBGone(()=>{
        return selectFile(fileId)
    })

    await req.GM.guardUserHasPermissionForWorkspace(file.workspace_id)

    if(file.has_thumbnail === false){
        throw GuardError._410_Gone('file has no thumbnail')
    }

    res.appendHeader('Content-Disposition', `attachment; filename="${file.name}"`)

    try {
        res.sendFile(getAbsoluteThumbnailPathForFile(file))
    } catch (err){
        console.error('error while sending thumbnail', err)
        res.status(500).send()
    }
}))


export default router
