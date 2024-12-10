export type ApiType_Id = number;


/**
 * hh:mm:ss
 */
export type ApiType_Time = string;


/**
 * ISO 8601 format
 */
export type ApiType_Timestamptz = string;


export type ApiType_Email = string;


/**
 * Maximum length is 72 Bytes (utf-8).
 */
export type ApiType_Password = string;


export type ApiType_Reference = {
    id: number;
}


export type ApiType_References = {
    id: number;
}[];


export type ApiType_AuthLoginPost = {
    username: string;
    password: string;
}


export type ApiType_AuthLoginWithTokenPost = {
    token: string;
}


export type ApiType_AuthRegisterPost = {
    email: string;
    /**
     * Maximum length is 72 Bytes (utf-8).
     */
    password?: string;
}


export type ApiType_AuthPasswordChangePost = {
    /**
     * Maximum length is 72 Bytes (utf-8).
     */
    current_password: string;
    /**
     * Maximum length is 72 Bytes (utf-8).
     */
    new_password: string;
}


export type ApiType_AuthPasswordResetPost = {
    username: string;
}


export type ApiType_AuthPasswordSetInitialPost = {
    /**
     * Maximum length is 72 Bytes (utf-8).
     */
    new_password: string;
}


export type ApiType_AuthPasswordSetNewPost = {
    /**
     * Maximum length is 72 Bytes (utf-8).
     */
    new_password: string;
    code: string;
}


export type ApiType_User = {
    id: number;
    name: string;
}


export type ApiType_UserSelf = {
    id: number;
    name: string;
    email: string;
    /**
     * ISO 8601 format
     */
    created_at: string;
    locale: string;
    registration_incomplete: boolean;
}


export type ApiType_UserPatch = {
    name?: string;
    email?: string;
    locale?: string;
}


