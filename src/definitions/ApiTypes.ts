export type ApiType_Id = number;


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


export type ApiType_Workspace = {
    id: number;
    name: string;
}


export type ApiType_WorkspacePatch = {
    name?: string;
}


export type ApiType_WorkspacesPost = {
    name: string;
}


export type ApiType_WorkspaceConnections = {
    id: number;
    remote_controller_id?: number;
    drone_id?: number;
}[];


export type ApiType_WorkspaceConnectionsPost = {
    name: string;
}


export type ApiType_WorkspaceConnectionsPostResponse = {
    connection_id: number;
    secret: string;
}


export type ApiType_Connection = {
    id: number;
    remote_controller_id?: number;
    drone_id?: number;
}


export type ApiType_RemoteController = {
    id: number;
    serial_number: string;
    /**
     * 0 = dji rc pro enterprise, 1 = dji rc plus
     */
    type: number;
}


/**
 * 0 = dji rc pro enterprise, 1 = dji rc plus
 */
export type ApiType_RemoteControllerType = number;


export type ApiType_RemoteControllerPosition = {
    longitude: number;
    latitude: number;
    height: number;
    /**
     * ISO 8601 format
     */
    reported_at: string;
}


export type ApiType_Drone = {
    id: number;
    serial_number: string;
    /**
     * 0 = dji mavic 3
     */
    type: number;
    name: string;
}


/**
 * 0 = dji mavic 3
 */
export type ApiType_DroneType = number;


export type ApiType_DronePosition = {
    longitude: number;
    latitude: number;
    height: number;
    /**
     * ISO 8601 format
     */
    reported_at: string;
}


export type ApiType_ConnectionLinkAuthLoginPost = {
    connection_id: string;
    secret: string;
}


export type ApiType_ConnectionLinkMyWorkspace = {
    id: string;
    name: string;
}


export type ApiType_ConnectionLinkDjiPilot2SdkConfig = {
    app_id: string;
    app_key: string;
    app_license: string;
}


