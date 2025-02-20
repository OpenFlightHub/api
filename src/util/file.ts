import fs from 'fs'
import path from 'path'
import {deleteFile, insertFile, selectFile} from '../db/DBHelpers'

export async function getAbsoluteFilePathForFileId(fileId: number){
    const file = await selectFile(fileId)

    return getAbsoluteFilePathForFile(file)
}

export function getAbsoluteFilePathForFileIdAnName(fileId: number, fileName: string){
    const ext = path.extname(fileName)

    return '' + fileId + '.' + ext
}

export function getAbsoluteFilePathForFile(file: DBType_File){
    return getAbsoluteFilePathForFileIdAnName(file.id, file.name)
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

export async function storeTmpMulterFileInDatabase(multerFile: MulterFile, workspaceId: number, createdBy: number){

    const file = await insertFile({
        name: multerFile.originalname,
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
