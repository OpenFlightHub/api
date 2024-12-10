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



// test

connector.onMessage_Test((connectionId, message)=>{
    console.log('onMessage_Test', connectionId, message)
})


connector.trigger_test()

connector.onMessage_TestWithCallback((connectionId, message, callback)=>{
    console.log('onMessage_TestWithCallback', connectionId, message)

    callback({
        test_with_callback_response: true
    })
})


connector.trigger_testWithCallback()
