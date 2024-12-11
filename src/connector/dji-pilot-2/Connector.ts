import { Client, PublishPacket } from "aedes";
import { PublicEventManager } from "../../util/event_manager";
import { randomUUID } from "crypto";


export default class Connector  {

    private eventManager = new PublicEventManager<{[key: string]: {
        client: Client
        connectionId: number
        message: Message_Base
    }}>()

    private validEvents = new Array<string>()

    handleMqttPacket(client: Client, connectionId: number, packet: PublishPacket){

        const message = JSON.parse(packet.payload.toString())

        const topic = packet.topic
        const topicMatch = topic.match(/^([^\/]+\/product\/)[^/]+\/(.*)$/)

        if(!topicMatch){
            throw new Error('unsupported topic ' + topic)
        }

        const eventName = topicMatch[1] + topicMatch[2]

        if(this.validEvents.includes(eventName)){
            this.eventManager.dispatch(eventName, {
                client,
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

    /**
     *
     * @param responseEventName special string of the format "thing/product/$/property" where $ will be replaced with the client id automatically
     * @returns
     */
    private makeEventFunctionWithCallback<M extends Message_Base, R extends Response>(eventName: string, responseEventName: string, responseBaseData?: Record<string, any>){
        this.registerEvent(eventName)

        return (callback: EventCallbackWithResponse<M, R>)=>{
            this.eventManager.addListener(eventName, (c)=>{
                callback(c.connectionId, c.message as M, (response: R)=>{
                    this.respondToMessage(c.client, c.connectionId, c.message, responseEventName, Object.assign(response, responseBaseData))
                })
            })
        }
    }

    private respondToMessage<OM extends Message_Base, R extends Response>(client: Client, connectionId: number, originalMessage: OM, responseEventName: string, response: R){
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

    onMessage_State = this.makeEventFunction<Message_DeviceToCloud_State>('thing/product/state')

    onMessage_Status = this.makeEventFunctionWithCallback<Message_DeviceToCloud_Status, Response_DeviceToCloud_Status>('sys/product/status', 'sys/product/$/status_reply', {
        method: 'update_topo'
    })

    onMessage_Osd = this.makeEventFunction<Message_DeviceToCloud_Osd>('thing/product/osd')

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
    data: {
        result: number
    }
}

interface Message_DeviceToCloud_Osd extends Message_Base {
    data: Message_DeviceToCloud_Osd_Data_A | Message_DeviceToCloud_Osd_Data_B | Message_DeviceToCloud_Osd_Data_C
}

type Message_DeviceToCloud_Osd_Data_A = {
    job_number: number,
    acc_time: number,
    activation_time: number,
    maintain_status: {
        maintain_status_array: {
            state: number,
            last_maintain_type: number,
            last_maintain_time: number,
            last_maintain_work_sorties: number
        }[]
    },
    electric_supply_voltage: number,
    working_voltage: number,
    working_current: number,
    backup_battery: {
        voltage: number,
        temperature: number,
        switch: number
    },
    drone_battery_maintenance_info: {
        maintenance_state: number,
        maintenance_time_left: number
    }
}

type Message_DeviceToCloud_Osd_Data_B = {
    flighttask_step_code: number
    media_file_detail: {
        remain_upload: number
    }
    wireless_link: {
        "4g_freq_band": number
        "4g_gnd_quality": number
        "4g_link_state": number
        "4g_quality": number
        "4g_uav_quality": number
        dongle_number: number
        link_workmode: number
        sdr_freq_band: number
        sdr_link_state: number
        sdr_quality: number
    }
}

type Message_DeviceToCloud_Osd_Data_C = {
    network_state: {
        type: number
        quality: number
        rate: number
    }
    drone_charge_state: {
        state: number
        capacity_percent: number
    }
    drone_in_dock: number
    rainfall: number
    wind_speed: number
    environment_temperature: number
    temperature: number
    humidity: number
    latitude: number
    longitude: number
    height: number
    alternate_land_point: {
        latitude: number
        longitude: number
        safe_land_height: number
        is_configured: number
    }
    first_power_on: number
    position_state: {
        is_calibration: number
        is_fixed: number
        quality: number
        gps_number: number
        rtk_number: number
    }
    storage: {
        total: number
        used: number
    }
    mode_code: number
    cover_state: number
    supplement_light_state: number
    emergency_stop_state: number
    air_conditioner_mode: number
    battery_store_mode: number
    alarm_state: number
    putter_state: number
    sub_device: {
        device_sn: number
        device_model_key: number
        device_online_status: number
        device_paired: number
    }
}
