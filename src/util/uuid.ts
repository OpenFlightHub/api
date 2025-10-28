
export function makeUUIDFromId(id: number){

    let idString = '' + id

    if(idString.length > 8){
        throw new Error('id exceeds length of 8')
    }

    while(idString.length < 8){
        idString = '0' + idString
    }

    return `${idString}-b847-4a0a-8824-54344deedc14`
}