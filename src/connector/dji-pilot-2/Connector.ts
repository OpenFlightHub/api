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

type EventFunction<M extends Message<MD>, MD = M extends Message<infer G> ? G : unknown> = (callback: EventCallback<M, MD>) => void

type EventFunctionWithRespond<M extends Message<MD>, R extends Response<RD>, MD = M extends Message<infer G> ? G : unknown, RD = R extends Response<infer G> ? G : unknown> = (callback: EventCallbackWithResponse<M, R, MD, RD>) => void

export default class Connector extends EventManager<ConnectorEvents>  {

    private internalEventManager = new PublicEventManager<{[key: string]: {
        client: Client
        connectionId: number
        message: Message<any>
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

    private makeEventFunction<M extends Message<MD>, MD = M extends Message<infer G> ? G : unknown>(eventName: string): EventFunction<M, MD> {
        this.registerEvent(eventName)

        return (callback: EventCallback<M, MD>)=>{
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
    private makeEventFunctionWithRespond<M extends Message<MD>, R extends Response<RD>, MD = M extends Message<infer G> ? G : unknown, RD = R extends Response<infer G> ? G : unknown>(eventName: string, responseEventName: string, makeResponseBaseData?: (message: M)=>Record<string, any>): EventFunctionWithRespond<M, R, MD, RD> {
        this.registerEvent(eventName)

        return (callback: EventCallbackWithResponse<M, R, MD, RD>)=>{
            this.internalEventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M, (response: RD)=>{
                    if(typeof makeResponseBaseData === 'function'){
                        Object.assign(response, makeResponseBaseData(c.message as M))
                    }
                    this.respondToMessage(c.client, c.connectionId, c.message, responseEventName, response)
                })
            })
        }
    }

    private respondToMessage(client: Client, connectionId: number, originalMessage: Message<any>, responseEventName: string, response: ResponseData){
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

    onMessage_State = this.makeEventFunction<Message_Type_State>('thing/product/state')

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



type EventCallback<M extends Message<MD>, MD = M extends Message<infer G> ? G : unknown> = (connectionId: number, message: M) => void
type EventCallbackWithResponse<M extends Message<MD>, R extends Response<RD>, MD = M extends Message<infer G> ? G : unknown, RD = R extends Response<infer G> ? G : unknown> = (connectionId: number, message: M, respond: (data: RD) => void) => void

interface Message_Base {// coming from device to cloud
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    gateway?: string // serial number of the gateway device (usually the remote controller) that send the message
    data: {}
}


type MessageData = Record<string, any>
interface Message<MD extends MessageData> extends Message_Base {
    data: MD
}


//TODO make this generic for many drones
//TODO is gateway property and bid mandatory?
type Message_Type_State = Message<MqttMavic3EnterpriseProperties_STABLE_FREQUENCY_TYPE | MqttMavic3EnterpriseProperties_STATE_CHANGE_TYPE>

interface Response_Base {// response from cloud back to device
    tid: string //transaction UUID used when a response is required for this message
    bid?: string //business UUID used for operations that require multiple transactions //TODO is this required or optional?
    timestamp: number // the time the message was sent (unix milliseconds)
    data: {}
}

type ResponseData = Record<string, any>
interface Response<RD extends ResponseData> extends Response_Base {
    data: RD
}


interface Response_With_Result extends Response_Base {
    data: {
        result: number
    }
}

// DRONE CONNECTION CONNECTOR

type DroneConnectionEventCallback<M extends Message<MD>, MD = M extends Message<infer G> ? G : unknown> = (message: M) => void

type DroneConnectionEventCallbackWithResponse<M extends Message<MD>, R extends Response<RD>, MD = M extends Message<infer G> ? G : unknown, RD = R extends Response<infer G> ? G : unknown> = (message: M, respond: (data: RD) => void) => void

type DroneConnection_EventFunction<E extends EventFunction<Message<MD>>, M = E extends EventFunction<infer G> ? G : unknown, MD = M extends Message<infer G> ? G : unknown> = (callback: DroneConnectionEventCallback<Message<MD>, MD>) => void

type DroneConnection_EventFunctionWithRespond<
    E extends EventFunctionWithRespond<Message<MD>, Response<RD>>,
    M = E extends EventFunctionWithRespond<infer G1, infer G2> ? G1 : unknown,
    R = E extends EventFunctionWithRespond<infer G1, infer G2> ? G2 : unknown,
    MD = M extends Message<infer G> ? G : unknown,
    RD = R extends Response<infer G> ? G : unknown
> = (callback: DroneConnectionEventCallbackWithResponse<Message<MD>, Response<RD>>) => void

export class DroneConnectionConnector {

    private readonly connector: Connector
    private readonly myDroneId: number



    onMessage_State: DroneConnection_EventFunction<Connector['onMessage_State']>

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

    private makeEventFunction<
        EF extends EventFunction<Message<MD>>,
        M = EF extends EventFunction<infer G> ? G : unknown,
        MD = M extends Message<infer G> ? G : unknown
    >(connectorEventFunction: EF): DroneConnection_EventFunction<EventFunction<Message<MD>>>{
        return (callback)=>{
            //TODO
        }
    }

    private makeEventFunctionWithRespond<
        EF extends EventFunctionWithRespond<Message<MD>, Response<RD>>,
        M = EF extends EventFunction<infer G1, infer G2> ? G1 : unknown,
        MD = M extends Message<infer G> ? G : unknown,
        R = EF extends EventFunction<infer G1, infer G2> ? G2 : unknown,
        RD = R extends Response<infer G> ? G : unknown
    >(connectorEventFunctionWithRespond: EF): DroneConnection_EventFunctionWithRespond<EventFunctionWithRespond<Message<MD>, Response<RD>>>{
        return (callback)=>{
            //TODO
        }
    }
}