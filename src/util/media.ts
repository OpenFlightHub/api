import { ExifData, getExifData } from "./exif";
import turf from '@turf/turf'

export type MediaMeta = {
    position?: {
        longitude: number
        latitude: number
    }
    height: number
    thumbnail: File
}

export async function getMetaFromImage(fileOrBuffer: File | Blob | ArrayBuffer){

    let exifData: ExifData

    if(fileOrBuffer instanceof Blob || fileOrBuffer instanceof File){
        exifData = await getExifData(await fileOrBuffer.arrayBuffer())
    } else if (fileOrBuffer instanceof Buffer){
        exifData = await getExifData(fileOrBuffer)
    }


    const gpsParsed = parseExifGps(exifData.gps)

    return {
        position: gpsParsed === false ? undefined : gpsParsed.position,
        altitude: gpsParsed === false ? undefined : gpsParsed.altitude,
        focalLength: exifData.exif?.FocalLength,
        focalLengthIn35mmFormat: exifData.exif?.FocalLengthIn35mmFormat,
        createdAt: exifData.exif?.CreateDate
    }
}
// see https://exiv2.org/tags.html
function parseExifGps(gps: any){
    const gpsLon = gps.GPSLongitude
    const gpsLat = gps.GPSLatitude

    //TODO support the GPSLongitudeRef and other gps map datum

    if(gpsLon instanceof Array === false || gpsLat instanceof Array === false || gps.GPSLatitudeRef !== 'N' || gps.GPSLongitudeRef !== 'E'){
        return false
    }

    //TODO are those fields always an array of [degree, minutes, seconds]?

    return {
        position: {
            longitude: gpsLon[0] + (typeof gpsLon[1] === 'number' ? gpsLon[1]/60 : 0) + (typeof gpsLon[2] === 'number' ? gpsLon[2]/3600 : 0),
            latitude: gpsLat[0] + (typeof gpsLat[1] === 'number' ? gpsLat[1]/60 : 0) + (typeof gpsLat[2] === 'number' ? gpsLat[2]/3600 : 0),
        },
        altitude: (typeof gps.GPSAltitude === 'number' && gps.GPSAltitudeRef !== 1) ? gps.GPSAltitude : undefined
    }
}
