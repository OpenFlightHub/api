export default class Module_Base<


    Contexts extends {[key: string]: any},

    Events extends {[key: string]: {
        eventDataType: any
        availableContexts: keyof Contexts
    }}

>{

    listenTo<EventName extends keyof Events>(eventName: EventName, contexts: Partial<Pick<Contexts, Events[EventName]['availableContexts']>>, callback: (eventName: EventName, contexts: Pick<Contexts, Events[EventName]['availableContexts']>, eventData: Events[EventName]['eventDataType'])=>void){
        //TODO
    }

    protected dispatch<EventName extends keyof Events>(eventName: EventName, contexts: Partial<Pick<Contexts, Events[EventName]['availableContexts']>>, eventValue: Events[EventName]['eventDataType']){
        //TODO
    }
}

