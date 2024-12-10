import {connect} from 'mqtt'
const client = connect("mqtt://localhost:8081");

client.on("connect", () => {
    console.log('mqtt client connected')

    client.subscribe("presence", (err) => {
        if (!err) {
            client.publish("presence", "Hello mqtt")
        }
    })
})

client.on("message", (topic, message) => {
    // message is Buffer
    console.log('mqtt client message:', message.toString())
})

client.on("error", (err) => {
    console.log('mqtt client error:', err);
})