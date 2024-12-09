
console.log('generate api schemas ...')

const OpenApiParser = require('@readme/openapi-parser')
const fs = require('fs')
const path = require('path')

let api = undefined

const deasync = require('deasync')
OpenApiParser.dereference('./openapi_spec.yaml').then(res => {
    api = res
}).catch(error => {
    console.error('Error loading api spec', error)
    process.exit(1)
})

while(api === undefined) {
    deasync.sleep(100)
}

let str = 'import {JSONSchema} from \'json-schema-to-typescript\'\n\n'

for(const schemaName of Object.keys(api.components.schemas)){
    const schema = api.components.schemas[schemaName]

    delete schema['x-internal']

    str += `export const ${'ApiSchema_' + camelcasify(schemaName) + ' : JSONSchema '} = ` + JSON.stringify(schema, null, 4) + '\n\n'
}



const schemaPath = path.resolve('./src/definitions/ApiSchemas.ts')

if(!fs.existsSync(path.resolve('./src/definitions'))){
    fs.mkdirSync(path.resolve('./src/definitions'), {
        recursive: true
    })
}

fs.writeFileSync(schemaPath, str, {
    encoding: 'utf-8'
})


console.log('  done (' + Object.keys(api.components.schemas).length + ' schemas exported)')



function camelcasify(val){
    const lowerCase = val.toLowerCase()

    const words = lowerCase.replace(/[^a-zA-Z0-9]/g, '_').split('_').filter(val => val !== '')

    const ret = words.map((val, index) => {
        return val.substring(0, 1).toUpperCase() + val.substring(1)
    }).join('')

    if(ret === ''){
        throw new Error('camelcasify failed for "' + val + '"')
    }

    return ret
}