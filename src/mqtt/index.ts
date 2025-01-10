import MqttServer from "./mqtt_server"
import { handleMqttAuth, handleMqttPacket } from "../connector/dji-pilot-2"

export function setup(port: number){

    const mqttServer = new MqttServer(port, handleMqttAuth, handleMqttPacket)
}
