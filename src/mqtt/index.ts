import MqttServer from "./mqtt_server"
import { handleMqttPacket } from "../connector/dji-pilot-2"

export function setup(port: number){

    const mqttServer = new MqttServer(port, async (client, username, password) => {

        if(username === 'test' && password === 'test'){
            console.log('MQTT new client authenticated', client.id)

            return true
        } else {
            return false
        }
    }, (client, packet)=>{
        //console.log('MQTT message from', client.id, '#' + packet.topic, packet.payload.toString())

        //TODO implement connectionId
        handleMqttPacket(client, 1, packet)
    })
}
