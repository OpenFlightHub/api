import JsonLoader from './JsonLoader'

export default class SecretsLoader {

    private filePath: string

    constructor(filePath: string){
        this.filePath = filePath
    }

    getSecrets(requiredProperties?: string[]){
        try {
            return JsonLoader.getJson(this.filePath, requiredProperties)
        } catch (err){
            console.error('Failed to parse secrets file', err)
            process.exit(1)
        }
    }
}
