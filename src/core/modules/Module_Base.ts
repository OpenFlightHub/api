import {EventManagerWithPublicDispatch} from '../../util/event_manager'

export default class Module_Base<


    Contexts extends {[key: string]: any},

    Events extends {[key: string]: {
        eventDataType: any
        availableContexts: keyof Contexts
    }}
>{

    private eventManager = new EventManagerWithPublicDispatch<{[key in keyof Events]: {data: Events[key]['eventDataType'], contexts: Pick<Contexts, Events[key]['availableContexts']>}}>()

    listenTo<EventName extends keyof Events>(eventName: EventName, contexts: Partial<Pick<Contexts, Events[EventName]['availableContexts']>>, callback: (eventName: EventName, contexts: Pick<Contexts, Events[EventName]['availableContexts']>, eventData: Events[EventName]['eventDataType'])=>void){

        this.eventManager.addListener(eventName, (data)=>{
            //TODO add try catch for better debugging when unhandled error?

            callback(eventName, data.contexts, data.data)
        })
    }

    protected dispatch<EventName extends keyof Events>(eventName: EventName, contexts: Pick<Contexts, Events[EventName]['availableContexts']>, eventData: Events[EventName]['eventDataType']){

        this.eventManager.dispatch(eventName, {
            data: eventData,
            contexts
        })
    }
}

