import fs from 'fs'
import path from 'path'
import { deleteObject, uploadObject, downloadObject } from '../../s3-store'
import { randomUUID } from 'crypto'

const TEST_BUCKET_NAME = 'test'


test('upload and overwrite object', async()=>{

    const inputFile = path.resolve('./public/logo.png')

    const fileName = 'test_upload.png'

    await uploadObject(TEST_BUCKET_NAME, fileName, inputFile)
    await uploadObject(TEST_BUCKET_NAME, fileName, inputFile)

})

test('upload and delete object', async()=>{

    const inputFile = path.resolve('./public/logo.png')

    const fileName = 'test_upload.png'

    await uploadObject(TEST_BUCKET_NAME, fileName, inputFile)
    await deleteObject(TEST_BUCKET_NAME, fileName)

})

test('upload and delete object', async()=>{

    const inputFile = path.resolve('./public/logo.png')

    const TEST_OBJECT_KEY = 'test-object.png'

    await uploadObject(TEST_BUCKET_NAME, TEST_OBJECT_KEY, inputFile)

    await deleteObject(TEST_BUCKET_NAME, TEST_OBJECT_KEY)

})

test('upload, download and delete object', async()=>{

    const inputFile = path.resolve('./public/logo.png')

    const TEST_OBJECT_KEY = 'test-object.png'

    await uploadObject(TEST_BUCKET_NAME, TEST_OBJECT_KEY, inputFile)

    const outputFile = path.resolve('./dist', randomUUID() + '.png')

    await downloadObject(TEST_BUCKET_NAME, TEST_OBJECT_KEY, outputFile)

    await deleteObject(TEST_BUCKET_NAME, TEST_OBJECT_KEY)


    const fdInput = fs.openSync(inputFile, 'r')
    const statsInput =  fs.fstatSync(fdInput)

    const fdOutput = fs.openSync(outputFile, 'r')
    const statsOutput =  fs.fstatSync(fdOutput)

    expect(statsInput.size).toStrictEqual(statsOutput.size)

})
