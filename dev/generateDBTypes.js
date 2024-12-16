console.log('generate DB Types ...')

const { Parser, ModelExporter } = require('@dbml/core')
const fs = require('fs')
const path = require('path')

const deasync = require('deasync')

const dbmlPath = path.resolve('./../database/schema.dbml')

if(!fs.existsSync(dbmlPath)){
    console.error('missing dbml file at', dbmlPath)
    console.error('did you forget to clone the database repository next to the api-service repository?')
}

const dbmlString = fs.readFileSync(dbmlPath, {encoding: 'utf-8'})

const dbml = Parser.parse(dbmlString, 'dbml')


const tables = nonCircular(dbml).schemas[0].tables

const {compile} = require('json-schema-to-typescript')

let exportString = ''

for(const table of tables){
    if(table){
        let name = table.name

        if(name === ''){
            console.error(table)
            throw new Error('table.name is invalid: ' + name)
        }

        if(name.endsWith('s')){
            name = name.substring(0, name.length - 1)
        }

        const schema = {
            required: [],
            properties: {}
        }

        for(const field of table.fields){

            let comment

            const fieldString = dbmlString.substring(field.token.start.offset, field.token.end.offset)
            if(fieldString.indexOf('//') !== -1){
                comment = fieldString.substring(fieldString.indexOf('//') + 2).trim()
            }

            const noteStateDefinition = parseNoteStateDefinition(field.note)
            if(noteStateDefinition !== false){
                if(!schema.states){
                    schema.states = {}
                }
                schema.states[field.name] = noteStateDefinition
            }

            try {
                schema.properties[field.name] = {
                    type: convertDBMLTypeToJSONSchemaType(field.type.type_name),
                    description: comment || field.note || ''
                }

                if(field.not_null){
                    schema.required.push(field.name)
                }
            } catch (err){
                console.error('@ table', table.name, 'field', field.name, field)
                throw err
            }
        }

        exportString += compileSync(schema, name) + '\n\n'
    }
}


function parseNoteStateDefinition(note){
    if(typeof note !== 'string' || note.length === 0){
        return false
    }

    const validSyntax = note.match(/^(\s*(\d+)\s*\=\s*([^,]+),){0,}(\s*(\d+)\s*\=\s*([^,]+))$/)

    if(!validSyntax){
        return false
    }

    const parts = note.split(',')

    const states = []
    for(const p of parts){
        const match = p.match(/\s*(\d+)\s*\=\s*(.+)/)

        const state = parseInt(match[1])
        let name = match[2].replaceAll(/[^a-zA-Z0-9]/g, '_').replaceAll(/_+/g, '_')
        if(name.endsWith('_')){
            name = name.substring(0, name.length - 1)
        }

        states.push({
            name,
            state
        })
    }

    return states
}

const schemaPath = path.resolve('./src/db/DBTypes.ts')

if(!fs.existsSync(path.resolve('./src/definitions'))){
    fs.mkdirSync(path.resolve('./src/definitions'))
}

fs.writeFileSync(schemaPath, exportString, {
    encoding: 'utf-8'
})

console.log('  done (' + tables.length + ' types exported)')




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
    // by default prevent additionalProperties and items
    recursivelyPreventAdditional(schema)

    let res = undefined

    const name = 'DBType_' + camelcasify(schemaName)

    const schemaStates = schema.states
    if(schemaStates){
        delete schema.states
    }

    compile(schema, name, {
        bannerComment: ''
    }).then(type=>{
        const indexOfFirstCurly = type.indexOf('{')
        if(indexOfFirstCurly === -1){
            res = type
        } else {// force to export type and not interface, for nicer intellisense in vs code

            let typeString = 'export type ' + name + ' = ' + type.substring(indexOfFirstCurly)

            let preRes = ''

            if(schemaStates){
                for(const fieldName of Object.keys(schemaStates)){
                    const statesConstantName = name + '_' + fieldName.toUpperCase() + 'S'
                    const statesTypeName = name + '_' + camelcasify(fieldName) + 'Type'
                    preRes += 'export type ' + statesTypeName + ' = ' + schemaStates[fieldName].map(s => s.state).join('|') + '\n'
                    + 'export const ' + statesConstantName + ' = {\n  ' + schemaStates[fieldName].map(s => s.name + ': ' + s.state + ' as ' + statesTypeName).join(',\n  ') + '\n}\n'

                    typeString = typeString.replaceAll(' ' + fieldName + ': number', ' ' + fieldName + ': ' + statesTypeName)
                }
            }

            res = preRes + typeString
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

function nonCircular(obj){

    const knownObjets = []

    return JSON.parse(
        JSON.stringify(obj, (key, value)=>{
            if(key === 'database' || key === 'endpoints'){
                return null
            } else {
                for(let i = 0; i < knownObjets.length; i++){
                    if(knownObjets[i] == value){
                        return null
                    }
                }

                if(value instanceof Object){
                    knownObjets.push(value)
                }

                return value
            }
        })
    )
}

function convertDBMLTypeToJSONSchemaType(type){
    switch(type){
        case 'text': return 'string'

        case 'integer':
        case 'serial': return 'integer'

        case 'decimal':
        case 'numeric':
        case 'double': return 'number'

        case 'timestamp':
        case 'timestamptz':
        case 'timetz':
        case 'time': return 'string'

        case 'boolean': return 'boolean'

        case 'uuid': return 'string'

        case 'jsonb': return 'Record<string,any>'

        default: throw new Error('unsupported DBML type: ' + type)

    }
}
