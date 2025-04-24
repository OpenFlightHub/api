import ExifReader from 'exifreader'

export function getExifData(buffer: ArrayBuffer){
    return ExifReader.load(buffer, {
        async: true
    })
}


/**
 * @param str format: '2000:08:04 18:22:57'
 * @returns ISO Date string without timezone
 */
export function parseExifTimestamp(str?: string): string | undefined {
    if(typeof str !== 'string'){
        return
    }

    const match = str.match(/\s*(\d\d\d\d):(\d\d):(\d\d)\s+(\d\d):(\d\d):(\d\d)\s*/)

    if(!match){
        return
    }

    return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`
}
