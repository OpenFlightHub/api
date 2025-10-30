import { generateUniqueTokenUrlSafe, hashString } from './crypto'
import {insertUser, selectUser, updateUser} from '../generated-definitions/db/DBHelpers'
import { sendMailFromTemplate } from '../mail'
import $t from './i18n'
import * as pgp from 'pg-promise'
import { DBType_User, DBType_User_STATES, DBType_User_StateType, DBType_WorkspacePermission } from '../generated-definitions/db/DBTypes'
import { ApiType_Id } from '../generated-definitions/api/ApiTypes'
import { assignObject } from './typescript'
const db : pgp.IDatabase<any> = global.db


export async function createUser(values: {
    name: string
    email: string
    password?: string
    state?: DBType_User_StateType
}, dontSendEmail?: boolean){

    if(values.password){
        values.password = await hashString(values.password)
    }

    const allValues = assignObject(values, {
        email_hash: await hashString(values.email, global.emailHashPepper)
    })

    const user = await insertUser(allValues)

    if(dontSendEmail !== true){
        await sendUserCreateEmail(user)
    }

    return user
}

export async function createUserFromEmail(email: string, dontSendEmail?: boolean){

    const name = deriveUserNameFromEmail(email)

    return createUser({
        name,
        email
    }, dontSendEmail)
}

async function sendUserCreateEmail(user: DBType_User){

    const loginToken = await getLoginToken(user.id)


    //TODO localize mails
    await sendMailFromTemplate(await getDecryptedUserEmail(user), $t('mail.register.confirm.self.subject'), 'logo_header_text_button', {
        HEADER: $t('mail.register.confirm.self.header'),

        CONTENT: $t('mail.register.confirm.self.content'),

        BUTTON_TEXT: $t('mail.register.confirm.self.button'),
        BUTTON_URL: 'https://hub.openflighthub.org/?token=' + encodeURIComponent(loginToken)
    })
}

/**
 * will resend the "welcome to openflighthub" email, if user state is "invited"
 */
export async function resendUserCreateEmail(userId: number){

    const user = await selectUser(userId)

    if(user.state === DBType_User_STATES.invited){
        await sendUserCreateEmail(user)
    }
}

export async function resetPasswordForEmail(email: string){
    const user = await getUserForEmail(email)

    if(user === false){
        return false
    } else {//TODO localise mail

        const code = await makePasswordResetCode(user.id)

        await sendMailFromTemplate(await getDecryptedUserEmail(user), $t('mail.password_reset.subject'), 'logo_header_text_button', {
            HEADER: $t('mail.password_reset.header'),

            CONTENT: $t('mail.password_reset.content'),

            BUTTON_TEXT: $t('mail.password_reset.button'),
            BUTTON_URL: 'https://hub.openflighthub.org/auth/password-set-new?code=' + code
        })

        return true
    }
}

export function deriveUserNameFromEmail(email: string){
    const namePart = email.split('@')[0]

    const parts = namePart.split('.')

    function firstCharAsUppercaseRestAsLowercase(str: string){
        if(str.length === 0){
            return str
        }

        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase()
    }

    if(parts.length === 2){
        const firstname = parts[0]
        const lastname = parts[1]

        return firstCharAsUppercaseRestAsLowercase(firstname) + ' ' + firstCharAsUppercaseRestAsLowercase(lastname)
    } else {
        return firstCharAsUppercaseRestAsLowercase(namePart)
    }
}

export async function getUserForEmail(email: string){

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

export async function getDecryptedUserEmail(user: DBType_User){

    /* TODO implement email encryption */

    return user.email
}

/**
 * gets the existing login token or creates one
 */
export async function getLoginToken(userId: ApiType_Id){

    const user = await selectUser(userId)

    if(user.login_token){
        return user.login_token
    } else {
        const updatedUser = await updateUser({
            login_token: generateUrlSafeToken()
        }, userId)

        return updatedUser.login_token
    }

}


/**
 * makes a code that can be used to overwrite the password for a user
 */
export async function makePasswordResetCode(userId: ApiType_Id){

    const updatedUser = await updateUser({
        reset_code: generateUrlSafeToken()
    }, userId)

    return updatedUser.reset_code
}

function generateUrlSafeToken(){
    return generateUniqueTokenUrlSafe(42)
}

export async function userHasPermissionForWorkspace(userId: number, workspaceId: number){
    const res = await db.oneOrNone<DBType_WorkspacePermission>('SELECT * FROM workspace_permissions WHERE user_id = ${userId} AND workspace_id = ${workspaceId}', {
        userId,
        workspaceId
    })

    return !!res
}