import Connector from "./Connector";

const connector = new Connector()

connector.onMessage_State((connectionId, message)=>{
    console.log(connectionId, message)
})


// connector.onMessage_Status((connectionId, message, callback)=>{
//     callback({
//         result: 0
//     })
// })

connector.onMessage_Test((connectionId, message)=>{
    console.log('onMessage_Test', connectionId, message)
})

connector.onMessage_TestWithCallback((connectionId, message, callback)=>{
    console.log('onMessage_TestWithCallback', connectionId, message)

    callback({
        test_with_callback_response: true
    })
})


connector.trigger_testWithCallback()
