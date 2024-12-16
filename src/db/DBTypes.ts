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
  reset_code?: string;
  created_at: string;
  /**
   * 0 = invited, 1 = live, 2 = locked, 3 = deleted
   */
  state: DBType_User_StateType;
  locale: string;
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
  /**
   * used as credential together with id
   */
  access_key: string;
  workspace_id: number;
  remote_controller_id?: number;
  drone_id?: number;
}


export type DBType_RemoteController_TypeType = 0|1
export const DBType_RemoteController_TYPES = {
  dji_rc_pro_enterprise: 0 as DBType_RemoteController_TypeType,
  dji_rc_plus: 1 as DBType_RemoteController_TypeType
}
export type DBType_RemoteController = {
  id: number;
  serial_number: string;
  /**
   * 0 = dji rc pro enterprise, 1 = dji rc plus
   */
  type: DBType_RemoteController_TypeType;
}


export type DBType_Drone_TypeType = 0
export const DBType_Drone_TYPES = {
  dji_mavic_3: 0 as DBType_Drone_TypeType
}
export type DBType_Drone = {
  id: number;
  serial_number: string;
  name: string;
  /**
   * 0 = dji mavic 3
   */
  type: DBType_Drone_TypeType;
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


export type DBType_DroneData_TypeType = 0
export const DBType_DroneData_TYPES = {
  todo: 0 as DBType_DroneData_TypeType
}
export type DBType_DroneData = {
  id: number;
  drone_id: number;
  /**
   * 0 = todo
   */
  type: DBType_DroneData_TypeType;
  data: {
    [k: string]: unknown;
  };
  created_at: string;
}


