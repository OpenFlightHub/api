import ExifReader from 'exifreader'

export function getExifData(buffer: ArrayBuffer){
    return ExifReader.load(buffer, {
      async: true
    })
}