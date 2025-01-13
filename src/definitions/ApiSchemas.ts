import {JSONSchema} from 'json-schema-to-typescript'

export const ApiSchema_Id : JSONSchema  = {
    "type": "number",
    "example": 42
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

export const ApiSchema_WorkspaceConnections : JSONSchema  = {
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
    "required": [
        "id"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
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
        "rtmp_url"
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
        }
    }
}

