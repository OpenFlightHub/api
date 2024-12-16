import { Client, PublishPacket } from "aedes";
import Connector from "./Connector";
import Logger from "./ConnectorLogger";
import path from "path";

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log('onMessage_State', connectionId, message)
})


connector.onMessage_Status((connectionId, message, respond)=>{
    console.log('onMessage_Status', connectionId, message)

    respond({
        data: {
            result: 0
        }
    })
})


connector.onMessage_Osd((connectionId, message)=>{

    const m = message as {data: {longitude?: number, latitude?: number, height?: number}}

    //console.log('onMessage_Osd', connectionId, message)
    if(typeof m.data.longitude === 'number' && typeof m.data.latitude === 'number'){

    }
    message.data
})

connector.onMessage_Event((connectionId, message, respond)=>{
    console.log('onMessage_Event', connectionId, message)

    respond({
        data: {
            result: 0
        }
    })
})


new Logger(connector, path.resolve('connector_logs'))

export function handleMqttPacket(client: Client, connectionId: number, packet: PublishPacket){
    try {
        connector.handleMqttPacket(client, connectionId, packet)
    } catch (err){
        console.error('Failed to handleMqttPacket', err)
    }
}
