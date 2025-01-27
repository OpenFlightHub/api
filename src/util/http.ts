
export function fetchUrl(options: {
    url: string
    method: 'get' | 'post' | 'patch' | 'put' | 'delete'
    data?: any,
    headers?: Record<string, string>
    timeout?: number
}){
    return new Promise<undefined | object>((resolve, reject)=>{

        const baseHeaders: {[key: string]: string} = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }

        const abortController = new AbortController()

        const request = new Request(options.url, {
            signal: abortController.signal,
            body: options.data === undefined ? undefined : JSON.stringify(options.data),
            method: options.method,
            cache: 'no-store',
            headers: Object.assign(baseHeaders, options.headers || {}),
            credentials: 'include'
        })

        let fetchIsDone = false

        let rejectedDueToTimeout = false

        setTimeout(()=>{
            if(fetchIsDone){
                return
            }
            rejectedDueToTimeout = true

            abortController.abort('Fatal: timeout when trying to make api call')

            reject('Fatal: timeout when trying to make api call')

        }, typeof options.timeout === 'number' ? options.timeout : (1000 * 3) )

        fetch(request).then(response => {
            fetchIsDone = true

            if (response.ok) {
                if (response.body) {
                    response.text().then(text => {
                        if(text.length === 0){
                            resolve(undefined)
                        } else {
                            try {
                                const parsed = JSON.parse(text)
                                resolve(parsed)
                            } catch(err){
                                reject(err)
                            }
                        }

                    }).catch(err => {
                        console.error('error while response.text()', err)
                        reject(err)
                    })
                } else {
                    resolve(undefined)
                    return
                }
            } else {
                if (('' + response.status).startsWith('5')) {

                    if (response.body) {
                        response.text().then(body => {
                            reject(`Fatal fetch Error @ ${options.method.toUpperCase()} ${options.url} : ${response.statusText} ${body}`)
                        }).catch(reject)
                    } else {
                        reject(`Fatal fetch Error @ ${options.method.toUpperCase()} ${options.url} : ${response.statusText}`)
                    }


                } else {
                    reject(`fetch Error @ ${options.method.toUpperCase()} ${options.url} : ${response.status} ${response.statusText}`)
                }
            }
        }).catch(reason => {
            if(rejectedDueToTimeout){
                return
            } else {
                reject(reason)
            }
        })
    })
}