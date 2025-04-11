export type DBType_User_StateType = 0|1|2|3
export const DBType_User_STATES = {
  invited: 0 as DBType_User_StateType,
  live: 1 as DBType_User_StateType,
  locked: 2 as DBType_User_StateType,
  deleted: 3 as DBType_User_StateType
}
export type DBType_User = {
  id: number;
  name: string;
  /**
   * encrypted
   */
  email: string;
  /**
   * bcrypt hash
   */
  email_hash: string;
  /**
   * scrypt hash base64 encoded
   */
  password?: string;
  /**
   * some unique token
   */
  login_token?: string;
  /**
   * some unique token
   */
  session_token?: string;
  /**
   * some unique token
   */
  stream_token?: string;
  /**
   * some unique token
   */
  reset_code?: string;
  created_at: string;
  /**
   * 0 = invited, 1 = live, 2 = locked, 3 = deleted
   */
  state: DBType_User_StateType;
  locale: string;
}


export type DBType_File = {
  id: number;
  workspace_id: number;
  ext: string;
  /**
   * full original name including extension
   */
  name: string;
  created_at: string;
  created_by: number;
}


export type DBType_Workspace = {
  id: number;
  name: string;
}


export type DBType_WorkspacePermission = {
  user_id: number;
  workspace_id: number;
}


export type DBType_Connection = {
  id: number;
  name: string;
  /**
   * used as credential together with id
   */
  secret: string;
  session_token?: string;
  workspace_id: number;
  /**
   * used for dji pilot 2 communication, format: xxxxxxxx-0000-42ae-84e6-123456789abc where xxx is the workspace_id like "00000001", the rest is random
   */
  workspace_uuid: string;
  remote_controller_id?: number;
  /**
   * the "currently" connected drone (does not mean, the drone is currently online)
   */
  last_drone_id?: number;
}


export type DBType_RemoteController_TypeType = 0|1|2|3|4
export const DBType_RemoteController_TYPES = {
  unknown: 0 as DBType_RemoteController_TypeType,
  dji_rc_plus: 1 as DBType_RemoteController_TypeType,
  dji_rc_pro_enterprise: 2 as DBType_RemoteController_TypeType,
  dji_rc_plus_2: 3 as DBType_RemoteController_TypeType,
  dji_smart_controller: 4 as DBType_RemoteController_TypeType
}
export type DBType_RemoteController = {
  id: number;
  serial_number: string;
  /**
   * 0 = unknown, 1 = dji rc plus, 2 = dji rc pro enterprise, 3 = dji rc plus 2, 4 = dji smart controller
   */
  type: DBType_RemoteController_TypeType;
}


export type DBType_Drone_TypeType = 0|1|2|3|4
export const DBType_Drone_TYPES = {
  unknown: 0 as DBType_Drone_TypeType,
  dji_matrice_300: 1 as DBType_Drone_TypeType,
  dji_matrice_30: 2 as DBType_Drone_TypeType,
  dji_matrice_350: 3 as DBType_Drone_TypeType,
  dji_mavic_3: 4 as DBType_Drone_TypeType
}
export type DBType_Drone = {
  id: number;
  serial_number: string;
  name: string;
  /**
   * 0 = unknown, 1 = dji matrice 300, 2 = dji matrice 30, 3 = dji matrice 350, 4 = dji mavic 3
   */
  type: DBType_Drone_TypeType;
  last_connection_id?: number;
}


export type DBType_RemoteControllerData_TypeType = 0
export const DBType_RemoteControllerData_TYPES = {
  todo: 0 as DBType_RemoteControllerData_TypeType
}
export type DBType_RemoteControllerData = {
  id: number;
  remote_controller_id: number;
  /**
   * 0 = todo
   */
  type: DBType_RemoteControllerData_TypeType;
  data: {
    [k: string]: unknown;
  };
  created_at: string;
}


export type DBType_DroneData_TypeType = 0|1
export const DBType_DroneData_TYPES = {
  position: 0 as DBType_DroneData_TypeType,
  telemetry: 1 as DBType_DroneData_TypeType
}
export type DBType_DroneData = {
  id: number;
  drone_id: number;
  /**
   * 0 = position, 1 = telemetry
   */
  type: DBType_DroneData_TypeType;
  data: {
    [k: string]: unknown;
  };
  created_at: string;
}


export type DBType_DroneMedia_TypeType = 0|1|2
export const DBType_DroneMedia_TYPES = {
  video: 0 as DBType_DroneMedia_TypeType,
  picture: 1 as DBType_DroneMedia_TypeType,
  panorama: 2 as DBType_DroneMedia_TypeType
}
export type DBType_DroneMedia = {
  id: number;
  drone_id: number;
  /**
   * 0 = video, 1 = picture, 2 = panorama
   */
  type: DBType_DroneMedia_TypeType;
  file_id: number;
  fingerprint: string;
  tiny_fingerprint: string;
  /**
   * json encoded meta data
   */
  meta?: string;
}


