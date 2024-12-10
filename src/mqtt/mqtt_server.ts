import Aedes, { Client, AuthenticateError, AuthErrorCode, PublishPacket } from 'aedes'
import { createServer } from 'net'

export type AuthenticateHandler = (client: Client, username?: string, password?: string) => Promise<boolean>

export type MessageHandler = (client: Client, packet: PublishPacket) => void

export default class MqttServer {

    private aedes: Aedes

    private clients = new Map<string, Client>()

    constructor(port: number, authenticateHandler: AuthenticateHandler, messageHandler: MessageHandler){

        this.aedes = new Aedes({
            authenticate: (client, username, password, done)=>{

                if(this.clients.has(client.id)){
                    const err = new Error('unacceptable id') as AuthenticateError
                    err.returnCode = AuthErrorCode.IDENTIFIER_REJECTED
                    done(err, false)
                    return
                }

                authenticateHandler(client, username, password?.toString()).then(isAllowed=>{
                    if(isAllowed){
                        this.clients.set(client.id, client)
                    }

                    done(null, isAllowed)
                }).catch(err =>{
                    console.error('error when calling authenticateHandler', err)
                    done(null, false)
                })
            },
            authorizePublish: (client, packet, callback)=>{
                if (packet.topic.startsWith('$SYS')) {
                    return callback(new Error('$SYS' + ' topic is reserved'))
                }

                if(!client){//aedes sends obsolete LWT without connected clients
                    callback(null)
                    return
                }

                callback(null)
                messageHandler(client, packet)
            }
        })

        const server = createServer(this.aedes.handle)

        server.listen(port, function () {
            console.log('mqtt server started and listening on port', port)
        })


        this.aedes.on('clientDisconnect', (client)=>{
            if(this.clients.has(client.id)){
                this.clients.delete(client.id)
            }
        })
    }
}
