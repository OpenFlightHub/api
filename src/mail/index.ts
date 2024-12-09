import * as nodemailer from 'nodemailer'

import { Attachment } from 'nodemailer/lib/mailer'
import { fillTemplate } from './template'



let transporter : nodemailer.Transporter


/**
 *
 * @param host e.g. "smtp.gmail.com"
 * @param port e.g. 465
 * @param secure if TLS should be used (true for port 465)
 * @param from e.g. '"Sender Name" sender@example.org'
 */
export async function setupMail(hostname: string, port: number, secure: boolean, username: string, password: string, from: string){
    transporter = nodemailer.createTransport({
        host: hostname,
        port,
        secure,
        auth: {
            user: username,
            pass: password
        },
        tls: {
            servername: hostname
        }
    })

    transporter.on('error', err=>{
        console.error(err)
        process.exit(1)
    })
}


export async function sendMail(to: string, subject: string, html: string, plain?: string, attachments?: Attachment[]){

    const result = await transporter.sendMail({
        from: this.from,
        to,
        subject,
        text: plain || '',
        html: html,
        attachments
    })

    //TODO deal with rejected emails?
    return result
}

/**
 * @param attachments see makeAttachment()
 */
export async function sendMailFromTemplate(to: string, subject: string, mailTemplateName: MailTemplateName, mailTemplateConfig: MailTemplateConfig, attachments?: Attachment[]){

    const mailTemplate = await fillTemplate(mailTemplateName, mailTemplateConfig)

    await sendMail(to, subject, mailTemplate.html, mailTemplate.plain, attachments)
}

export async function makeAttachment(filename: string, content: string | Buffer) : Attachment {

    const buffer = typeof content === 'string' ? Buffer.from(content) : content

    return {
        filename,
        content_base64: buffer.toString('base64')
    }
}


type MailTemplateName = 'logo_header_text' | 'logo_header_text_button'

type MailTemplateConfig = MailTemplateConfig_LogoHeaderText | MailTemplateConfig_LogoHeaderTextButton

type MailTemplateConfig_LogoHeaderText = {
    "BACKGROUND"?: Color,
    "SHADOW"?: BoxShadow,

    "LOGO_BACKGROUND_COLOR"?: Color,
    "LOGO_SRC"?: DataSrcImage,

    "LOGO_MAX_HEIGHT"?: PixelSize,
    "LOGO_MAX_WIDTH"?: PixelSize,
    "LOGO_ALT"?: string,
    "LOGO_ALT_COLOR"?: Color,

    "LOGO_BORDER_BOTTOM_COLOR"?: Color,

    "BOTTOM_BACKGROUND"?: Color,

    "TEXT_HEADER"?: string,
    "TEXT_HEADER_SIZE"?: PixelSize,
    "TEXT_HEADER_COLOR"?: Color,

    "TEXT_MAIN"?: string,
    "TEXT_MAIN_SIZE"?: PixelSize,
    "TEXT_MAIN_COLOR"?: Color,

    "NOTE"?: string,
    "NOTE_SIZE"?: PixelSize,
    "NOTE_COLOR"?: Color,

    "FOOTER"?: string,
    "FOOTER_SIZE"?: PixelSize,
    "FOOTER_URL"?: Url,
    "FOOTER_COLOR"?: Color
}

type MailTemplateConfig_LogoHeaderTextButton = {
    "BACKGROUND"?: Color,
    "SHADOW"?: BoxShadow,

    "LOGO_BACKGROUND_COLOR"?: Color,
    "LOGO_SRC"?: DataSrcImage,

    "LOGO_MAX_HEIGHT"?: PixelSize,
    "LOGO_MAX_WIDTH"?: PixelSize,
    "LOGO_ALT"?: string,
    "LOGO_ALT_COLOR"?: Color,

    "LOGO_BORDER_BOTTOM_COLOR"?: Color,

    "BOTTOM_BACKGROUND"?: Color,

    "TEXT_HEADER"?: string,
    "TEXT_HEADER_SIZE"?: PixelSize,
    "TEXT_HEADER_COLOR"?: Color,

    "TEXT_MAIN"?: string,
    "TEXT_MAIN_SIZE"?: PixelSize,
    "TEXT_MAIN_COLOR"?: Color,


    "BUTTON_BACKGROUND"?: Color,
    "BUTTON_BORDER"?: Border,
    "BUTTON_RADIUS"?: PixelSize,
    "BUTTON_PADDING"?: FourSidePixelSize,
    "BUTTON_INNER_BACKGROUND"?: Color,
    "BUTTON_URL"?: Url,
    "BUTTON_SIZE"?: PixelSize,
    "BUTTON_COLOR"?: Color,
    "BUTTON_TEXT"?: string,

    "NOTE"?: string,
    "NOTE_SIZE"?: PixelSize,
    "NOTE_COLOR"?: Color,

    "FOOTER"?: string,
    "FOOTER_SIZE"?: PixelSize,
    "FOOTER_URL"?: Url,
    "FOOTER_COLOR"?: Color
}

/**
 * any valid css color, example: #fff
 */
type Color = string

/**
 * any valid url, example:  https://example.org
 */
type Url = string

/**
 * any valid pixel size, example: 12px
 */
type PixelSize = string

/**
 * any valid css value for up to 4 PixelSize, example: 1px 2px 3px 4px (top: 1px, right: 2px, bottom: 3px, left: 4px) or 1px 2px (top and bottom: 1px, left and right: 2px)
 */
type FourSidePixelSize = string


/**
 * any valid css border value, example: 1px solid #fff
 */
type Border= string

/**
 * any valid image data src url, example: data:image/png;base64,iVBORw0KGgoAAAA[...]
 */
type DataSrcImage = string


/**
 * any valid css box shadow value, example: 1px 2px solid #fff
 */
type BoxShadow = string

