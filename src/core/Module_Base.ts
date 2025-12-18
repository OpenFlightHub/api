import {EventManagerWithPublicDispatch} from '../util/event_manager'

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

export class ModuleError extends Error {

    constructor(message?: string){
        super(message)
    }
}

export class ModuleError_IdNotFound extends ModuleError {

    constructor(id: number){
        super('id not found: ' + id)
    }
}

export function makeFunctionIdSafe<A extends any[], F extends (id: number, ...args: A)=>Promise<false | any>>(that: Object, func: F){
    return async function(id: number, ...args: A){
        const ret = await func.apply(that, [id, ...args])

        if(ret === false){
            throw new ModuleError_IdNotFound(id)
        }

        return ret
    } as (...args: Parameters<F>)=>Promise<Exclude<Awaited<ReturnType<F>>, false>>
}
