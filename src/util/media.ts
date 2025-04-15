import { getExifData } from "./exif";

type ExifData = Awaited<ReturnType<typeof getExifData>>

export type MediaMeta = {
    position?: {
        longitude: number
        latitude: number
    }
    height: number
    thumbnail: File
}

export type ImageMeta = {
    position?: {
        longitude: number
        latitude: number
    }
    altitude?: number
    fov?: FOV
    createdAt?: string //ISO
    gimbal: {
        pitch?: number
        yaw?: number
        roll?: number
    }
}

export async function getMetaFromImage(fileOrBuffer: File | Blob | ArrayBuffer): Promise<ImageMeta> {

    let exifData: ExifData

    if(fileOrBuffer instanceof Blob || fileOrBuffer instanceof File){
        exifData = await getExifData(await fileOrBuffer.arrayBuffer())
    } else if (fileOrBuffer instanceof Buffer){
        exifData = await getExifData(fileOrBuffer)
    }


    const gpsParsed = parseExifGps(exifData)

    const fovParsed = parseExifFOV(exifData)

    const gimbalParsed = parseExifGimbal(exifData)

    const createDateIso = exifData["CreateDate"]?.description

    return {
        position: gpsParsed === false ? undefined : gpsParsed.position,
        altitude: gpsParsed === false ? undefined : gpsParsed.altitude,
        fov: fovParsed === false ? undefined : fovParsed,
        createdAt: typeof createDateIso === 'undefined' ? undefined : createDateIso,
        gimbal: gimbalParsed
    }
}

// see https://exiv2.org/tags.html
function parseExifGps(exif: ExifData){
    const gpsLon = parseFloat('' + exif.GPSLongitude.description)
    const gpsLat = parseFloat('' + exif.GPSLatitude.description)

    const gpsAltitude = parseFloat('' + exif.GPSAltitude.description)

    if(isNaN(gpsLon)){
        return false
    }

    if(isNaN(gpsLat)){
        return false
    }

    return {
        position: {
            longitude: gpsLon,
            latitude: gpsLat,
        },
        altitude: (exif.GPSAltitudeRef?.value !== 1) ? gpsAltitude : undefined
    }
}

export type FOV = {
    angular: {
        horizontal: number
        vertical: number
    }
}

function parseExifFOV(exif: ExifData): false | FOV {
    // see https://www.bobatkins.com/photography/technical/field_of_view.html

    const focalLength = parseFloat('' + exif.FocalLengthIn35mmFilm.value)


    if(isNaN(focalLength)){
        return false
    }

    return {
        angular: {
            horizontal: getFovRectilinear(36, focalLength),
            vertical: getFovRectilinear(24, focalLength)
        }

    }
}

/**
 *
 * @returns angular fov in degrees
 */
function getFovRectilinear(frameSize: number, focalLength: number){
    return toDegrees(2 * Math.atan(frameSize / (focalLength * 2)))
}

/**
  * @param str format: '2000:08:04 18:22:57'
  * returns ISO Date string
 */
function parseExifTimestamp(str?: string){
    if(typeof str !== 'string'){
        return false
    }

    const match = str.match(/\s*(\d\d\d\d):(\d\d):(\d\d)\s+(\d\d):(\d\d):(\d\d)\s*/)

    if(!match){
        return false
    }

    return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`
}

/**
  * @param str format: '2000:08:04 18:22:57'
  * returns ISO Date string
 */
function parseExifGimbal(exif: ExifData){

    const gimbalPitch = parseFloat('' + exif.GimbalPitchDegree.value)
    const gimbalYaw = parseFloat('' + exif.GimbalYawDegree.value)
    const gimbalRoll = parseFloat('' + exif.GimbalRollDegree.value)

    return {
        pitch: isNaN(gimbalPitch) ? undefined : gimbalPitch,
        yaw: isNaN(gimbalYaw) ? undefined : gimbalYaw,
        roll: isNaN(gimbalRoll) ? undefined : gimbalRoll
    }
}

function toDegrees(rad: number){
    return rad / (Math.PI/180)
}
