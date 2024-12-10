import MqttServer from "./mqtt_server"


const mqttServer = new MqttServer(9002, async (client, username, password) => {

    if(username === 'test' && password === 'test'){
        console.log('new client authenticated', client.id)

        return true
    } else {
        return false
    }
}, (client, packet)=>{
    console.log('message from', client.id, '#' + packet.topic, packet.payload.toString())
})
