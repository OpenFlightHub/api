import { PublishPacket } from "aedes";
import { PublicEventManager } from "../../util/event_manager";


export default class Connector  {

    private eventManager = new PublicEventManager<{[key: string]: {
        connectionId: number
        message: Message_Base
        callback?: ResponseCallback
    }}>()

    private handleMqttPacket(connectionId: number, packet: PublishPacket){

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

        const remainingParts = topicParts.slice(3)

        switch(remainingParts[0]){
            case 'state': {
                this.eventManager.dispatch('state', {
                    connectionId,
                    message
                })
            }; break;




            default: {
                throw new Error('unsupported topic: ' + topic)
            }
        }

    }

    onMessage_State(callback: EventCallback<Message_DeviceToCloud_State>){
        this.eventManager.addListener('state', (c)=>{
            callback(c.connectionId, c.message)
        })
    }

    onMessage_Status(callback: EventCallbackWithResponse<Message_DeviceToCloud_Status, ResponseCallback_DeviceToCloud_Status>){
        this.eventManager.addListener('status', (c) => {
            callback(c.connectionId, c.message as Message_DeviceToCloud_Status, (response)=>{
                this.respondToMessage(c.connectionId, c.message, response)
            })
        })
    }

    private respondToMessage<OM extends Message_Base, R extends Object>(connectionId: number, originalMessage: OM, response: R){
        const responseMessage: ResponseMessage_Base = {
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
    }

    private makeResponseCallback<M extends Message_Base, C extends ResponseCallback, ECWR extends EventCallbackWithResponse<M, C>>(eventCallback: ECWR){
        return function(){

        }
    }
}



type EventCallback<M extends Message_Base> = (connectionId: number, message: M) => void
type EventCallbackWithResponse<M extends Message_Base, C extends ResponseCallback> = (connectionId: number, message: M, callback: C) => void

type ResponseCallback = Function

type ResponseCallback_DeviceToCloud_Status = (data: {result: number}) => void




interface Message_Base {// coming from device to cloud
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    gateway: string // serial number of the gateway device (usually the remote controller) that send the message
    data: {}
}


interface ResponseMessage_Base {// respons from cloud back to device
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
