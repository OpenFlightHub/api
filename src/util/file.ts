import fs from 'fs'
import path from 'path'
import {deleteFile, insertFile, selectFile} from '../db/DBHelpers'

import SecretsLoader from './SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['files_path'])

export async function getAbsoluteFilePathForFileId(fileId: number){
    const file = await selectFile(fileId)

    return getAbsoluteFilePathForFile(file)
}

export function getAbsoluteFilePathForFile(file: DBType_File){
    return path.join(path.resolve(secrets.files_path), '' + file.id + '.' + file.ext)
}

import multer from 'multer'
import { MulterFile } from '../app'
import { DBType_File } from '../db/DBTypes'
const multerMiddleware = multer({
    dest: path.resolve('tmp_files_multer')
})

export async function deleteTmpMulterFile(multerFile: MulterFile){
    await fs.promises.rm(multerFile.path)
}

export function getFileExtension(fileName: string){
    const lastDotIndex = fileName.lastIndexOf('.')
    const ext = lastDotIndex < 0 ? '' : fileName.substring(lastDotIndex + 1)

    return ext
}

export async function storeTmpMulterFileInDatabase(multerFile: MulterFile, workspaceId: number, createdBy: number){

    const file = await insertFile({
        name: multerFile.originalname,
        ext: getFileExtension(multerFile.originalname),
        created_by: createdBy,
        workspace_id: workspaceId
    })

    deleteTmpMulterFile(multerFile).catch(err => {
        console.warn('failed to delete tmp multer file', err)
    })

    return file
}

export async function deleteFileFromDatabaseAndFilesystem(file: DBType_File){
    await fs.promises.rm(getAbsoluteFilePathForFile(file))
    await deleteFile(file.id)
}

export async function deleteFileIdFromDatabaseAndFilesystem(fileId: number){
    await fs.promises.rm(await getAbsoluteFilePathForFileId(fileId))
    await deleteFile(fileId)
}

export { multerMiddleware }
