export default class Module_Base<

    Events extends {[key: string]: {
        eventDataType: any
        availableContexts: {[key: string]: any}
    }}

>{

    listenTo<EventName extends keyof Events, Contexts = Partial<Events[EventName]['availableContexts']>>(eventName: EventName, contexts: Contexts, callback: (eventName: EventName, contexts: Contexts, eventData: Events[EventName]['eventDataType'])=>void){
        //TODO
    }

    protected dispatch<EventName extends keyof Events>(eventName: EventName, contexts: Partial<Events[EventName]['availableContexts']>, eventValue: Events[EventName]['eventDataType']){
        //TODO
    }
}

