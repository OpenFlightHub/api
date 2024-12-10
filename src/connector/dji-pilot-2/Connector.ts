import { PublishPacket } from "aedes";
import { PublicEventManager } from "../../util/event_manager";


export default class Connector  {

    private eventManager = new PublicEventManager<{[key: string]: {
        connectionId: number
        message: Message_Base
    }}>()

    private validEvents = new Array<string>()

    handleMqttPacket(connectionId: number, packet: PublishPacket){

        const message = JSON.parse(packet.payload.toString())

        const topic = packet.topic

        const topicParts = topic.split('/')
        if(topicParts.length < 4){
            throw new Error('unsupported topic: ' + topic)
        }

        const topLevel = topicParts[0]
        if(topLevel !== 'thing' && topLevel !== 'sys'){
            throw new Error('unsupported topic: topLevel ' + topLevel)
        }

        const secondLevel = topicParts[1]
        if(secondLevel !== 'product'){
            throw new Error('unsupported topic: secondLevel ' + secondLevel)
        }

        const clientId = topicParts[2]

        const remaining = topicParts.slice(3).join('/')


        if(this.validEvents.includes(remaining)){
            this.eventManager.dispatch(remaining, {
                connectionId,
                message
            })
        } else {
            throw new Error('unsupported topic: ' + topic)
        }
    }

    private registerEvent(eventName: string){
        if(this.validEvents.includes(eventName)){
            throw new Error('duplicate eventName ' + eventName)
        }

        this.validEvents.push(eventName)
    }

    private makeEventFunction<M extends Message_Base>(eventName: string){
        this.registerEvent(eventName)

        return (callback: EventCallback<M>)=>{
            this.eventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M)
            })
        }
    }

    private makeEventFunctionWithCallback<M extends Message_Base, R extends Response>(eventName: string){
        this.registerEvent(eventName)

        return (callback: EventCallbackWithResponse<M, R>)=>{
            this.eventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M, (response: R)=>{
                    this.respondToMessage(c.connectionId, c.message, response)
                })
            })
        }
    }

    private respondToMessage<OM extends Message_Base, R extends Response>(connectionId: number, originalMessage: OM, response: R){
        const responseMessage: Response_Base = {
            tid: originalMessage.tid,
            bid: originalMessage.bid,
            timestamp: Date.now(),
            data: {}
        }

        for(const key of Object.keys(response)){
            if(['tid', 'bid', 'timestamp'].includes(key)){
                console.warn('respondToMessage attempts to overwrite base response message property', key)
            } else {
                responseMessage[key] = response[key]
            }
        }

        //TODO send message
        console.log('TODO', 'respondToMessage', connectionId, responseMessage)
    }

    // definitions

    onMessage_State = this.makeEventFunction<Message_DeviceToCloud_State>('state')

    onMessage_Status = this.makeEventFunctionWithCallback<Message_DeviceToCloud_Status, Response_DeviceToCloud_Status>('status')


    // for testing

    onMessage_Test = this.makeEventFunction<Message_DeviceToCloud_Test>('test')

    trigger_test(){
        this.eventManager.dispatch('test', {
            connectionId: 41,
            message: {
                tid: 'tid_1',
                bid: 'bid_1',
                timestamp: Date.now(),
                gateway: 'gateway_1',
                data: {
                    test: true
                }
            }
        })
    }

    onMessage_TestWithCallback = this.makeEventFunctionWithCallback<Message_DeviceToCloud_TestWithCallback, Response_DeviceToCloud_TestWithCallback>('test-with-callback')

    trigger_testWithCallback(){
        this.eventManager.dispatch('test-with-callback', {
            connectionId: 42,
            message: {
                tid: 'tid_2',
                bid: 'bid_2',
                timestamp: Date.now(),
                gateway: 'gateway_2',
                data: {
                    test_with_callback: true
                }
            }
        })
    }

}



type EventCallback<M extends Message_Base> = (connectionId: number, message: M) => void
type EventCallbackWithResponse<M extends Message_Base, C extends Object> = (connectionId: number, message: M, respond: (data: C) => void) => void


interface Message_Base {// coming from device to cloud
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    gateway: string // serial number of the gateway device (usually the remote controller) that send the message
    data: {}
}

type Response = Record<string, any>

interface Response_Base {// respons from cloud back to device
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    data: {}
}

interface Message_DeviceToCloud_State extends Message_Base {

}


interface Message_DeviceToCloud_Status extends Message_Base {
    method: 'update_topo'
    data: {
        type: number,
        sub_type: number,
        device_secret: string,
        nonce: string,
        version: number,
        sub_devices: Message_DeviceToCloud_Status_SubDevice[]
    }
}

type Message_DeviceToCloud_Status_SubDevice = {
    sn: string,
    type: number,
    sub_type: 0,
    index: string,
    device_secret: string,
    nonce: string,
    version: number
}

interface Response_DeviceToCloud_Status extends Response {
    result: number
}




// testing

interface Message_DeviceToCloud_Test extends Message_Base {
    test: true
}

interface Message_DeviceToCloud_TestWithCallback extends Message_Base {
    test_with_callback: true
}
interface Response_DeviceToCloud_TestWithCallback extends Response {
    test_with_callback_response: boolean
}
