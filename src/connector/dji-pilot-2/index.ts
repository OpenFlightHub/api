import Connector from "./Connector";

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log('onMessage_State', connectionId, message)
})


connector.onMessage_Status((connectionId, message, respond)=>{
    console.log('onMessage_Status', connectionId, message)

    respond({
        result: 0
    })
})
