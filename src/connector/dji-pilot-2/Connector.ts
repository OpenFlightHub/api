import { Client, PublishPacket } from "aedes";
import { EventManager, PublicEventManager } from "../../util/event_manager";
import { MqttMavic3EnterpriseProperties_STABLE_FREQUENCY_TYPE, MqttMavic3EnterpriseProperties_STATE_CHANGE_TYPE } from "./mqtt-types/documented";


type ConnectorEvents = {
    packet: {
        client: Client
        connectionId: number
        packet: PublishPacket
    }
    unsupported_topic: string
}

type EventFunction<M extends Message_Base> = (callback: EventCallback<M>) => void

type EventFunctionWithRespond<M extends Message_Base, R extends Response_Base> = (callback: EventCallbackWithResponse<M, R>) => void

export default class Connector extends EventManager<ConnectorEvents>  {

    private internalEventManager = new PublicEventManager<{[key: string]: {
        client: Client
        connectionId: number
        message: Message_Base
    }}>()

    private validEvents = new Array<string>()

    handleMqttPacket(client: Client, connectionId: number, packet: PublishPacket){

        this.dispatch('packet', {client, connectionId, packet})

        const message = JSON.parse(packet.payload.toString())

        const topic = packet.topic
        const topicMatch = topic.match(/^([^\/]+\/product\/)[^/]+\/(.*)$/)

        if(!topicMatch){
            this.dispatch('unsupported_topic', topic)
            return
        }

        const eventName = topicMatch[1] + topicMatch[2]

        if(this.validEvents.includes(eventName)){
            this.internalEventManager.dispatch(eventName, {
                client,
                connectionId,
                message
            })
        } else {
            this.dispatch('unsupported_topic', topic)
        }
    }

    private registerEvent(eventName: string){
        if(this.validEvents.includes(eventName)){
            throw new Error('duplicate eventName ' + eventName)
        }

        this.validEvents.push(eventName)
    }

    private makeEventFunction<M extends Message_Base>(eventName: string): EventFunction<M> {
        this.registerEvent(eventName)

        return (callback: EventCallback<M>)=>{
            this.internalEventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M)
            })
        }
    }

    /**
     *
     * @param responseEventName special string of the format "thing/product/$/property" where $ will be replaced with the client id automatically
     * @returns
     */
    private makeEventFunctionWithRespond<M extends Message_Base, R extends Response_Base>(eventName: string, responseEventName: string, makeResponseBaseData?: (message: M)=>Record<string, any>): EventFunctionWithRespond<M, R> {
        this.registerEvent(eventName)

        return (callback: EventCallbackWithResponse<M, R>)=>{
            this.internalEventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M, (response: R)=>{
                    if(typeof makeResponseBaseData === 'function'){
                        Object.assign(response, makeResponseBaseData(c.message as M))
                    }
                    this.respondToMessage(c.client, c.connectionId, c.message, responseEventName, response)
                })
            })
        }
    }

    private respondToMessage(client: Client, connectionId: number, originalMessage: Message_Base, responseEventName: string, response: Response_Base){
        const responseMessage: Response_Base = {
            tid: originalMessage.tid,//randomUUID(),
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

        const topic = responseEventName.replace('$', client.id)

        client.publish({
            cmd: 'publish',
            dup: false,
            qos: 1,
            retain: false,
            topic,
            payload: JSON.stringify(responseMessage)
        }, (err)=>{
            if(err){
                console.warn('failed to send response to', connectionId, err)
            } else {
                console.log('responded to #' + topic, connectionId, responseMessage)
            }
        })
    }

    // definitions

    onMessage_State = this.makeEventFunction<Message_State>('thing/product/state')

    onMessage_Status = this.makeEventFunctionWithRespond('sys/product/status', 'sys/product/$/status_reply', (message)=>{
        return {
            //@ts-ignore
            method: message.method
        }
    })

    onMessage_Osd = this.makeEventFunction('thing/product/osd')


    onMessage_Event = this.makeEventFunctionWithRespond('thing/product/events', 'thing/product/$/events_reply', (message)=>{
        return {
            //@ts-ignore
            method: message.method
        }
    })
}



type EventCallback<M extends Message_Base> = (connectionId: number, message: M) => void
type EventCallbackWithResponse<M extends Message_Base, C extends Object> = (connectionId: number, message: M, respond: (data: C) => void) => void


interface Message_Base {// coming from device to cloud
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    gateway?: string // serial number of the gateway device (usually the remote controller) that send the message
    data: {}
}

interface Message_State extends Message_Base {//TODO make this generic for many drones
    //TODO is gateway property and bid mandatory?
    data: MqttMavic3EnterpriseProperties_STABLE_FREQUENCY_TYPE | MqttMavic3EnterpriseProperties_STATE_CHANGE_TYPE
}

interface Response_Base {// response from cloud back to device
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    data: {}
}


interface Response_With_Result extends Response_Base {
    data: {
        result: number
    }
}

// DRONE CONNECTION CONNECTOR

type DroneConnectionEventCallback<M extends Message_Base> = (message: M) => void

type DroneConnectionEventCallbackWithResponse<M extends Message_Base, C extends Object> = (message: M, respond: (data: C) => void) => void


type DroneConnection_EventFunction<E extends EventFunction<M>, M extends Message_Base> = (callback: DroneConnectionEventCallback<M>) => void
type DroneConnection_EventFunctionWithRespond<E extends EventFunctionWithRespond<M, R>, M extends Message_Base, R extends Response_Base> = (callback: DroneConnectionEventCallbackWithResponse<M, R>) => void

export class DroneConnectionConnector {

    private readonly connector: Connector
    private readonly myDroneId: number



    onMessage_State: DroneConnection_EventFunction<Connector['onMessage_State'], Connector['onMessage_State']>

    // this.onMessage_Status = this.makeEventFunctionWithRespond(()=>this.connector.onMessage_Status)

    // this.onMessage_Osd = this.makeEventFunction(()=>this.connector.onMessage_Osd)

    // this.onMessage_Event = this.makeEventFunctionWithRespond(()=>this.connector.onMessage_Event)

    constructor(connector: Connector, droneId: number){
        this.connector = connector
        this.myDroneId = droneId

        connector.onMessage_Event((connectionId, message, respond)=>{
            if(connectionId !== this.myDroneId){
                return
            }
        })

        this.onMessage_State = this.makeEventFunction(this.connector.onMessage_State)

        // this.onMessage_Status = this.makeEventFunctionWithRespond(()=>this.connector.onMessage_Status)

        // this.onMessage_Osd = this.makeEventFunction(()=>this.connector.onMessage_Osd)

        // this.onMessage_Event = this.makeEventFunctionWithRespond(()=>this.connector.onMessage_Event)
    }

    // definitions

    private makeEventFunction<M extends Message_Base, EF extends EventFunction<M>>(connectorEventFunction: EF): DroneConnection_EventFunction<EF>{
        return (callback)=>{
            //TODO
        }
    }

    private makeEventFunctionWithRespond<M extends Message_Base, R extends Response_Base, EF extends EventFunctionWithRespond<M, R>>(connectorEventFunctionWithRespond: EF): DroneConnection_EventFunctionWithRespond<EF>{
        return (callback)=>{
            //TODO
        }
    }
}