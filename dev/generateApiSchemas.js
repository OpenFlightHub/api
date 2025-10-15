
console.log('generate api schemas ...')

const OpenApiParser = require('@readme/openapi-parser')
const fs = require('fs')
const path = require('path')

let api = undefined

const deasync = require('deasync')
OpenApiParser.dereference('./openapi_spec.yaml').then(res => {

    // delete all x- node properties
    recursivelyWalkSchema(res, entry => {
        if(entry instanceof Object && entry instanceof Array === false){
            for(const key of Object.keys(entry)){
                if(key.startsWith('x-')){
                    delete entry[key]
                }
            }
        }
    })

    // combine allOf schemas (otherwise it leads to bugs with ajv)
    recursivelyWalkSchema(res, entry => {
        if(entry instanceof Object && entry instanceof Array === false){
            if(entry['allOf']){

                const combinedType = {}

                for(const subSchema of entry['allOf']){
                    for(const jsonSchemaKey of Object.keys(subSchema)){
                        if(jsonSchemaKey === 'required'){
                            if(typeof combinedType['required'] === 'undefined'){
                                combinedType['required'] = []
                            }

                            for(const requiredEntry of subSchema[jsonSchemaKey]){
                                if(combinedType['required'].includes(requiredEntry) === false){
                                    combinedType['required'].push(requiredEntry)
                                }
                            }
                        } else if (jsonSchemaKey === 'properties'){
                            if(typeof combinedType['properties'] === 'undefined'){
                                combinedType['properties'] = {}
                            }

                            for(const propertyName of Object.keys(subSchema[jsonSchemaKey])){
                                combinedType['properties'][propertyName] = subSchema[jsonSchemaKey][propertyName]
                            }
                        } else if(typeof combinedType[jsonSchemaKey] === 'undefined'){
                            combinedType[jsonSchemaKey] = subSchema[jsonSchemaKey]
                        }
                    }
                }

                delete entry['allOf']

                Object.assign(entry, combinedType)
            }
        }
    })

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


function recursivelyWalkSchema(schema, callback){

    callback(schema)

    if(schema instanceof Array){
        for(const s of schema){
            recursivelyWalkSchema(s, callback)
        }
    } else if(schema instanceof Object){
        for(const k of Object.keys(schema)){
            recursivelyWalkSchema(schema[k], callback)
        }
    }
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