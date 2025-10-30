import Ajv from 'ajv'
import {JSONSchema4} from './types/JSONSchema'

const ajv = new Ajv({removeAdditional: 'all', strictTypes: false})
ajv.addKeyword('example')// this comes from openapi spec
ajv.addFormat('uuid', /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)
ajv.addFormat('time', /^(2[0-3]|[01][0-9]):?([0-5][0-9]):?([0-5][0-9])$/)
ajv.addFormat('timestamptz', /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/)
ajv.addFormat('binary', /.*/)

/**
 * returns a copy of an object, with all properties/items removed that are not defined in the schema. It will also remove all properties with value null. wWll throw FilterError if obj is not valid according to schema
 * @param obj
 * @param schema if additionalProperties or additionalItems is not set, it will be set to true
 */
export function filterObject<T>(obj: object, schema: JSONSchema4): T{
    const data = JSON.parse(JSON.stringify(obj, function (this, key, value){
        return value === null ? undefined : value
    }))

    const valid = validate(data, schema, true)

    if(valid !== true){
        throw new FilterError(valid)
    }

    return data
}

export class FilterError extends Error {

}

/**
 * @param obj
 * @param schema if additionalProperties or additionalItems is not set, it will be set to true
 * @returns true or a string describing the error
 */
export function validate(obj: object, schema: JSONSchema4, skipSerialization = false){

    if(schema.oneOf){
        let lastError : string

        for(const o of schema.oneOf){
            const v = validate(obj, o, skipSerialization)
            if(v === true){
                return true
            } else {
                lastError = v
            }
        }

        return lastError
    }

    if(schema.allOf){
        let errors = [] as string[]

        for(const o of schema.allOf){
            const v = validate(obj, o, skipSerialization)
            if(v !== true){
                errors.push(v)
            }
        }
        if(errors.length === 0){
            return true
        }

        return errors.join(',')
    }

    let data
    if(!skipSerialization){
        data = JSON.parse(JSON.stringify(obj))
    } else {
        data = obj
    }

    // by default prevent additionaProperties
    if(!schema.type || schema.type === 'object'){
        if(schema.additionalProperties === undefined){
            schema.additionalProperties = false
        }
    } else if(schema.type === 'array' && schema.items instanceof Array){
        if(schema.additionalItems === undefined){
            schema.additionalItems = false
        }
    }


    const val = ajv.compile(schema)
    const valid = val(data)
    const errors = val.errors

    if(valid === true){
        return true
    } else {
        return '' + errors.map(e => (e.instancePath !== '' ? e.instancePath + ': ' : '') + e.message).join(', ')
    }
}
