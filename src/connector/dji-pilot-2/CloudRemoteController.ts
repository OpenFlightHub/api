import { EventManagerWithPublicDispatch } from '../../util/event_manager'
import Connector, { DroneConnectionConnector, Message_Type_Event, Message_Type_Osd, Message_Type_Services, Message_Type_State, Message_Type_Status } from './Connector'


type CloudRemoteController_InternalEvents = {
    'message_state': Message_Type_State,
    'message_status': Message_Type_Status,
    'message_osd': Message_Type_Osd,
    'message_event': Message_Type_Event
}

export default class CloudRemoteController {

    private readonly connector: DroneConnectionConnector
    private readonly WAIT_FOR_EVENT_TIMEOUT_DEFAULT = 1000 * 10

    private readonly internalEventManager = new EventManagerWithPublicDispatch<CloudRemoteController_InternalEvents>()

    constructor(connector: DroneConnectionConnector){
        this.connector = connector

        this.connector.onMessage_State((message)=>{
            this.internalEventManager.dispatch('message_state', message)
        })

        this.connector.onMessage_Status((message, respond)=>{
            this.internalEventManager.dispatch('message_status', message as Message_Type_Status)// TODO fix the typing here (it works for onMessage_State, why not here?)
        })

        this.connector.onMessage_Osd((message)=>{
            this.internalEventManager.dispatch('message_osd', message)
        })

        this.connector.onMessage_Event((message, respond)=>{
            this.internalEventManager.dispatch('message_event', message as Message_Type_Event)// TODO fix (see onMessage_Status)
        })
    }


    async startControl(){
        // see https://developer.dji.com/doc/cloud-api-tutorial/en/api-reference/pilot-to-cloud/mqtt/rc-pro/drc.html#request-cloud-control-authorization

        return new Promise<void>((resolve, reject)=>{

            this.waitForEvent('cloud_control_auth_request').then(msg => {
                //TODO TODO: use documented.ts types

                //@ts-ignore
                if(msg.data.result === 0){
                    resolve()
                } else {
                    //@ts-ignore
                    reject(msg.data.message)//TODO is this correct?
                }
            })

            this.connector.sendMessage('thing/product/$/services', Connector.makeMessage<Message_Type_Services>({//TODO use documented.ts types
                method: 'cloud_control_auth_request'
            }, {
                user_id: "someuserid",//TODO
                user_callsign: "OFH CloudRemoteControl",
                control_keys: 'flight'//TODO what other options do we have here?
            }))

        })
    }

    async stopControl(){
        //TODO
    }

    async takePicture(){
        //TODO
    }


    private waitForEvent<MethodName extends string>(methodName: MethodName, customTimeout?: number){

        let promiseState: 'ongoing' | 'resolved' | 'rejected' = 'ongoing'

        return new Promise<Message_Type_Event>((resolve, reject)=>{

            const cb = (message: Message_Type_Event) => {

                if(message.method !== methodName){
                    return
                }

                if(promiseState === 'ongoing'){
                    promiseState = 'resolved'

                    this.internalEventManager.removeListener('message_event', cb)
                    resolve(message)
                }
            }

            this.internalEventManager.addListener('message_event', cb)

            setTimeout(()=>{
                if(promiseState === 'ongoing'){
                    promiseState = 'rejected'

                    this.internalEventManager.removeListener('message_event', cb)
                    reject('timeout')
                }
            }, typeof customTimeout === 'number' ? customTimeout : this.WAIT_FOR_EVENT_TIMEOUT_DEFAULT)
        })
    }

}