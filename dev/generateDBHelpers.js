console.log('generate DB Helpers ...')//TODO refactor to generate DBInsert and DBUpdate in the generateDBTypes.js file, so its all in one place

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

const tableDefinitions = {}


for(const table of tables){
    if(table){
        let tableName = table.name

        if(tableName === ''){
            console.error(table)
            throw new Error('table.name is invalid: ' + tableName)
        }

        const columns = []
        const insertTypes = []
        const updateTypes = []
        const typesToImport = []

        for(const field of table.fields){

            const isXAutomatic = field.note === 'x-automatic'

            if(isXAutomatic){
                //skip
                continue
            }

            const isSequence = field.type.type_name === 'serial'

            const isOptional = field.not_null !== true || field.dbdefault

            const name = field.name

            const col = {
                name
            }

            if(isSequence){
                col.cnd = true
            } else {
                if(isOptional){
                    col.skip = '$COLERA$'
                }
            }

            columns.push(col)

            if(!isSequence){

                let type

                if(noteIsValidStateDefinition(field.note)){
                    type = 'DBType_' + normalizeTableName(tableName) + '_' + camelcasify(field.name) + 'Type'
                    typesToImport.push(type)
                } else {
                    type = convertDBMLTypeToTypescriptType(field.type.type_name)
                }

                insertTypes.push(name + ((isSequence || isOptional) ? '?' : '') + ': ' + type)
                updateTypes.push(name + '?: ' + type)
            }

        }

        tableDefinitions[tableName] = {
            columns,
            insertTypes,
            updateTypes,
            typesToImport
        }
    }
}



function noteIsValidStateDefinition(note){
    if(typeof note !== 'string' || note.length === 0){
        return false
    }

    const validSyntax = note.match(/^(\s*(\d+)\s*\=\s*([^,]+),){0,}(\s*(\d+)\s*\=\s*([^,]+))$/)

    if(!validSyntax){
        return false
    }

    return true
}

const outputPath = path.resolve('./src/db/DBHelpers.ts')

if(!fs.existsSync(path.resolve('./src/db'))){
    fs.mkdirSync(path.resolve('./src/db'))
}

let exportString = `import * as pgp from 'pg-promise'
const db : pgp.IDatabase<any> = global.db\n\n`

for(const tableName of Object.keys(tableDefinitions)){

    const tableDefinition = tableDefinitions[tableName]

    exportString += '\n\n\n//' + tableName

    let dbTypeName = normalizeTableName(tableName)
    if(tableDefinition.typesToImport){
        exportString += '\n\nimport {' + tableDefinition.typesToImport.join(', ') + '} from "./DBTypes";'
    }
    exportString += '\n\nexport type DBInsert_' + dbTypeName + ' = {\n' + tableDefinition.insertTypes.map(v => '    ' + v).join('\n') + '\n}'
    exportString += '\n\nexport type DBUpdate_' + dbTypeName + ' = {\n' + tableDefinition.updateTypes.map(v => '    ' + v).join('\n') + '\n}'

    const columSetName = 'COLUMN_SET_' + tableName.toUpperCase()
    const columSetNameUpdate = columSetName + '_UPDATE'

    exportString += '\nconst ' + columSetName + ' = new db.$config.pgp.helpers.ColumnSet(' + JSON.stringify(tableDefinitions[tableName].columns, null, 4).replace(/"\$COLERA\$"/g, 'col => !col.exists') + ', {table: "' + tableName + '"})\n'

    exportString += '\nconst ' + columSetNameUpdate + ' = new db.$config.pgp.helpers.ColumnSet(' + JSON.stringify(tableDefinitions[tableName].columns.map(col => {
        return {name: col.name, skip: '$COLERA$'}
    }), null, 4).replace(/"\$COLERA\$"/g, 'col => !col.exists') + ', {table: "' + tableName + '"})'

    exportString += `\nimport {DBType_${dbTypeName}} from './DBTypes'\n`

    exportString += `\n
export function insert${normalizeTableName(tableName)}(values: DBInsert_${dbTypeName}){
    return db.one<DBType_${dbTypeName}>(db.$config.pgp.helpers.insert(values, undefined, '${tableName}') + ' RETURNING *')
}`

    exportString += `\n\n/**
 @param idOrWhereCondition is either a single id or a where clause which shall be generated with pgp.as.format() e.g. pgp.as.format('WHERE id = \${id}', {id: 42})
*/
export function update${normalizeTableName(tableName)}<T extends number | string>(values: DBUpdate_${dbTypeName}, idOrWhereCondition: T): T extends number ? Promise<DBType_${dbTypeName}> : Promise<DBType_${dbTypeName}[]>{
    if(typeof idOrWhereCondition === 'number'){
        const id = idOrWhereCondition as number
        //@ts-ignore
        return db.one<DBType${dbTypeName}>(db.$config.pgp.helpers.update(values,  ${columSetNameUpdate}) + ' WHERE id = ' + id + ' RETURNING *')
    } else {
        let whereCondition = idOrWhereCondition as string
        whereCondition = whereCondition.trim()
        if(whereCondition.endsWith(';')){
            whereCondition = whereCondition.substring(0, whereCondition.length - 1)
        }

        //@ts-ignore
        return db.manyOrNone<DBType_${dbTypeName}>(db.$config.pgp.helpers.update(values,  ${columSetNameUpdate}) + ' ' + whereCondition + ' RETURNING *')
    }
}

export function delete${normalizeTableName(tableName)}(id: number){
    return db.none('DELETE FROM ${tableName} WHERE id = \${id}', {id})
}

`

if(tableDefinition.columns.find(el => el.name === 'id')){

    exportString += `\n\n
export function select${normalizeTableName(tableName)}(id: number){
    return db.one<DBType_${dbTypeName}>('SELECT * FROM ${tableName} ' + pgp.as.format('WHERE id = \${id}', {id}))
}`
}

}

fs.writeFileSync(outputPath, exportString, {
    encoding: 'utf-8'
})

console.log('  done helpers for (' + tables.length + ' tables exported)')


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

function normalizeTableName(tableName){
    let normed = camelcasify(tableName)
    if(normed.endsWith('s')){
        normed = normed.substring(0, normed.length - 1)
    }

    return normed
}



function convertDBMLTypeToTypescriptType(type){
    switch(type){
        case 'text': return 'string'

        case 'integer':
        case 'serial':
        case 'decimal':
        case 'numeric':
        case 'double': return 'number'

        case 'timestamp':
        case 'timestamptz':
        case 'timetz':
        case 'time': return 'string'

        case 'boolean': return 'boolean'

        case 'uuid': return 'string'

        default: throw new Error('unsupported DBML type: ' + type)

    }
}
