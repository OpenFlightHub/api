import {ExifImage} from 'exif'

export async function getExifData(buffer: ArrayBuffer){
    return new Promise<ExifData>((resolve, reject)=>{

        new ExifImage({image: buffer}, (err, exifData)=>{
            if(err){
                reject(err)
            } else {
                resolve(exifData)
            }
        })
    })
}

export type ExifData = Partial<{
    image: Partial<{
      Make: string,
      Model: string,
      Orientation: number,
      XResolution: number,
      YResolution: number,
      ResolutionUnit: number,
      Software: string,
      ModifyDate: string, // '2000:08:04 18:22:57'
      YCbCrPositioning: number,
      Copyright: string,
      ExifOffset: number
    }>,
    thumbnail: Partial<{
      Compression: number,
      Orientation: number,
      XResolution: number,
      YResolution: number,
      ResolutionUnit: number,
      ThumbnailOffset: number,
      ThumbnailLength: number,
      YCbCrPositioning: number
    }>,
    exif: Partial<{
      FNumber: number,
      ExposureProgram: number,
      ISO: number,
      ExifVersion: Buffer
      DateTimeOriginal: '2000:08:04 18:22:57',
      CreateDate: '2000:08:04 18:22:57',
      ComponentsConfiguration: Buffer,
      CompressedBitsPerPixel: number,
      ShutterSpeedValue: number,
      ApertureValue: number,
      BrightnessValue: number,
      ExposureCompensation: number,
      MaxApertureValue: number,
      MeteringMode: number,
      Flash: number,
      FocalLength: number,
      FocalLengthIn35mmFormat: number
      MakerNote: Buffer,
      FlashpixVersion: Buffer,
      ColorSpace: number,
      ExifImageWidth: number,
      ExifImageHeight: number,
      InteropOffset: number,
      FocalPlaneXResolution: number,
      FocalPlaneYResolution: number,
      FocalPlaneResolutionUnit: number,
      SensingMethod: number,
      FileSource: Buffer,
      SceneType: Buffer
    }>,
    gps: Partial<{
        GPSVersionID: [
            2,
            3,
            0,
            0,
          ],
          GPSLatitudeRef: "N",
          GPSLatitude: [
            47,
            33,
            40.6945,
          ],
          GPSLongitudeRef: "E",
          GPSLongitude: [
            10,
            13,
            36.3226,
          ],
          GPSAltitudeRef: 0,
          GPSAltitude: 795.015,
          GPSStatus: "A",
          GPSMapDatum: "WGS-84\u0000",
    }>,
    interoperability: Partial<{
      InteropIndex: string,
      InteropVersion: Buffer
    }>,
    makernote: Partial<{
      Version: Buffer,
      Quality: string,
      Sharpness: number,
      WhiteBalance: number,
      FujiFlashMode: number,
      FlashExposureComp: number,
      Macro: number,
      FocusMode: number,
      SlowSync: number,
      AutoBracketing: number,
      BlurWarning: number,
      FocusWarning: number,
      ExposureWarning: number
    }>
}>