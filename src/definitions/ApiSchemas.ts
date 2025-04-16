import {JSONSchema} from 'json-schema-to-typescript'

export const ApiSchema_Id : JSONSchema  = {
    "type": "number",
    "example": 42
}

export const ApiSchema_Uuid : JSONSchema  = {
    "type": "string",
    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
}

export const ApiSchema_Timestamptz : JSONSchema  = {
    "type": "string",
    "format": "timestamptz",
    "description": "ISO 8601 format",
    "example": "2023-12-11 23:06:52.7879+00"
}

export const ApiSchema_Email : JSONSchema  = {
    "type": "string",
    "example": "john.doe@example.com"
}

export const ApiSchema_Password : JSONSchema  = {
    "type": "string",
    "description": "Maximum length is 72 Bytes (utf-8).",
    "example": "j9876sa1kjhqsa6dtasd12="
}

export const ApiSchema_Reference : JSONSchema  = {
    "type": "object",
    "required": [
        "id"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        }
    }
}

export const ApiSchema_AuthLoginPost : JSONSchema  = {
    "type": "object",
    "required": [
        "username",
        "password"
    ],
    "properties": {
        "username": {
            "type": "string",
            "example": "john.doe@example.com"
        },
        "password": {
            "type": "string"
        }
    }
}

export const ApiSchema_AuthLoginWithTokenPost : JSONSchema  = {
    "type": "object",
    "required": [
        "token"
    ],
    "properties": {
        "token": {
            "type": "string"
        }
    }
}

export const ApiSchema_AuthRegisterPost : JSONSchema  = {
    "deprecated": true,
    "type": "object",
    "required": [
        "name",
        "email"
    ],
    "properties": {
        "email": {
            "type": "string",
            "example": "john.doe@example.com"
        },
        "password": {
            "type": "string",
            "description": "Maximum length is 72 Bytes (utf-8).",
            "example": "j9876sa1kjhqsa6dtasd12="
        }
    }
}

export const ApiSchema_AuthPasswordChangePost : JSONSchema  = {
    "type": "object",
    "required": [
        "current_password",
        "new_password"
    ],
    "properties": {
        "current_password": {
            "type": "string",
            "description": "Maximum length is 72 Bytes (utf-8).",
            "example": "j9876sa1kjhqsa6dtasd12="
        },
        "new_password": {
            "type": "string",
            "description": "Maximum length is 72 Bytes (utf-8).",
            "example": "j9876sa1kjhqsa6dtasd12="
        }
    }
}

export const ApiSchema_AuthPasswordResetPost : JSONSchema  = {
    "type": "object",
    "required": [
        "username"
    ],
    "properties": {
        "username": {
            "type": "string",
            "example": "john.doe@example.com"
        }
    }
}

export const ApiSchema_AuthPasswordSetInitialPost : JSONSchema  = {
    "type": "object",
    "required": [
        "new_password"
    ],
    "properties": {
        "new_password": {
            "type": "string",
            "description": "Maximum length is 72 Bytes (utf-8).",
            "example": "j9876sa1kjhqsa6dtasd12="
        }
    }
}

export const ApiSchema_AuthPasswordSetNewPost : JSONSchema  = {
    "type": "object",
    "required": [
        "new_password",
        "code"
    ],
    "properties": {
        "new_password": {
            "type": "string",
            "description": "Maximum length is 72 Bytes (utf-8).",
            "example": "j9876sa1kjhqsa6dtasd12="
        },
        "code": {
            "type": "string"
        }
    }
}

export const ApiSchema_AuthStreamToken : JSONSchema  = {
    "type": "object",
    "required": [
        "token"
    ],
    "properties": {
        "token": {
            "type": "string"
        }
    }
}

export const ApiSchema_User : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "name"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string",
            "example": "Harry Potter"
        }
    }
}

export const ApiSchema_UserSelf : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "name",
        "email",
        "created_at",
        "locale",
        "registration_incomplete"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string",
            "example": "Harry Potter"
        },
        "email": {
            "type": "string",
            "example": "john.doe@example.com"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "locale": {
            "type": "string",
            "example": "en-US"
        },
        "registration_incomplete": {
            "type": "boolean"
        }
    }
}

export const ApiSchema_UserPatch : JSONSchema  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "example": "Harry Potter"
        },
        "email": {
            "type": "string",
            "example": "john.doe@example.com"
        },
        "locale": {
            "type": "string",
            "example": "en-US"
        }
    }
}

export const ApiSchema_File : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "name",
        "created_at",
        "has_thumbnail"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "has_thumbnail": {
            "type": "boolean",
            "description": "if a thumbnail is available at /file/thumbnail/"
        }
    }
}

export const ApiSchema_Workspace : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "name"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspacePatch : JSONSchema  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspacesPost : JSONSchema  = {
    "type": "object",
    "required": [
        "name"
    ],
    "properties": {
        "name": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceFiles : JSONSchema  = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "id"
        ],
        "properties": {
            "id": {
                "type": "number",
                "example": 42
            }
        }
    }
}

export const ApiSchema_WorkspaceFilePost : JSONSchema  = {
    "type": "object",
    "required": [
        "file",
        "filename"
    ],
    "properties": {
        "file": {
            "type": "string",
            "format": "binary"
        },
        "filename": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceFilePatch : JSONSchema  = {
    "type": "object",
    "properties": {
        "filename": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceConnections : JSONSchema  = {
    "type": "array",
    "items": {
        "type": "object",
        "description": "property `drone_id`: the currently connected drone (does not mean that the drone is currently online)",
        "required": [
            "id",
            "name"
        ],
        "properties": {
            "id": {
                "type": "number",
                "example": 42
            },
            "name": {
                "type": "string"
            },
            "remote_controller_id": {
                "type": "number",
                "example": 42
            },
            "drone_id": {
                "type": "number",
                "example": 42
            }
        }
    }
}

export const ApiSchema_WorkspaceConnectionsPost : JSONSchema  = {
    "type": "object",
    "required": [
        "name"
    ],
    "properties": {
        "name": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceConnectionsPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "connection_id",
        "secret"
    ],
    "properties": {
        "connection_id": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        }
    }
}

export const ApiSchema_Connection : JSONSchema  = {
    "type": "object",
    "description": "property `drone_id`: the currently connected drone (does not mean that the drone is currently online)",
    "required": [
        "id",
        "name"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string"
        },
        "remote_controller_id": {
            "type": "number",
            "example": 42
        },
        "drone_id": {
            "type": "number",
            "example": 42
        }
    }
}

export const ApiSchema_RemoteController : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "serial_number",
        "type"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "serial_number": {
            "type": "string"
        },
        "type": {
            "type": "integer",
            "description": "0 = dji rc pro enterprise, 1 = dji rc plus"
        }
    }
}

export const ApiSchema_RemoteControllerType : JSONSchema  = {
    "type": "integer",
    "description": "0 = dji rc pro enterprise, 1 = dji rc plus"
}

export const ApiSchema_RemoteControllerPosition : JSONSchema  = {
    "type": "object",
    "required": [
        "longitude",
        "latitude",
        "height",
        "reported_at"
    ],
    "properties": {
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        },
        "height": {
            "type": "number"
        },
        "reported_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_Drone : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "serial_number",
        "type",
        "name"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "serial_number": {
            "type": "string"
        },
        "type": {
            "type": "integer",
            "description": "0 = dji mavic 3"
        },
        "name": {
            "type": "string"
        },
        "last_connection_id": {
            "type": "number",
            "example": 42
        }
    }
}

export const ApiSchema_DroneType : JSONSchema  = {
    "type": "integer",
    "description": "0 = dji mavic 3"
}

export const ApiSchema_DronePosition : JSONSchema  = {
    "type": "object",
    "required": [
        "longitude",
        "latitude",
        "height",
        "reported_at"
    ],
    "properties": {
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        },
        "height": {
            "type": "number"
        },
        "reported_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_DroneBattery : JSONSchema  = {
    "type": "object",
    "required": [
        "capacity_percent_left",
        "reported_at"
    ],
    "properties": {
        "capacity_percent_left": {
            "type": "number"
        },
        "reported_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_DroneMedia : JSONSchema  = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "id",
            "type",
            "file_id",
            "created_at",
            "drone_id",
            "file_name"
        ],
        "properties": {
            "id": {
                "type": "number",
                "example": 42
            },
            "drone_id": {
                "type": "number",
                "example": 42
            },
            "type": {
                "type": "number",
                "description": "0 = image, 1 = video"
            },
            "file_id": {
                "type": "number",
                "example": 42,
                "description": "see `/file` endpoint"
            },
            "file_name": {
                "type": "string"
            },
            "created_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "meta": {
                "type": "string"
            }
        }
    }
}

export const ApiSchema_Media : JSONSchema  = {
    "type": "object",
    "required": [
        "id",
        "type",
        "file_id",
        "created_at",
        "drone_id",
        "file_name"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "drone_id": {
            "type": "number",
            "example": 42
        },
        "type": {
            "type": "number",
            "description": "0 = image, 1 = video"
        },
        "file_id": {
            "type": "number",
            "example": 42,
            "description": "see `/file` endpoint"
        },
        "file_name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "meta": {
            "type": "string"
        }
    }
}

export const ApiSchema_MediaGroundCoverage : JSONSchema  = {
    "type": "object",
    "required": [
        "coverage"
    ],
    "properties": {
        "coverage": {
            "type": "object",
            "required": [
                "all",
                "outer",
                "holes"
            ],
            "properties": {
                "all": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "position",
                            "elevation"
                        ],
                        "properties": {
                            "position": {
                                "type": "object",
                                "required": [
                                    "longitude",
                                    "latitude"
                                ],
                                "properties": {
                                    "longitude": {
                                        "type": "number",
                                        "description": "in degree"
                                    },
                                    "latitude": {
                                        "type": "number",
                                        "description": "in degree"
                                    }
                                }
                            },
                            "elevation": {
                                "type": "number",
                                "description": "in meters"
                            },
                            "debug": {
                                "type": "string",
                                "description": "for debugging only"
                            }
                        }
                    }
                },
                "outer": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "position",
                            "elevation"
                        ],
                        "properties": {
                            "position": {
                                "type": "object",
                                "required": [
                                    "longitude",
                                    "latitude"
                                ],
                                "properties": {
                                    "longitude": {
                                        "type": "number",
                                        "description": "in degree"
                                    },
                                    "latitude": {
                                        "type": "number",
                                        "description": "in degree"
                                    }
                                }
                            },
                            "elevation": {
                                "type": "number",
                                "description": "in meters"
                            },
                            "debug": {
                                "type": "string",
                                "description": "for debugging only"
                            }
                        }
                    }
                },
                "holes": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "position",
                                "elevation"
                            ],
                            "properties": {
                                "position": {
                                    "type": "object",
                                    "required": [
                                        "longitude",
                                        "latitude"
                                    ],
                                    "properties": {
                                        "longitude": {
                                            "type": "number",
                                            "description": "in degree"
                                        },
                                        "latitude": {
                                            "type": "number",
                                            "description": "in degree"
                                        }
                                    }
                                },
                                "elevation": {
                                    "type": "number",
                                    "description": "in meters"
                                },
                                "debug": {
                                    "type": "string",
                                    "description": "for debugging only"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_GroundCoverageLocation : JSONSchema  = {
    "type": "object",
    "required": [
        "position",
        "elevation"
    ],
    "properties": {
        "position": {
            "type": "object",
            "required": [
                "longitude",
                "latitude"
            ],
            "properties": {
                "longitude": {
                    "type": "number",
                    "description": "in degree"
                },
                "latitude": {
                    "type": "number",
                    "description": "in degree"
                }
            }
        },
        "elevation": {
            "type": "number",
            "description": "in meters"
        },
        "debug": {
            "type": "string",
            "description": "for debugging only"
        }
    }
}

export const ApiSchema_ConnectionLinkAuthLoginPost : JSONSchema  = {
    "type": "object",
    "required": [
        "connection_id",
        "secret"
    ],
    "properties": {
        "connection_id": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        }
    }
}

export const ApiSchema_ConnectionLinkConfig : JSONSchema  = {
    "type": "object",
    "required": [
        "connection_id",
        "workspace_id",
        "workspace_uuid",
        "workspace_name",
        "platform_name",
        "platform_url",
        "secret"
    ],
    "properties": {
        "connection_id": {
            "type": "string"
        },
        "platform_name": {
            "type": "string"
        },
        "platform_url": {
            "type": "string"
        },
        "workspace_id": {
            "type": "string"
        },
        "workspace_uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "workspace_name": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        }
    }
}

export const ApiSchema_ConnectionLinkDjiPilot2SdkConfig : JSONSchema  = {
    "type": "object",
    "required": [
        "app_id",
        "app_key",
        "app_license",
        "mqtt_url",
        "rtmp_url",
        "api_url"
    ],
    "properties": {
        "app_id": {
            "type": "string"
        },
        "app_key": {
            "type": "string"
        },
        "app_license": {
            "type": "string"
        },
        "mqtt_url": {
            "type": "string"
        },
        "rtmp_url": {
            "type": "string"
        },
        "api_url": {
            "type": "string"
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaFastUploadPost : JSONSchema  = {
    "type": "object",
    "required": [
        "fingerprint"
    ],
    "properties": {
        "ext": {
            "type": "object",
            "required": [
                "drone_model_key",
                "is_original",
                "payload_model_key",
                "tinny_fingerprint",
                "sn"
            ],
            "properties": {
                "drone_model_key": {
                    "type": "string"
                },
                "is_original": {
                    "type": "boolean"
                },
                "payload_model_key": {
                    "type": "string"
                },
                "tinny_fingerprint": {
                    "type": "string"
                },
                "sn": {
                    "type": "string"
                }
            }
        },
        "fingerprint": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "path": {
            "type": "string"
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "code",
        "message",
        "data"
    ],
    "properties": {
        "code": {
            "type": "number",
            "description": "0 = success"
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object"
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost : JSONSchema  = {
    "type": "object",
    "description": "TODO what is the format? documentation does not say"
}

export const ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "code",
        "message",
        "data"
    ],
    "properties": {
        "code": {
            "type": "number",
            "description": "0 = success"
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "tiny_fingerprints"
            ],
            "properties": {
                "tiny_fingerprints": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "example": "5aec4c6e78052bf38fab901bcd1a2319_2021_12_8_22_13_10"
                    }
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaStsPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "code",
        "message",
        "data"
    ],
    "properties": {
        "code": {
            "type": "number",
            "description": "0 = success"
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "bucket",
                "credentials",
                "endpoint",
                "object_key_prefix",
                "provider",
                "region"
            ],
            "properties": {
                "bucket": {
                    "type": "string"
                },
                "credentials": {
                    "type": "object",
                    "required": [
                        "access_key_id",
                        "access_key_secret"
                    ],
                    "properties": {
                        "access_key_id": {
                            "type": "string"
                        },
                        "access_key_secret": {
                            "type": "string"
                        },
                        "expire": {
                            "type": "number"
                        },
                        "security_token": {
                            "type": "string"
                        }
                    }
                },
                "endpoint": {
                    "type": "string"
                },
                "object_key_prefix": {
                    "type": "string"
                },
                "provider": {
                    "type": "string",
                    "description": "can be `ali`, `aws` or `minio`"
                },
                "region": {
                    "type": "string"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaUploadCallbackPost : JSONSchema  = {
    "type": "object",
    "required": [
        "name",
        "object_key"
    ],
    "properties": {
        "result": {
            "type": "integer",
            "description": "non-zero means failure"
        },
        "name": {
            "type": "string"
        },
        "object_key": {
            "type": "string"
        },
        "path": {
            "type": "string"
        },
        "sub_file_type": {
            "type": "number"
        },
        "ext": {
            "type": "object",
            "properties": {
                "file_group_id": {
                    "type": "string"
                },
                "drone_model_key": {
                    "type": "string",
                    "description": "device product enum"
                },
                "is_original": {
                    "type": "boolean"
                },
                "payload_model_key": {
                    "type": "string",
                    "description": "payload product enum"
                },
                "tinny_fingerprint": {
                    "type": "string",
                    "description": "TODO check if tinny is spelled correctly"
                },
                "sn": {
                    "type": "string"
                }
            }
        },
        "fingerprint": {
            "type": "string"
        },
        "metadata": {
            "type": "object",
            "properties": {
                "absolute_altitude": {
                    "type": "number"
                },
                "created_time": {
                    "type": "string"
                },
                "gimbal_yaw_degree": {
                    "type": "number"
                },
                "relative_altitude": {
                    "type": "number"
                },
                "shoot_position": {
                    "type": "object",
                    "properties": {
                        "lat": {
                            "type": "number"
                        },
                        "lng": {
                            "type": "number"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "code",
        "message",
        "data"
    ],
    "properties": {
        "code": {
            "type": "number",
            "description": "0 = success"
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "object_key"
            ],
            "properties": {
                "object_key": {
                    "type": "string"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPost : JSONSchema  = {
    "type": "object",
    "required": [
        "file_count",
        "file_uploaded_count"
    ],
    "properties": {
        "file_group_id": {
            "type": "string"
        },
        "file_count": {
            "type": "integer"
        },
        "file_uploaded_count": {
            "type": "integer"
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPostResponse : JSONSchema  = {
    "type": "object",
    "required": [
        "code",
        "message",
        "data"
    ],
    "properties": {
        "code": {
            "type": "number",
            "description": "0 = success"
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "description": "TODO missing documentation"
        }
    }
}

