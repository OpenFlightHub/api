
console.log('generate api types ...')

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

const {compile} = require('json-schema-to-typescript')

let str = ''

for(const schemaName of Object.keys(api.components.schemas)){
    const schema = api.components.schemas[schemaName]

    let res = compileSync(schema, schemaName)

    str += res + '\n\n'
}


const schemaPath = path.resolve('./src/definitions/ApiTypes.ts')

if(!fs.existsSync(path.resolve('./src/definitions'))){
    fs.mkdirSync(path.resolve('./src/definitions'))
}

fs.writeFileSync(schemaPath, str, {
    encoding: 'utf-8'
})

console.log('  done (' + Object.keys(api.components.schemas).length + ' types exported)')




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

function compileSync(schema, schemaName){
    // by default prevent additionaProperties
    recursivelyPreventAdditional(schema)

    let res = undefined

    const name = 'ApiType_' + camelcasify(schemaName)

    compile(schema, name, {
        bannerComment: '',
        style: {
            tabWidth: 4
        }
    }).then(type=>{
        const indexOfFirstCurly = type.indexOf('{')
        if(indexOfFirstCurly === -1){
            res = type
        } else {// force to export type and not interface, for nicer intellisense in vs code
            res = 'export type ' + name + ' = ' + type.substring(indexOfFirstCurly)
        }
    })

    while(res === undefined){
        deasync.sleep(1)
    }

    return res
}

function recursivelyPreventAdditional(schema){
    if(!schema.type || schema.type === 'object'){
        if(schema.additionalProperties === undefined){
            schema.additionalProperties = false
        }

        if(schema.properties){
            for(const prop of Object.keys(schema.properties)){
                recursivelyPreventAdditional(schema.properties[prop])
            }
        }
    } else if(schema.type === 'array'){
        if(schema.additionalItems === undefined){
            schema.additionalItems = false
        }

        if(schema.items){
            recursivelyPreventAdditional(schema.items)
        }
    }
}
