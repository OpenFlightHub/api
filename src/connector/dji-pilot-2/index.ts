import Connector from "./Connector";

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    message.bid
})


connector.onMessage_Status((connectionId, message, callback)=>{
    callback({
        result: 0
    })
})