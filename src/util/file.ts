import path from 'path'
import {selectFile} from '../db/DBHelpers'

export async function getAbsoluteFilePathForFile(fileId: number){
    const file = await selectFile(fileId)

    return getAbsoluteFilePathForFileIdAnName(file.id, file.name)
}

export function getAbsoluteFilePathForFileIdAnName(fileId: number, fileName: string){
    const ext = path.extname(fileName)

    return '' + fileId + '.' + ext
}
