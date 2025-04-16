import dayjs from "dayjs";
import { selectFile, updateDroneMedia } from "../db/DBHelpers";
import { ApiType_Media, ApiType_MediaGroundCoverage } from "../definitions/ApiTypes";
import { getExifData } from "./exif";
import { getExifDataForFile } from "./file";
import { DBType_DroneMedia } from "../db/DBTypes";

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

export async function getMediaCoverage(media: DBType_DroneMedia){

    if(!media.coverage || media.coverage && dayjs(media.coverage_generated_at).isBefore(dayjs().subtract(90, 'days'))){//regenerate if older then 90 days
        return await fetchMediaCoverage(media)
    } else {

        return JSON.parse(media.coverage) as ApiType_MediaGroundCoverage
    }
}


export async function fetchMediaCoverage(media: DBType_DroneMedia){

    const meta = await getDroneMetaFromFile(media.file_id)

    if(meta === false){
        return false
    }

    const response = await fetch('http://localhost:6007/camera-ground-coverage', {
        body: JSON.stringify({
            longitude: meta.position.longitude,
            latitude: meta.position.latitude,
            altitude: meta.altitude - 50,//TODO remove this dirty geoid fix
            heading: meta.gimbal.yaw,
            pitch: meta.gimbal.pitch,
            fovVertical: meta.fov.angular.vertical,
            fovHorizontal: meta.fov.angular.horizontal
            //TODO implement camera roll?
        }),
        method: 'post',
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })

    if(('' + response.status).startsWith('2') === false){
        throw new Error(response.statusText + ': ' + await response.text())
    }

    const responseJson = await response.text()
    const obj = JSON.parse(responseJson)

    try {
        await updateDroneMedia({
            coverage: responseJson,
            coverage_generated_at: new Date().toISOString()
        }, media.id)
    } catch (err){
        console.error('failed to update coverage of drone_media', err)
    }

    return obj as ApiType_MediaGroundCoverage
}


export async function getDroneMetaFromFile(fileId: number){

    const exifData = await getExifDataForFile(fileId)

    if(exifData === false){
        return false
    } else {
        return getMetaFromExifData(exifData)
    }
}

export async function getMetaFromExifData(exifData: ExifData): Promise<ImageMeta> {

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
