import fs from 'fs'
import path from 'path'
import {deleteFile, insertFile, selectFile, updateFile} from '../db/DBHelpers'

import SecretsLoader from './SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['files_path'])

const THUMBNAILS_FOLDER = 'thumbnails'
const THUMBNAILS_EXT = 'jpg'
const THUMBNAIL_WIDTH = 300

const thumbnailsFolderPath = path.join(path.resolve(secrets.files_path), THUMBNAILS_FOLDER)
if(fs.existsSync(thumbnailsFolderPath) === false){
    fs.mkdirSync(thumbnailsFolderPath)
}

export async function getAbsoluteFilePathForFileId(fileId: number){
    const file = await selectFile(fileId)

    return getAbsoluteFilePathForFile(file)
}

export function getAbsoluteThumbnailPathForFileId(fileId: number){
    return path.join(path.resolve(secrets.files_path), THUMBNAILS_FOLDER, '' + fileId + '.' + THUMBNAILS_EXT)
}

export function getAbsoluteFilePathForFile(file: DBType_File){
    return path.join(path.resolve(secrets.files_path), '' + file.id + '.' + file.ext)
}

export function getAbsoluteThumbnailPathForFile(file: DBType_File){
    return getAbsoluteThumbnailPathForFileId(file.id)
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
    await deleteThumbnailIfExists(file.id)
}

export async function deleteFileIdFromDatabaseAndFilesystem(fileId: number){
    await fs.promises.rm(await getAbsoluteFilePathForFileId(fileId))
    await deleteFile(fileId)
    await deleteThumbnailIfExists(fileId)
}

async function deleteThumbnailIfExists(fileId: number){
    const thumbnailPath = getAbsoluteThumbnailPathForFileId(fileId)
    if(fs.promises.access(thumbnailPath), fs.constants.W_OK){
        await fs.promises.rm(thumbnailPath)
    }
}

import imageThumbnail from 'image-thumbnail'
export async function generateThumbnailForFile(fileId: number){
    const filePath = await getAbsoluteFilePathForFileId(fileId)

    const thumbnail = await imageThumbnail(filePath, {
        width: THUMBNAIL_WIDTH,
        jpegOptions: {
            force: true
        }
    })

    const thumbnailPath = await getAbsoluteThumbnailPathForFileId(fileId)

    const writeStream = fs.createWriteStream(thumbnailPath)
    writeStream.write(thumbnail)
    writeStream.close()

    await updateFile({
        has_thumbnail: true
    }, fileId)

    return thumbnailPath
}

export { multerMiddleware }
