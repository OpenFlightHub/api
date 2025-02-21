import { DroneConnectionConnector } from './Connector'

export default class CloudRemoteController {

    private readonly connector: DroneConnectionConnector

    constructor(connector: DroneConnectionConnector){
        this.connector = connector
    }


    async startControl(){

        this.connector.onMessage_State((message)=>{

        })

        this.connector
    }

    async stopControl(){

    }

    async takePicture(){

    }

}