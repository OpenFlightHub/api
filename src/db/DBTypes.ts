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


export type DBType_RemoteController = {
  id: number;
  serial_number: string;
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


