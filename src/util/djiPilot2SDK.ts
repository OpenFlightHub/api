
// the client sdk uses a special format to convert the id serial into a uuid

export function getWorkspaceIdFromUUID(uuid: string){

    const match = uuid.match(/80b38820-0000-42ae-84e6-(\d{12,12})/)

    if(!match){
        throw new Error('invalid uuid format (does not comply with client sdk format: ' + uuid)
    }

    return parseInt(match[1])
}
