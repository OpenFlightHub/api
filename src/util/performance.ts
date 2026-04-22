import { performance } from 'perf_hooks'

export async function test(){
    console.log('Testing performance measurement...')
    console.log('Synchronous function:', await measurePerformance(example_sync))
    console.log('Asynchronous function with wait:', await measurePerformance(example_async_wait))
    console.log('Asynchronous function with wait and work:', await measurePerformance(example_async_wait_and_work))
}

export async function measurePerformance(fn: Function): Promise<number> {
    const start = performance.now()
    const cpuStart = process.cpuUsage()
    const result = fn()
    if (result instanceof Promise) {
        await result
    }
    const wallTime = performance.now() - start
    const cpu = process.cpuUsage(cpuStart)
    const cpuTimeMs = (cpu.user + cpu.system) / 1000
    const idleTimeMs = wallTime - cpuTimeMs
    return wallTime - Math.max(0, idleTimeMs)
}


function example_sync(){
    let i = 1;
    while(i < 1000000000){
        i += 0.1
    }
    return i
}

function example_async_wait(){
    return new Promise(resolve => setTimeout(resolve, 1000))
}

function example_async_wait_and_work(){
    return new Promise<void>(resolve => setTimeout(()=>{
        example_sync()
        resolve()
    }, 1000))
}