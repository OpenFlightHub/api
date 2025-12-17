import * as express from 'express'
import {DBInsert_User, DBUpdate_User, delete_User, insert_User, select_User, update_User} from '../../generated-definitions/db/DBHelpers'
import Module_Base from './Module_Base'
import {setSessionCookie} from '../../util/cookie'
import { generateUniqueTokenUrlSafe, hashString } from '../../util/crypto'
import { sendMailFromTemplate } from '../../mail'
import $t from '../../util/i18n'
import * as pgp from 'pg-promise'
import { DBType_User, DBType_User_STATES, DBType_User_StateType, DBType_Workspace_Permission } from '../../generated-definitions/db/DBTypes'
import { ApiType_Id } from '../../generated-definitions/api/ApiTypes'
import { assignObject } from '../../util/typescript'
import { firstCharAsUppercaseRestAsLowercase } from '../../util/string'
const db : pgp.IDatabase<any> = global.db


const TOKEN_BYTE_LENGTH = 42


export default class UserModule extends Module_Base<
    {
        id: number
    },

    {
        create: {
            eventDataType: DBType_User,
            availableContexts: 'id'
        },
        update: {
            eventDataType: DBType_User,
            availableContexts: 'id'
        },
        delete: {
            eventDataType: DBType_User,
            availableContexts: 'id'
        }
    }
> {

    constructor(){
        super()
    }

    private async create(data: DBInsert_User){
        const user = await insert_User(data)

        this.dispatch('create', {
            id: user.id
        }, user)

        return user
    }

    async update(id: number, data: DBUpdate_User){
        const user = await update_User(data, id)

        this.dispatch('update', {
            id: user.id
        }, user)

        return user
    }

    async delete(id: number){
        const user = await delete_User(id)

        this.dispatch('delete', {
            id: user.id
        }, user)
    }

    async get(id: number){
        return await select_User(id)
    }



    async createUser(values: {
        name: string
        email: string
        password?: string
        state?: DBType_User_StateType
    }, dontSendEmail?: boolean){

        if(values.password){
            values.password = await hashString(values.password)
        }

        const allValues = assignObject(values, {
            email_hash: await hashString(values.email,
                //@ts-ignore
                global.emailHashPepper)
        })

        const user = await insert_User(allValues)

        if(dontSendEmail !== true){
            await this.sendUserCreateEmail(user)
        }

        return user
    }

    async createUserFromEmail(email: string, dontSendEmail?: boolean){

        const name = this.deriveUserNameFromEmail(email)

        return this.createUser({
            name,
            email
        }, dontSendEmail)
    }

    async sendUserCreateEmail(user: DBType_User){

        const loginToken = await this.getOrMakeLoginToken(user.id)


        //TODO localize mails
        await sendMailFromTemplate(await this.getDecryptedUserEmail(user), $t('mail.register.confirm.self.subject'), 'logo_header_text_button', {
            HEADER: $t('mail.register.confirm.self.header'),

            CONTENT: $t('mail.register.confirm.self.content'),

            BUTTON_TEXT: $t('mail.register.confirm.self.button'),
            BUTTON_URL: 'https://hub.openflighthub.org/?token=' + encodeURIComponent(loginToken)
        })
    }

    /**
     * will resend the "welcome to openflighthub" email, if user state is "invited"
     */
    async resendUserCreateEmail(userId: number){

        const user = await this.get(userId)

        if(user.state === DBType_User_STATES.invited){
            await this.sendUserCreateEmail(user)
        }
    }

    async resetPasswordForEmail(email: string){
        const user = await this.getUserForEmail(email)

        if(user === false){
            return false
        } else {//TODO localise mail

            const code = await this.makePasswordResetCode(user.id)

            await sendMailFromTemplate(await this.getDecryptedUserEmail(user), $t('mail.password_reset.subject'), 'logo_header_text_button', {
                HEADER: $t('mail.password_reset.header'),

                CONTENT: $t('mail.password_reset.content'),

                BUTTON_TEXT: $t('mail.password_reset.button'),
                BUTTON_URL: 'https://hub.openflighthub.org/auth/password-set-new?code=' + code
            })

            return true
        }
    }

    private deriveUserNameFromEmail(email: string){
        const namePart = email.split('@')[0]

        const parts = namePart.split('.')

        if(parts.length === 2){
            const firstname = parts[0]
            const lastname = parts[1]

            return firstCharAsUppercaseRestAsLowercase(firstname) + ' ' + firstCharAsUppercaseRestAsLowercase(lastname)
        } else {
            return firstCharAsUppercaseRestAsLowercase(namePart)
        }
    }

    async getUserForEmail(email: string){

        /* TODO enable for production!
        const email_hash =await hashString(email, global.emailHashPepper)

        const user = await db.oneOrNone<DBType_User>('SELECT * FROM users WHERE email_hash = ${email_hash};', {
            email_hash
        })*/

        const user = await db.oneOrNone<DBType_User>('SELECT * FROM users WHERE email = ${email};', {
            email
        })

        if(user){
            return user
        } else {
            return false
        }
    }

    private async getDecryptedUserEmail(user: DBType_User){

        /* TODO implement email encryption */

        return user.email
    }

    /**
     * gets the existing login token or creates one
     */
    async getOrMakeLoginToken(userId: ApiType_Id){

        const user = await this.get(userId)

        if(user.login_token){
            return user.login_token
        } else {
            const updatedUser = await this.update(userId, {
                login_token: generateUniqueTokenUrlSafe(TOKEN_BYTE_LENGTH)
            })

            return updatedUser.login_token as string
        }

    }


    /**
     * makes a code that can be used to overwrite the password for a user
     */
    async makePasswordResetCode(userId: ApiType_Id){

        const updatedUser = await this.update(userId, {
            reset_code: generateUniqueTokenUrlSafe(TOKEN_BYTE_LENGTH)
        })

        return updatedUser.reset_code
    }

    async userHasPermissionForWorkspace(userId: number, workspaceId: number){
        const res = await db.oneOrNone<DBType_Workspace_Permission>('SELECT * FROM workspace_permissions WHERE user_id = ${userId} AND workspace_id = ${workspaceId}', {
            userId,
            workspaceId
        })

        return !!res
    }


    async generateUserSessionCookieAndSet(userId: number, res: express.Response, allowReuseExistingSessionToken?: boolean){

        let sessionToken: string
        if(allowReuseExistingSessionToken){
            const currentToken = (await this.get(userId)).session_token

            if(currentToken){
                sessionToken = currentToken
            } else {
                sessionToken = generateUniqueTokenUrlSafe(TOKEN_BYTE_LENGTH)
            }
        } else {
            sessionToken = generateUniqueTokenUrlSafe(TOKEN_BYTE_LENGTH)
        }

        await this.update(userId, {
            session_token: sessionToken
        })

        setSessionCookie('user-auth', sessionToken, res)
    }

}
