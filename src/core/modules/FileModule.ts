
import { DBInsert_File, DBUpdate_File, delete_File, insert_File, select_File, update_File } from '../../generated-definitions/db/DBHelpers'
import {DBType_File} from '../../generated-definitions/db/DBTypes'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'
import safeJsonStringify from 'safe-json-stringify'
import fs from 'fs'
import path from 'path'
import imageThumbnail from 'image-thumbnail'
import { readFile } from 'fs/promises'
import { getExifData } from '../../util/exif'
import { Tags } from 'exifreader'
import { getFileExtension } from '../../util/file'
import { Waitable } from '../../util/waitable'

import SecretsLoader from '../../util/SecretsLoader'
const secretsLoader = new SecretsLoader('secrets.json')
const secrets = secretsLoader.getSecrets(['files_path'])

const THUMBNAILS_FOLDER = 'thumbnails'
const THUMBNAILS_EXT = 'jpg'
const THUMBNAIL_WIDTH = 300


import pgp from 'pg-promise'
import { downloadObject } from '../../s3-store'
import { assignObject } from '../../util/typescript'
import { MulterFile } from '../../app'
const db : pgp.IDatabase<any> = global.db


export default class FileModule extends Module_Base<
    {
        workspaceId: number,
        id: number
    },

    {
        create_file: {
            eventDataType: DBType_File,
            availableContexts: 'workspaceId' | 'id'
        },
        update_file: {
            eventDataType: DBType_File,
            availableContexts: 'workspaceId' | 'id'
        },
        delete_file: {
            eventDataType: DBType_File,
            availableContexts: 'workspaceId' | 'id'
        }
    }
> {

    constructor(){
        super()

        const thumbnailsFolderPath = path.join(path.resolve(secrets.files_path), THUMBNAILS_FOLDER)
        if(fs.existsSync(thumbnailsFolderPath) === false){
            fs.mkdirSync(thumbnailsFolderPath)
        }

        this.checkForMissingThumbnails()
    }

    /**
     *
     * @param waitUntil see util/waitable.ts
     */
    private async createFile(data: DBInsert_File, waitUntil?: Waitable){
        const file = await insert_File(data)



        const after = async ()=>{
            try {
                await this.generateExifDataForFile(file.id)
            } catch (err){
                console.warn('failed to generateExifDataForFile', file.id, err)
            }

            try {
                await this.generateThumbnailForFile(file.id)
            } catch (err){
                console.warn('failed to generate thumbnail for file', file.id, err)
            }

            this.dispatch('create_file', {
                id: file.id,
                workspaceId: file.workspace_id
            }, file)
        }

        if(waitUntil){
            setTimeout(async()=>{
                await waitUntil.getPromise()//TODO check if this code works

                await after()
            }, 1)
        } else {
            await after()
        }

        return file
    }

    /**
     *
     * @returns false if does not exist
     * @see updateFileSafe
     */
    async updateFile(id: number, data: DBUpdate_File){
        const file = await update_File(id, data)

        if(file === false){
            return false
        }

        this.dispatch('update_file', {
            id: file.id,
            workspaceId: file.workspace_id
        }, file)

        return file
    }

    /**
     *
     * @see updateFile
     */
    updateFileSafe = makeFunctionIdSafe(this, this.updateFile)

    /**
     *
     * @returns false if does not exist
     * @see deleteFileSafe
     */
    async deleteFile(id: number){
        const file = await delete_File(id)

        if(file === false){
            return false
        }

        this.dispatch('delete_file', {
            id: file.id,
            workspaceId: file.workspace_id
        }, file)

        await this.deleteFileIfExists(this.getAbsoluteFilePathForFile(file))

        await this.deleteThumbnailIfExists(file.id)
    }

    /**
     *
     * @see deleteFile
     */
    deleteFileSafe = makeFunctionIdSafe(this, this.deleteFile)

    /**
     *
     * @returns false if does not exist
     * @see getFileSafe
     */
    async getFile(id: number){
        return await select_File(id)
    }

    /**
     *
     * @see getFile
     */
    getFileSafe = makeFunctionIdSafe(this, this.getFile)

    async createFileFromBucketObject(file: Omit<DBInsert_File, 'name'>, bucketName: string, objectKey: string){

        const waitable = await Waitable.make()

        const theFile = await this.createFile(assignObject(file, {
            name: objectKey
        }), waitable)

        try {
            await downloadObject(bucketName, objectKey, this.getAbsoluteFilePathForFile(theFile))
        } catch (err){

            try {
                await this.deleteFile(theFile.id)
            } catch (err){
                console.error('failed to cleanup file after downloading did not work', err)
            }

            throw err
        }

        waitable.finish()

        return theFile
    }

    async getAbsoluteFilePathForFileId(fileId: number){
        const file = await this.getFileSafe(fileId)
        return this.getAbsoluteFilePathForFile(file)
    }

    getAbsoluteFilePathForFile(file: DBType_File){
        return path.join(path.resolve(secrets.files_path), '' + file.id + '.' + file.ext)
    }

    getAbsoluteThumbnailPathForFileId(fileId: number){
        return path.join(path.resolve(secrets.files_path), THUMBNAILS_FOLDER, '' + fileId + '.' + THUMBNAILS_EXT)
    }

    private async checkForMissingThumbnails(){
        try {
            const filesThatRequireThumbnails = await db.manyOrNone('SELECT * FROM files WHERE has_thumbnail = false AND thumbnail_generation_has_failed = false AND LOWER(ext) in(' + (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].map(m => '\'' + m + '\'').join(',')) + ');')

            for(const file of filesThatRequireThumbnails){
                const upToDateFile = await this.getFileSafe(file.id)
                if(upToDateFile.has_thumbnail || upToDateFile.thumbnail_generation_has_failed){
                    continue
                }

                console.log('generate missing thumbnail for file', file.id)
                await this.generateThumbnailForFile(file.id)
            }

        } catch (err){
            console.warn('error while checkForMissingThumbnails', err)
        }

        setTimeout(()=>{
            this.checkForMissingThumbnails()
        }, 1000 * 60)
    }





    /**
     * generates a thumbnail for this file, and updates the file database entry. If it fails to generate one, the file database entry is marked as "generation_failed" and after that an error is thrown
     */
    private async generateThumbnailForFile(fileId: number){
        const filePath = await this.getAbsoluteFilePathForFileId(fileId)

        let thumbnailBuffer: any
        try {
            thumbnailBuffer = await imageThumbnail(filePath, {
                width: THUMBNAIL_WIDTH,
                jpegOptions: {
                    force: true
                }
            })
        } catch (err){
            try {
                await this.updateFile(fileId, {
                    thumbnail_generation_has_failed: true
                })
            } catch (err){
                console.error('failed to mark thumbnail_generation_has_failed', err)
            }

            throw err
        }

        const thumbnailPath = this.getAbsoluteThumbnailPathForFileId(fileId)

        const writeStream = fs.createWriteStream(thumbnailPath)
        writeStream.write(thumbnailBuffer)
        writeStream.close()

        await this.updateFile(fileId, {
            has_thumbnail: true
        })

        return thumbnailPath
    }


    private async deleteTmpMulterFile(multerFile: MulterFile){
        await fs.promises.rm(multerFile.path)
    }

    async storeTmpMulterFileInDatabase(multerFile: MulterFile, workspaceId: number, createdBy: number){

        const file = await this.createFile({
            name: multerFile.originalname,
            ext: getFileExtension(multerFile.originalname),
            created_by: createdBy,
            workspace_id: workspaceId
        })

        this.deleteTmpMulterFile(multerFile).catch(err => {
            console.warn('failed to delete tmp multer file', err)
        })

        return file
    }

    private async deleteFileIfExists(filePath: string){
        if(fs.promises.access(filePath), fs.constants.W_OK){
            await fs.promises.rm(filePath)
        }
    }

    private async deleteThumbnailIfExists(fileId: number){
        await this.deleteFileIfExists(this.getAbsoluteThumbnailPathForFileId(fileId))
    }

    /**
     * generates the exif data for this file, and updates the file database entry.
     */
    private async generateExifDataForFile(fileId: number){
        const filePath = await this.getAbsoluteFilePathForFileId(fileId)

        const buf = await readFile(filePath)

        //@ts-ignore
        const exifData = await getExifData(buf)

        try {

            const clean = {}
            for(const key of Object.keys(exifData)){

                if(key === 'Images' || key === 'Thumbnail'){
                    continue //skip to safe storage space
                }

                const safeJSON = safeJsonStringify(exifData[key]) as string

                if(safeJSON.length > 100000 && ['MakerNote'].includes(key) === false){
                    console.log('removed key', key, safeJSON.length)
                } else {
                    clean[key] = JSON.parse(safeJSON)
                }
            }

            const cleanJson = JSON.stringify(clean)

            const len = cleanJson.length

            await this.updateFile(fileId, {
                exif_data: cleanJson
            })
        } catch (err){

            try {
                await this.updateFile(fileId, {
                    exif_data_generation_has_failed: true
                })
            } catch (err){
                console.error('failed to mark exif_data_generation_has_failed', err)
            }

            throw err
        }

        return exifData
    }

    async getExifDataForFile(fileId: number){
        const file = await this.getFileSafe(fileId)

        if(file.exif_data){
            return JSON.parse(file.exif_data) as Tags
        } else {
            if(file.exif_data_generation_has_failed){
                return false
            } else {
                try {
                    return await this.generateExifDataForFile(fileId)
                } catch (err){
                    return false
                }
            }
        }
    }

}
