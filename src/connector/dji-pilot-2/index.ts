import Connector from "./Connector";

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log('onMessage_State', connectionId, message)
})


connector.onMessage_Status((connectionId, message, respond)=>{
    console.log('onMessage_Status', connectionId, message)

    respond({
        method: 'update_topo',
        data: {
            result: 0
        }
    })
})


connector.onMessage_Osd((connectionId, message)=>{
    console.log('onMessage_Osd', connectionId, message)
})

export const handleMqttPacket = connector.handleMqttPacket.bind(connector)
