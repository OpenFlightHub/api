export type DBType_User_StateType = 0|1|2|3
export const DBType_User_STATES = {
  invited: 0,
  live: 1,
  locked: 2,
  deleted: 3
} as const
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


export type DBType_Workspace_Permission = {
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


export type DBType_Remote_Controller_TypeType = 0|1|2|3|4
export const DBType_Remote_Controller_TYPES = {
  unknown: 0,
  dji_rc_plus: 1,
  dji_rc_pro_enterprise: 2,
  dji_rc_plus_2: 3,
  dji_smart_controller: 4
} as const
export type DBType_Remote_Controller = {
    id: number;
    serial_number: string;
    /**
     * 0 = unknown, 1 = dji rc plus, 2 = dji rc pro enterprise, 3 = dji rc plus 2, 4 = dji smart controller
     */
    type: DBType_Remote_Controller_TypeType;
}


export type DBType_Drone_TypeType = 0|1|2|3|4
export const DBType_Drone_TYPES = {
  unknown: 0,
  dji_matrice_300: 1,
  dji_matrice_30: 2,
  dji_matrice_350: 3,
  dji_mavic_3: 4
} as const
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
    workspace_id: number;
    started_at: string;
    /**
     * when drone lands
     */
    landed_at?: string;
    ended_at?: string;
}


export type DBType_Flight_Data_TypeType = 0
export const DBType_Flight_Data_TYPES = {
  position: 0
} as const
export type DBType_Flight_Data = {
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
    type: DBType_Flight_Data_TypeType;
    data: any;
}


export type DBType_Remote_Controller_Data_TypeType = 0
export const DBType_Remote_Controller_Data_TYPES = {
  position: 0
} as const
export type DBType_Remote_Controller_Data = {
    id: number;
    remote_controller_id: number;
    /**
     * 0 = position
     */
    type: DBType_Remote_Controller_Data_TypeType;
    data: any;
    created_at: string;
}


export type DBType_Drone_Data_TypeType = 0|1
export const DBType_Drone_Data_TYPES = {
  position: 0,
  telemetry: 1
} as const
export type DBType_Drone_Data = {
    id: number;
    drone_id: number;
    flight_id: number;
    /**
     * 0 = position, 1 = telemetry
     */
    type: DBType_Drone_Data_TypeType;
    data: any;
    created_at: string;
}


export type DBType_Drone_Media_TypeType = 0|1|2
export const DBType_Drone_Media_TYPES = {
  video: 0,
  picture: 1,
  panorama: 2
} as const
export type DBType_Drone_Media = {
    id: number;
    drone_id: number;
    flight_id: number;
    /**
     * 0 = video, 1 = picture, 2 = panorama
     */
    type: DBType_Drone_Media_TypeType;
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




export type DBType_Geo_Object = DBType_Geo_Object_Base<0, 0> | DBType_Geo_Object_Base<0, 1> | DBType_Geo_Object_Base<0, 2> | DBType_Geo_Object_Base<0, 3> |
DBType_Geo_Object_Base<1, 0> | DBType_Geo_Object_Base<1, 1> | DBType_Geo_Object_Base<1, 2> | DBType_Geo_Object_Base<1, 3> | DBType_Geo_Object_Base<1, 4> |
DBType_Geo_Object_Base<2, 0> | DBType_Geo_Object_Base<2, 1> | DBType_Geo_Object_Base<2, 2> | DBType_Geo_Object_Base<2, 3> | DBType_Geo_Object_Base<2, 4> | DBType_Geo_Object_Base<2, 5> | DBType_Geo_Object_Base<2, 6>

export type DBType_Geo_Object_Base<type extends DBType_Geo_Object_TypeType, sub_type extends DBType_Geo_Object_SubTypeType<type>> = {
    id: number;
    uuid: string;
    workspace_id: number;
    name: string;
    type: type;
    sub_type: sub_type;
    config: DBType_Geo_Object_ConfigType<type, sub_type>;
    created_at: string;
    updated_at: string;
}


export type DBType_Geo_Object_TypeType = 0|1|2

export const DBType_Geo_Object_Type_TYPES = {
  marking: 0,
  traffic: 1,
  unit: 2
} as const

export type DBType_Geo_Object_SubTypeType<type extends DBType_Geo_Object_TypeType> =
    type extends 0 ? (0|1|2|3) :
    type extends 1 ? (0|1|2|3|4|5) :
    type extends 2 ? (0|1|2|3|4|5|6) : unknown


export const DBType_Geo_Object_SubType_TYPES = {
  marking: {
    point: 0,
    line: 1,
    polygon: 2,
    circle: 3
  },
  traffic: {
    airplane: 0,
    helicopter: 1,
    uav: 2,
    gliding: 3,
    other: 4
  },
  unit: {
    airplane: 0,
    helicopter: 1,
    uav: 2,
    pilot: 3,
    ground_vehicle: 4,
    ground_staff: 5,
    other: 6
  }
} as const

export type DBType_Geo_Object_ConfigType<type extends DBType_Geo_Object_TypeType, sub_type extends DBType_Geo_Object_SubTypeType<type>> = type extends 0 ? (
    sub_type extends 0 ? {point: [number, number, number], color: string} :
    sub_type extends 1 ? {line: [number, number, number][], color: string} :
    sub_type extends 2 ? {polygon: [number, number, number][], color: string} :
    sub_type extends 3 ? {center: [number, number, number], radius: number, color: string} : unknown
) : type extends 1 ? (
    {longitude: number, latitude: number, height: number, heading?: number, speed?: number}
) : type extends 2 ? (
    {longitude: number, latitude: number, symbol: string, height?: number, heading?: number, speed?: number}
) : unknown