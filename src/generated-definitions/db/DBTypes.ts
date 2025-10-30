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
    has_thumbnail: boolean;
    thumbnail_generation_has_failed: boolean;
    /**
     * json encoded exif data
     */
    exif_data?: string;
    exif_data_generation_has_failed: boolean;
}


export type DBType_Workspace = {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
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
     * the "currently" connected drone (does not mean that the drone is currently online)
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
    /**
     * should never every be null
     */
    current_flight_id?: number;
    in_flight: boolean;
}


export type DBType_Flight = {
    id: number;
    drone_id: number;
    started_at: string;
    /**
     * when drone lands
     */
    landed_at?: string;
    ended_at?: string;
}


export type DBType_FlightData_TypeType = 0
export const DBType_FlightData_TYPES = {
  position: 0 as DBType_FlightData_TypeType
}
export type DBType_FlightData = {
    id: number;
    flight_id: number;
    /**
     * when stored in db
     */
    received_at: string;
    /**
     * when drone created the data
     */
    created_at: string;
    /**
     * 0 = position
     */
    type: DBType_FlightData_TypeType;
    data: {
        [k: string]: unknown;
    };
}


export type DBType_RemoteControllerData_TypeType = 0
export const DBType_RemoteControllerData_TYPES = {
  position: 0 as DBType_RemoteControllerData_TypeType
}
export type DBType_RemoteControllerData = {
    id: number;
    remote_controller_id: number;
    /**
     * 0 = position
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
    flight_id: number;
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
    flight_id: number;
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
    captured_at?: string;
    /**
     * when stored in db
     */
    received_at: string;
    /**
     * json encoded coverage data
     */
    coverage?: string;
    coverage_generated_at: string;
    /**
     * json encoded {position: {longitude: number, latitude: number}, height: number}
     */
    camera_location?: string;
    /**
     * json encoded {heading: number, pitch: number, roll: number}
     */
    camera_angles?: string;
}


export type DBType_GeoObject_TypeType = 0|1|2
export const DBType_GeoObject_TYPES = {
  marking: 0 as DBType_GeoObject_TypeType,
  traffic: 1 as DBType_GeoObject_TypeType,
  unit: 2 as DBType_GeoObject_TypeType
}
export type DBType_GeoObject_SubTypeType = 0|1|2|3|1|2|3|4|5|1|2|3|4|5|6|7
export const DBType_GeoObject_SUB_TYPES = {
  marking_point: 0 as DBType_GeoObject_SubTypeType,
  marking_line: 1 as DBType_GeoObject_SubTypeType,
  marking_polygon: 2 as DBType_GeoObject_SubTypeType,
  marking_circle: 3 as DBType_GeoObject_SubTypeType,
  traffic_airplane: 1 as DBType_GeoObject_SubTypeType,
  traffic_helicopter: 2 as DBType_GeoObject_SubTypeType,
  traffic_uav: 3 as DBType_GeoObject_SubTypeType,
  traffic_gliding: 4 as DBType_GeoObject_SubTypeType,
  traffic_other: 5 as DBType_GeoObject_SubTypeType,
  unit_aircraft: 1 as DBType_GeoObject_SubTypeType,
  unit_helicopter: 2 as DBType_GeoObject_SubTypeType,
  unit_uav: 3 as DBType_GeoObject_SubTypeType,
  unit_pilot: 4 as DBType_GeoObject_SubTypeType,
  unit_ground_vehicle: 5 as DBType_GeoObject_SubTypeType,
  unit_ground_staff: 6 as DBType_GeoObject_SubTypeType,
  unit_other: 7 as DBType_GeoObject_SubTypeType
}
export type DBType_GeoObject = {
    id: number;
    uuid: string;
    workspace_id: number;
    name: string;
    /**
     * 0 = marking, 1 = traffic, 2 = unit
     */
    type: DBType_GeoObject_TypeType;
    /**
     * marking: 0 = point, 1 = line, 2 = polygon, 3 = circle; traffic: 1 = airplane, 2 = helicopter, 3 = uav, 4 = gliding, 5 = other; unit: 1 = aircraft, 2 = helicopter, 3 = uav, 4 = pilot, 5 = ground_vehicle, 6 = ground_staff, 7 = other
     */
    sub_type: DBType_GeoObject_SubTypeType;
    /**
     * json
     */
    config: string;
    created_at: string;
    updated_at: string;
}


