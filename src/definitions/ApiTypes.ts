export type ApiType_Id = number;


export type ApiType_Uuid = string;


/**
 * Time in milliseconds since Unix Epoch time (January 1st, 1970 )
 */
export type ApiType_Unixms = number;


/**
 * ISO 8601 format with a timezone
 */
export type ApiType_Timestamptz = string;


/**
 * ISO 8601 format without a timezone
 */
export type ApiType_Timestamp = string;


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


/**
 * @deprecated
 */
export interface ApiType_AuthRegisterPost {
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


export type ApiType_AuthStreamToken = {
    token: string;
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
     * ISO 8601 format with a timezone
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


export type ApiType_File = {
    id: number;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * if a thumbnail is available at /file/thumbnail/
     */
    has_thumbnail: boolean;
}


export type ApiType_FileGetMultiple = {
    id: number;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * if a thumbnail is available at /file/thumbnail/
     */
    has_thumbnail: boolean;
}[];


export type ApiType_FileGetMultiplePost = {
    ids: number[];
}


export type ApiType_Workspace = {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
}


export type ApiType_WorkspacePatch = {
    name?: string;
}


export type ApiType_WorkspacesPost = {
    name: string;
    longitude: number;
    latitude: number;
}


export type ApiType_WorkspaceFiles = {
    id: number;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * if a thumbnail is available at /file/thumbnail/
     */
    has_thumbnail: boolean;
}[];


export type ApiType_WorkspaceFilePost = {
    file: string;
    filename: string;
}


export type ApiType_WorkspaceFilePatch = {
    filename?: string;
}


export type ApiType_WorkspaceConnections = {
    id: number;
    name: string;
    remote_controller_id?: number;
    drone_id?: number;
}[];


export type ApiType_WorkspaceConnectionsPost = {
    name: string;
}


export type ApiType_WorkspaceConnectionsPostResponse = {
    connection_id: string;
    secret: string;
}


/**
 * property `drone_id`: the currently connected drone (does not mean that the drone is currently online)
 */
export interface ApiType_Connection {
    id: number;
    name: string;
    remote_controller_id?: number;
    drone_id?: number;
}


export type ApiType_WorkspaceMapElementsGet = (
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          latitude: number;
          longitude: number;
          elevation?: number;
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          coordinates: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[];
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          coordinates: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[][];
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          latitude: number;
          longitude: number;
          radius: number;
          [k: string]: unknown;
      })
)[];


export type ApiType_MapElementCreateBase = {
    uuid?: string;
    name: string;
    color: string;
}


export type ApiType_WorkspaceMapElementsCreatePoint = {
    uuid?: string;
    name: string;
    color: string;
} & {
    longitude: number;
    latitude: number;
    elevation?: number;
    [k: string]: unknown;
};


export type ApiType_WorkspaceMapElementsCreateLine = {
    uuid?: string;
    name: string;
    color: string;
} & {
    coordinates: {
        longitude: number;
        latitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[];
    [k: string]: unknown;
};


export type ApiType_WorkspaceMapElementsCreatePolygon = {
    uuid?: string;
    name: string;
    color: string;
} & {
    coordinates: {
        longitude: number;
        latitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[][];
    [k: string]: unknown;
};


export type ApiType_WorkspaceMapElementsCreateCircle = {
    uuid?: string;
    name: string;
    color: string;
} & {
    longitude: number;
    latitude: number;
    radius: number;
    [k: string]: unknown;
};


export type ApiType_WorkspaceMapElementPatch =
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          latitude?: number;
          longitude?: number;
          elevation?: number;
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          coordinates?: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[];
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          coordinates?: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[][];
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          latitude?: number;
          longitude?: number;
          radius?: number;
          [k: string]: unknown;
      });


export type ApiType_MapElement =
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          latitude: number;
          longitude: number;
          elevation?: number;
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          coordinates: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[];
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          coordinates: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[][];
          [k: string]: unknown;
      })
    | ({
          id: number;
          uuid: string;
          name: string;
          /**
           * ISO 8601 format with a timezone
           */
          created_at: string;
          /**
           * ISO 8601 format with a timezone
           */
          updated_at: string;
          /**
           * 0 = point, 1 = line, 2 = polygon
           */
          type: number;
          color: string;
          [k: string]: unknown;
      } & {
          type?: number;
          latitude: number;
          longitude: number;
          radius: number;
          [k: string]: unknown;
      });


export type ApiType_MapElementBase = {
    id: number;
    uuid: string;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    updated_at: string;
    /**
     * 0 = point, 1 = line, 2 = polygon
     */
    type: number;
    color: string;
}


export type ApiType_MapElementPoint = {
    id: number;
    uuid: string;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    updated_at: string;
    /**
     * 0 = point, 1 = line, 2 = polygon
     */
    type: number;
    color: string;
} & {
    type?: number;
    latitude: number;
    longitude: number;
    elevation?: number;
    [k: string]: unknown;
};


export type ApiType_MapElementLine = {
    id: number;
    uuid: string;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    updated_at: string;
    /**
     * 0 = point, 1 = line, 2 = polygon
     */
    type: number;
    color: string;
} & {
    type?: number;
    coordinates: {
        latitude: number;
        longitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[];
    [k: string]: unknown;
};


export type ApiType_MapElementPolygon = {
    id: number;
    uuid: string;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    updated_at: string;
    /**
     * 0 = point, 1 = line, 2 = polygon
     */
    type: number;
    color: string;
} & {
    type?: number;
    coordinates: {
        latitude: number;
        longitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[][];
    [k: string]: unknown;
};


export type ApiType_MapElementCircle = {
    id: number;
    uuid: string;
    name: string;
    /**
     * ISO 8601 format with a timezone
     */
    created_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    updated_at: string;
    /**
     * 0 = point, 1 = line, 2 = polygon
     */
    type: number;
    color: string;
} & {
    type?: number;
    latitude: number;
    longitude: number;
    radius: number;
    [k: string]: unknown;
};


export type ApiType_MapElementPatch =
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          latitude?: number;
          longitude?: number;
          elevation?: number;
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          coordinates?: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[];
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          coordinates?: {
              latitude: number;
              longitude: number;
              elevation?: number;
              [k: string]: unknown;
          }[][];
          [k: string]: unknown;
      })
    | ({
          name?: string;
          color?: string;
          [k: string]: unknown;
      } & {
          latitude?: number;
          longitude?: number;
          radius?: number;
          [k: string]: unknown;
      });


export type ApiType_MapElementPatchBase = {
    name?: string;
    color?: string;
}


export type ApiType_MapElementPointPatch = {
    name?: string;
    color?: string;
} & {
    latitude?: number;
    longitude?: number;
    elevation?: number;
    [k: string]: unknown;
};


export type ApiType_MapElementLinePatch = {
    name?: string;
    color?: string;
} & {
    coordinates?: {
        latitude: number;
        longitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[];
    [k: string]: unknown;
};


export type ApiType_MapElementPolygonPatch = {
    name?: string;
    color?: string;
} & {
    coordinates?: {
        latitude: number;
        longitude: number;
        elevation?: number;
        [k: string]: unknown;
    }[][];
    [k: string]: unknown;
};


export type ApiType_MapElementCirclePatch = {
    name?: string;
    color?: string;
} & {
    latitude?: number;
    longitude?: number;
    radius?: number;
    [k: string]: unknown;
};


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
     * ISO 8601 format with a timezone
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
    last_connection_id?: number;
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
     * ISO 8601 format with a timezone
     */
    reported_at: string;
}


export type ApiType_DroneBattery = {
    capacity_percent_left: number;
    /**
     * ISO 8601 format with a timezone
     */
    reported_at: string;
}


export type ApiType_DroneMedia = {
    id: number;
    drone_id: number;
    flight_id: number;
    /**
     * 0 = image, 1 = video
     */
    type: number;
    /**
     * see `/file` endpoint
     */
    file_id: number;
    file_name: string;
    /**
     * ISO 8601 format with a timezone
     */
    received_at: string;
    meta?: string;
    /**
     * ISO 8601 format with a timezone
     */
    captured_at?: string;
    camera_location?: {
        position?: {
            longitude: number;
            latitude: number;
        };
        height?: number;
    };
    camera_angles?: {
        heading?: number;
        pitch?: number;
        roll?: number;
    };
}[];


export type ApiType_DroneFlights = {
    id: number;
    drone_id: number;
    /**
     * ISO 8601 format with a timezone
     */
    started_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    landed_at?: string;
    /**
     * ISO 8601 format with a timezone
     */
    ended_at?: string;
    track: {
        height: number;
        longitude: number;
        latitude: number;
        /**
         * ISO 8601 format with a timezone
         */
        time?: string;
    }[];
}[];


export type ApiType_Flight = {
    id: number;
    drone_id: number;
    /**
     * ISO 8601 format with a timezone
     */
    started_at: string;
    /**
     * ISO 8601 format with a timezone
     */
    landed_at?: string;
    /**
     * ISO 8601 format with a timezone
     */
    ended_at?: string;
    track: {
        height: number;
        longitude: number;
        latitude: number;
        /**
         * ISO 8601 format with a timezone
         */
        time?: string;
    }[];
}


export type ApiType_FlightMedia = {
    id: number;
    drone_id: number;
    flight_id: number;
    /**
     * 0 = image, 1 = video
     */
    type: number;
    /**
     * see `/file` endpoint
     */
    file_id: number;
    file_name: string;
    /**
     * ISO 8601 format with a timezone
     */
    received_at: string;
    meta?: string;
    /**
     * ISO 8601 format with a timezone
     */
    captured_at?: string;
    camera_location?: {
        position?: {
            longitude: number;
            latitude: number;
        };
        height?: number;
    };
    camera_angles?: {
        heading?: number;
        pitch?: number;
        roll?: number;
    };
}[];


export type ApiType_Media = {
    id: number;
    drone_id: number;
    flight_id: number;
    /**
     * 0 = image, 1 = video
     */
    type: number;
    /**
     * see `/file` endpoint
     */
    file_id: number;
    file_name: string;
    /**
     * ISO 8601 format with a timezone
     */
    received_at: string;
    meta?: string;
    /**
     * ISO 8601 format with a timezone
     */
    captured_at?: string;
    camera_location?: {
        position?: {
            longitude: number;
            latitude: number;
        };
        height?: number;
    };
    camera_angles?: {
        heading?: number;
        pitch?: number;
        roll?: number;
    };
}


export type ApiType_MediaGroundCoverage = {
    coverage: {
        all: {
            position: {
                /**
                 * in degree
                 */
                longitude: number;
                /**
                 * in degree
                 */
                latitude: number;
            };
            /**
             * in meters
             */
            elevation: number;
            /**
             * for debugging only
             */
            debug?: string;
            ray?: {
                bearing: number;
                pitch: number;
                imagePosition: {
                    x: number;
                    y: number;
                };
            };
            directDistance?: number;
            meterSize?: {
                vertical: number;
                horizontal: number;
            };
        }[];
        outer: {
            position: {
                /**
                 * in degree
                 */
                longitude: number;
                /**
                 * in degree
                 */
                latitude: number;
            };
            /**
             * in meters
             */
            elevation: number;
            /**
             * for debugging only
             */
            debug?: string;
            ray?: {
                bearing: number;
                pitch: number;
                imagePosition: {
                    x: number;
                    y: number;
                };
            };
            directDistance?: number;
            meterSize?: {
                vertical: number;
                horizontal: number;
            };
        }[];
        holes: {
            position: {
                /**
                 * in degree
                 */
                longitude: number;
                /**
                 * in degree
                 */
                latitude: number;
            };
            /**
             * in meters
             */
            elevation: number;
            /**
             * for debugging only
             */
            debug?: string;
            ray?: {
                bearing: number;
                pitch: number;
                imagePosition: {
                    x: number;
                    y: number;
                };
            };
            directDistance?: number;
            meterSize?: {
                vertical: number;
                horizontal: number;
            };
        }[][];
    };
}


export type ApiType_GroundCoverageLocation = {
    position: {
        /**
         * in degree
         */
        longitude: number;
        /**
         * in degree
         */
        latitude: number;
    };
    /**
     * in meters
     */
    elevation: number;
    /**
     * for debugging only
     */
    debug?: string;
    ray?: {
        bearing: number;
        pitch: number;
        imagePosition: {
            x: number;
            y: number;
        };
    };
    directDistance?: number;
    meterSize?: {
        vertical: number;
        horizontal: number;
    };
}


export type ApiType_ConnectionLinkAuthLoginPost = {
    connection_id: string;
    secret: string;
}


export type ApiType_ConnectionLinkConfig = {
    connection_id: string;
    platform_name: string;
    platform_url: string;
    workspace_id: string;
    workspace_uuid: string;
    workspace_name: string;
    secret: string;
}


export type ApiType_ConnectionLinkDjiPilot2SdkConfig = {
    app_id: string;
    app_key: string;
    app_license: string;
    mqtt_url: string;
    rtmp_url: string;
    api_url: string;
    ws_url: string;
}


export type ApiType_DjiPilot2ApiMediaFastUploadPost = {
    ext?: {
        drone_model_key: string;
        is_original: boolean;
        payload_model_key: string;
        tinny_fingerprint: string;
        sn: string;
    };
    fingerprint: string;
    name?: string;
    path?: string;
}


export type ApiType_DjiPilot2ApiMediaFastUploadPostResponse = {
    /**
     * 0 = success
     */
    code: number;
    message: string;
    data: {};
}


/**
 * TODO what is the format? documentation does not say
 */
export interface ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPost {}


export type ApiType_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse = {
    /**
     * 0 = success
     */
    code: number;
    message: string;
    data: {
        tiny_fingerprints: string[];
    };
}


export type ApiType_DjiPilot2ApiMediaStsPostResponse = {
    /**
     * 0 = success
     */
    code: number;
    message: string;
    data: {
        bucket: string;
        credentials: {
            access_key_id: string;
            access_key_secret: string;
            expire?: number;
            security_token?: string;
        };
        endpoint: string;
        object_key_prefix: string;
        /**
         * can be `ali`, `aws` or `minio`
         */
        provider: string;
        region: string;
    };
}


export type ApiType_DjiPilot2ApiMediaUploadCallbackPost = {
    /**
     * non-zero means failure
     */
    result?: number;
    name: string;
    object_key: string;
    path?: string;
    sub_file_type?: number;
    ext?: {
        file_group_id?: string;
        /**
         * device product enum
         */
        drone_model_key?: string;
        is_original?: boolean;
        /**
         * payload product enum
         */
        payload_model_key?: string;
        /**
         * TODO check if tinny is spelled correctly
         */
        tinny_fingerprint?: string;
        sn?: string;
    };
    fingerprint?: string;
    metadata?: {
        absolute_altitude?: number;
        created_time?: string;
        gimbal_yaw_degree?: number;
        relative_altitude?: number;
        shoot_position?: {
            lat?: number;
            lng?: number;
        };
    };
}


export type ApiType_DjiPilot2ApiMediaUploadCallbackPostResponse = {
    /**
     * 0 = success
     */
    code: number;
    message: string;
    data: {
        object_key: string;
    };
}


export type ApiType_DjiPilot2ApiMediaGroupUploadCallbackPost = {
    file_group_id?: string;
    file_count: number;
    file_uploaded_count: number;
}


export type ApiType_DjiPilot2ApiMediaGroupUploadCallbackPostResponse = {
    /**
     * 0 = success
     */
    code: number;
    message: string;
    /**
     * TODO missing documentation
     */
    data: {};
}


export type ApiType_DjiPilot2ApiMapElementGroupsElementsPost = {
    id: string;
    name: string;
    /**
     * TODO missing documentation
     */
    resource: {
        /**
         * 0 = point, 1 = line, 2 = polygon, 7 = circle
         */
        type: number;
        content: {
            type: string;
            geometry: {};
            properties?: {};
        };
    };
}


export type ApiType_DjiPilot2ApiMapElementGroupsElementsPostResponse = {
    code: number;
    message: string;
    data: {
        id: string;
    };
}


export type ApiType_DjiPilot2ApiMapElementGroupsGetResponse = {
    code: number;
    message: string;
    data: {
        id: string;
        name: string;
        /**
         * Time in milliseconds since Unix Epoch time (January 1st, 1970 )
         */
        create_time: number;
        /**
         * if locked, elements of this group can not be deleted/modified
         */
        is_lock: boolean;
        /**
         * 0 = custom element group, 1 = default element group, 2 = app shared element group (the only visible group on dji pilot 2 app)
         */
        type: number;
        elements: {
            id: string;
            name: string;
            /**
             * Time in milliseconds since Unix Epoch time (January 1st, 1970 )
             */
            create_time: number;
            /**
             * Time in milliseconds since Unix Epoch time (January 1st, 1970 )
             */
            update_time: number;
            resource: {
                /**
                 * 0 = point, 1 = line, 2 = polygon, 7 = circle
                 */
                type: number;
                content: {
                    /**
                     * geojson format
                     */
                    type: string;
                    properties: {
                        clampToGround: boolean;
                        is3d?: boolean;
                        /**
                         * only valid colors. BLUE: #2D8CF0, GREEN: #19BE6B, YELLOW: #FFBB00, RED: #E23C39, PURPLE: #B620E0
                         */
                        color: string;
                    };
                    geometry: {
                        /**
                         * geojson format
                         */
                        type: string;
                        /**
                         * geojson format
                         */
                        coordinates: number[];
                        radius?: number;
                    };
                };
            };
        }[];
    }[];
}


export type ApiType_DjiPilot2ApiMapElementsPut = {
    name: string;
    content: {
        type: string;
        geometry: {};
        properties: {};
    };
}


export type ApiType_DjiPilot2ApiMapElementsPutResponse = {
    code: number;
    message: string;
    data: {
        id: string;
    };
}


export type ApiType_DjiPilot2ApiMapElementsDeleteResponse = {
    code: number;
    message: string;
    data: {
        id: string;
    };
}


export type ApiType_DjiPilot2ApiManageDevicesTopologyResponse = {
    code: number;
    message: string;
    data: {
        list: {
            hosts: {
                device_callsign: string;
                device_model?: {
                    key: string;
                    domain: string;
                    type: string;
                    sub_type: string;
                };
                /**
                 * custom icon
                 */
                icon_urls?: {
                    normal_icon_url: string;
                    selected_icon_url: string;
                };
                online_status: boolean;
                sn: string;
                user_callsign: string;
                user_id: string;
            }[];
            parents: {
                device_callsign: string;
                device_model?: {
                    key: string;
                    domain: string;
                    type: string;
                    sub_type: string;
                };
                /**
                 * custom icon
                 */
                icon_urls?: {
                    normal_icon_url: string;
                    selected_icon_url: string;
                };
                online_status: boolean;
                sn: string;
                user_callsign: string;
                user_id: string;
            }[];
        }[];
    };
}


export type ApiType_DjiPilot2ApiManageDevicesTopologyDevice = {
    device_callsign: string;
    device_model?: {
        key: string;
        domain: string;
        type: string;
        sub_type: string;
    };
    /**
     * custom icon
     */
    icon_urls?: {
        normal_icon_url: string;
        selected_icon_url: string;
    };
    online_status: boolean;
    sn: string;
    user_callsign: string;
    user_id: string;
}


