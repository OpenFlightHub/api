import { DroneConnectionConnector } from './Connector'

export default class CloudRemoteController {

    private readonly connector: DroneConnectionConnector

    constructor(connector: DroneConnectionConnector){
        this.connector = connector

        this.connector.onMessage_State((message)=>{
            //TODO
        })

        this.connector.onMessage_Status((message, respond)=>{
            //TODO
        })

        this.connector.onMessage_Osd((message)=>{
            //TODO
        })

        this.connector.onMessage_Event((message, respond)=>{
            //TODO
        })
    }


    async startControl(){
        //TODO
    }

    async stopControl(){
        //TODO
    }

    async takePicture(){
        //TODO
    }

}