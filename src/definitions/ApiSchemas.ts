import {JSONSchema4} from '../util/types/JSONSchema'

export const ApiSchema_Id : JSONSchema4  = {
    "type": "number",
    "example": 42
}

export const ApiSchema_Uuid : JSONSchema4  = {
    "type": "string",
    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
}

export const ApiSchema_Unixms : JSONSchema4  = {
    "type": "number",
    "example": "1239213862",
    "description": "Time in milliseconds since Unix Epoch time (January 1st, 1970 )"
}

export const ApiSchema_Timestamptz : JSONSchema4  = {
    "type": "string",
    "format": "timestamptz",
    "description": "ISO 8601 format with a timezone",
    "example": "2023-12-11 23:06:52.7879+00"
}

export const ApiSchema_Timestamp : JSONSchema4  = {
    "type": "string",
    "format": "timestamptz",
    "description": "ISO 8601 format without a timezone",
    "example": "2023-12-11 23:06:52.7879"
}

export const ApiSchema_Email : JSONSchema4  = {
    "type": "string",
    "example": "john.doe@example.com"
}

export const ApiSchema_Password : JSONSchema4  = {
    "type": "string",
    "description": "Maximum length is 72 Bytes (utf-8).",
    "example": "j9876sa1kjhqsa6dtasd12="
}

export const ApiSchema_Reference : JSONSchema4  = {
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

export const ApiSchema_AuthLoginPost : JSONSchema4  = {
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

export const ApiSchema_AuthLoginWithTokenPost : JSONSchema4  = {
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

export const ApiSchema_AuthRegisterPost : JSONSchema4  = {
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

export const ApiSchema_AuthPasswordChangePost : JSONSchema4  = {
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

export const ApiSchema_AuthPasswordResetPost : JSONSchema4  = {
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

export const ApiSchema_AuthPasswordSetInitialPost : JSONSchema4  = {
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

export const ApiSchema_AuthPasswordSetNewPost : JSONSchema4  = {
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

export const ApiSchema_AuthStreamToken : JSONSchema4  = {
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

export const ApiSchema_User : JSONSchema4  = {
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

export const ApiSchema_UserSelf : JSONSchema4  = {
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
            "description": "ISO 8601 format with a timezone",
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

export const ApiSchema_UserPatch : JSONSchema4  = {
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

export const ApiSchema_File : JSONSchema4  = {
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
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "has_thumbnail": {
            "type": "boolean",
            "description": "if a thumbnail is available at /file/thumbnail/"
        }
    }
}

export const ApiSchema_FileGetMultiple : JSONSchema4  = {
    "type": "array",
    "items": {
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
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "has_thumbnail": {
                "type": "boolean",
                "description": "if a thumbnail is available at /file/thumbnail/"
            }
        }
    }
}

export const ApiSchema_FileGetMultiplePost : JSONSchema4  = {
    "type": "object",
    "required": [
        "ids"
    ],
    "properties": {
        "ids": {
            "type": "array",
            "items": {
                "type": "number",
                "example": 42
            }
        }
    }
}

export const ApiSchema_Workspace : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "name",
        "longitude",
        "latitude"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "name": {
            "type": "string"
        },
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        }
    }
}

export const ApiSchema_WorkspacePatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspacesPost : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "longitude",
        "latitude"
    ],
    "properties": {
        "name": {
            "type": "string"
        },
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        }
    }
}

export const ApiSchema_WorkspaceFiles : JSONSchema4  = {
    "type": "array",
    "items": {
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
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "has_thumbnail": {
                "type": "boolean",
                "description": "if a thumbnail is available at /file/thumbnail/"
            }
        }
    }
}

export const ApiSchema_WorkspaceFilePost : JSONSchema4  = {
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

export const ApiSchema_WorkspaceFilePatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "filename": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceConnections : JSONSchema4  = {
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

export const ApiSchema_WorkspaceConnectionsPost : JSONSchema4  = {
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

export const ApiSchema_WorkspaceConnectionsPostResponse : JSONSchema4  = {
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

export const ApiSchema_Connection : JSONSchema4  = {
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

export const ApiSchema_WorkspaceMapElementsGet : JSONSchema4  = {
    "type": "array",
    "items": {
        "anyOf": [
            {
                "type": "object",
                "required": [
                    "id",
                    "uuid",
                    "name",
                    "type",
                    "color",
                    "created_at",
                    "updated_at",
                    "latitude",
                    "longitude"
                ],
                "properties": {
                    "id": {
                        "type": "number",
                        "example": 42
                    },
                    "uuid": {
                        "type": "string",
                        "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                    },
                    "name": {
                        "type": "string"
                    },
                    "created_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "updated_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "type": {
                        "type": "number",
                        "description": "0 = point, 1 = line, 2 = polygon"
                    },
                    "color": {
                        "type": "string"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "elevation": {
                        "type": "number"
                    }
                }
            },
            {
                "type": "object",
                "required": [
                    "id",
                    "uuid",
                    "name",
                    "type",
                    "color",
                    "created_at",
                    "updated_at",
                    "coordinates"
                ],
                "properties": {
                    "id": {
                        "type": "number",
                        "example": 42
                    },
                    "uuid": {
                        "type": "string",
                        "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                    },
                    "name": {
                        "type": "string"
                    },
                    "created_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "updated_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "type": {
                        "type": "number",
                        "description": "0 = point, 1 = line, 2 = polygon"
                    },
                    "color": {
                        "type": "string"
                    },
                    "coordinates": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "latitude",
                                "longitude"
                            ],
                            "properties": {
                                "latitude": {
                                    "type": "number"
                                },
                                "longitude": {
                                    "type": "number"
                                },
                                "elevation": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                }
            },
            {
                "type": "object",
                "required": [
                    "id",
                    "uuid",
                    "name",
                    "type",
                    "color",
                    "created_at",
                    "updated_at",
                    "coordinates"
                ],
                "properties": {
                    "id": {
                        "type": "number",
                        "example": 42
                    },
                    "uuid": {
                        "type": "string",
                        "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                    },
                    "name": {
                        "type": "string"
                    },
                    "created_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "updated_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "type": {
                        "type": "number",
                        "description": "0 = point, 1 = line, 2 = polygon"
                    },
                    "color": {
                        "type": "string"
                    },
                    "coordinates": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": [
                                    "latitude",
                                    "longitude"
                                ],
                                "properties": {
                                    "latitude": {
                                        "type": "number"
                                    },
                                    "longitude": {
                                        "type": "number"
                                    },
                                    "elevation": {
                                        "type": "number"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                "type": "object",
                "required": [
                    "id",
                    "uuid",
                    "name",
                    "type",
                    "color",
                    "created_at",
                    "updated_at",
                    "latitude",
                    "longitude",
                    "radius"
                ],
                "properties": {
                    "id": {
                        "type": "number",
                        "example": 42
                    },
                    "uuid": {
                        "type": "string",
                        "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                    },
                    "name": {
                        "type": "string"
                    },
                    "created_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "updated_at": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    },
                    "type": {
                        "type": "number",
                        "description": "0 = point, 1 = line, 2 = polygon"
                    },
                    "color": {
                        "type": "string"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "radius": {
                        "type": "number"
                    }
                }
            }
        ]
    }
}

export const ApiSchema_MapElementCreateBase : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "color"
    ],
    "properties": {
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        }
    }
}

export const ApiSchema_WorkspaceMapElementsCreatePoint : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "color",
        "longitude",
        "latitude"
    ],
    "properties": {
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        },
        "elevation": {
            "type": "number"
        }
    }
}

export const ApiSchema_WorkspaceMapElementsCreateLine : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "color",
        "coordinates"
    ],
    "properties": {
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "longitude",
                    "latitude"
                ],
                "properties": {
                    "longitude": {
                        "type": "number"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "elevation": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

export const ApiSchema_WorkspaceMapElementsCreatePolygon : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "color",
        "coordinates"
    ],
    "properties": {
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": [
                        "longitude",
                        "latitude"
                    ],
                    "properties": {
                        "longitude": {
                            "type": "number"
                        },
                        "latitude": {
                            "type": "number"
                        },
                        "elevation": {
                            "type": "number"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_WorkspaceMapElementsCreateCircle : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "color",
        "longitude",
        "latitude",
        "radius"
    ],
    "properties": {
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "longitude": {
            "type": "number"
        },
        "latitude": {
            "type": "number"
        },
        "radius": {
            "type": "number"
        }
    }
}

export const ApiSchema_WorkspaceMapElementPatch : JSONSchema4  = {
    "anyOf": [
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "elevation": {
                    "type": "number"
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "latitude",
                            "longitude"
                        ],
                        "properties": {
                            "latitude": {
                                "type": "number"
                            },
                            "longitude": {
                                "type": "number"
                            },
                            "elevation": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "latitude",
                                "longitude"
                            ],
                            "properties": {
                                "latitude": {
                                    "type": "number"
                                },
                                "longitude": {
                                    "type": "number"
                                },
                                "elevation": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "radius": {
                    "type": "number"
                }
            }
        }
    ]
}

export const ApiSchema_MapElement : JSONSchema4  = {
    "anyOf": [
        {
            "type": "object",
            "required": [
                "id",
                "uuid",
                "name",
                "type",
                "color",
                "created_at",
                "updated_at",
                "latitude",
                "longitude"
            ],
            "properties": {
                "id": {
                    "type": "number",
                    "example": 42
                },
                "uuid": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                },
                "name": {
                    "type": "string"
                },
                "created_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "updated_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "type": {
                    "type": "number",
                    "description": "0 = point, 1 = line, 2 = polygon"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "elevation": {
                    "type": "number"
                }
            }
        },
        {
            "type": "object",
            "required": [
                "id",
                "uuid",
                "name",
                "type",
                "color",
                "created_at",
                "updated_at",
                "coordinates"
            ],
            "properties": {
                "id": {
                    "type": "number",
                    "example": 42
                },
                "uuid": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                },
                "name": {
                    "type": "string"
                },
                "created_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "updated_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "type": {
                    "type": "number",
                    "description": "0 = point, 1 = line, 2 = polygon"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "latitude",
                            "longitude"
                        ],
                        "properties": {
                            "latitude": {
                                "type": "number"
                            },
                            "longitude": {
                                "type": "number"
                            },
                            "elevation": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "required": [
                "id",
                "uuid",
                "name",
                "type",
                "color",
                "created_at",
                "updated_at",
                "coordinates"
            ],
            "properties": {
                "id": {
                    "type": "number",
                    "example": 42
                },
                "uuid": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                },
                "name": {
                    "type": "string"
                },
                "created_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "updated_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "type": {
                    "type": "number",
                    "description": "0 = point, 1 = line, 2 = polygon"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "latitude",
                                "longitude"
                            ],
                            "properties": {
                                "latitude": {
                                    "type": "number"
                                },
                                "longitude": {
                                    "type": "number"
                                },
                                "elevation": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "required": [
                "id",
                "uuid",
                "name",
                "type",
                "color",
                "created_at",
                "updated_at",
                "latitude",
                "longitude",
                "radius"
            ],
            "properties": {
                "id": {
                    "type": "number",
                    "example": 42
                },
                "uuid": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                },
                "name": {
                    "type": "string"
                },
                "created_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "updated_at": {
                    "type": "string",
                    "format": "timestamptz",
                    "description": "ISO 8601 format with a timezone",
                    "example": "2023-12-11 23:06:52.7879+00"
                },
                "type": {
                    "type": "number",
                    "description": "0 = point, 1 = line, 2 = polygon"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "radius": {
                    "type": "number"
                }
            }
        }
    ]
}

export const ApiSchema_MapElementBase : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "uuid",
        "name",
        "type",
        "color",
        "created_at",
        "updated_at"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "updated_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "type": {
            "type": "number",
            "description": "0 = point, 1 = line, 2 = polygon"
        },
        "color": {
            "type": "string"
        }
    }
}

export const ApiSchema_MapElementPoint : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "uuid",
        "name",
        "type",
        "color",
        "created_at",
        "updated_at",
        "latitude",
        "longitude"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "updated_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "type": {
            "type": "number",
            "description": "0 = point, 1 = line, 2 = polygon"
        },
        "color": {
            "type": "string"
        },
        "latitude": {
            "type": "number"
        },
        "longitude": {
            "type": "number"
        },
        "elevation": {
            "type": "number"
        }
    }
}

export const ApiSchema_MapElementLine : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "uuid",
        "name",
        "type",
        "color",
        "created_at",
        "updated_at",
        "coordinates"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "updated_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "type": {
            "type": "number",
            "description": "0 = point, 1 = line, 2 = polygon"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "latitude",
                    "longitude"
                ],
                "properties": {
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "elevation": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

export const ApiSchema_MapElementPolygon : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "uuid",
        "name",
        "type",
        "color",
        "created_at",
        "updated_at",
        "coordinates"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "updated_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "type": {
            "type": "number",
            "description": "0 = point, 1 = line, 2 = polygon"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": [
                        "latitude",
                        "longitude"
                    ],
                    "properties": {
                        "latitude": {
                            "type": "number"
                        },
                        "longitude": {
                            "type": "number"
                        },
                        "elevation": {
                            "type": "number"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_MapElementCircle : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "uuid",
        "name",
        "type",
        "color",
        "created_at",
        "updated_at",
        "latitude",
        "longitude",
        "radius"
    ],
    "properties": {
        "id": {
            "type": "number",
            "example": 42
        },
        "uuid": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "created_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "updated_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "type": {
            "type": "number",
            "description": "0 = point, 1 = line, 2 = polygon"
        },
        "color": {
            "type": "string"
        },
        "latitude": {
            "type": "number"
        },
        "longitude": {
            "type": "number"
        },
        "radius": {
            "type": "number"
        }
    }
}

export const ApiSchema_MapElementPatch : JSONSchema4  = {
    "anyOf": [
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "elevation": {
                    "type": "number"
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "latitude",
                            "longitude"
                        ],
                        "properties": {
                            "latitude": {
                                "type": "number"
                            },
                            "longitude": {
                                "type": "number"
                            },
                            "elevation": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "latitude",
                                "longitude"
                            ],
                            "properties": {
                                "latitude": {
                                    "type": "number"
                                },
                                "longitude": {
                                    "type": "number"
                                },
                                "elevation": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "radius": {
                    "type": "number"
                }
            }
        }
    ]
}

export const ApiSchema_MapElementPatchBase : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        }
    }
}

export const ApiSchema_MapElementPointPatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "latitude": {
            "type": "number"
        },
        "longitude": {
            "type": "number"
        },
        "elevation": {
            "type": "number"
        }
    }
}

export const ApiSchema_MapElementLinePatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "latitude",
                    "longitude"
                ],
                "properties": {
                    "latitude": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "elevation": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

export const ApiSchema_MapElementPolygonPatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": [
                        "latitude",
                        "longitude"
                    ],
                    "properties": {
                        "latitude": {
                            "type": "number"
                        },
                        "longitude": {
                            "type": "number"
                        },
                        "elevation": {
                            "type": "number"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_MapElementCirclePatch : JSONSchema4  = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "color": {
            "type": "string"
        },
        "latitude": {
            "type": "number"
        },
        "longitude": {
            "type": "number"
        },
        "radius": {
            "type": "number"
        }
    }
}

export const ApiSchema_RemoteController : JSONSchema4  = {
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

export const ApiSchema_RemoteControllerType : JSONSchema4  = {
    "type": "integer",
    "description": "0 = dji rc pro enterprise, 1 = dji rc plus"
}

export const ApiSchema_RemoteControllerPosition : JSONSchema4  = {
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
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_Drone : JSONSchema4  = {
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

export const ApiSchema_DroneType : JSONSchema4  = {
    "type": "integer",
    "description": "0 = dji mavic 3"
}

export const ApiSchema_DronePosition : JSONSchema4  = {
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
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_DroneBattery : JSONSchema4  = {
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
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        }
    }
}

export const ApiSchema_DroneMedia : JSONSchema4  = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "id",
            "type",
            "file_id",
            "received_at",
            "drone_id",
            "flight_id",
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
            "flight_id": {
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
            "received_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "meta": {
                "type": "string"
            },
            "captured_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "camera_location": {
                "type": "object",
                "properties": {
                    "position": {
                        "type": "object",
                        "required": [
                            "longitude",
                            "latitude"
                        ],
                        "properties": {
                            "longitude": {
                                "type": "number"
                            },
                            "latitude": {
                                "type": "number"
                            }
                        }
                    },
                    "height": {
                        "type": "number"
                    }
                }
            },
            "camera_angles": {
                "type": "object",
                "properties": {
                    "heading": {
                        "type": "number"
                    },
                    "pitch": {
                        "type": "number"
                    },
                    "roll": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

export const ApiSchema_DroneFlights : JSONSchema4  = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "id",
            "drone_id",
            "started_at",
            "track"
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
            "started_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "landed_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "ended_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "track": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": [
                        "height",
                        "longitude",
                        "latitude"
                    ],
                    "properties": {
                        "height": {
                            "type": "number"
                        },
                        "longitude": {
                            "type": "number"
                        },
                        "latitude": {
                            "type": "number"
                        },
                        "time": {
                            "type": "string",
                            "format": "timestamptz",
                            "description": "ISO 8601 format with a timezone",
                            "example": "2023-12-11 23:06:52.7879+00"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_Flight : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "drone_id",
        "started_at",
        "track"
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
        "started_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "landed_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "ended_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "track": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "height",
                    "longitude",
                    "latitude"
                ],
                "properties": {
                    "height": {
                        "type": "number"
                    },
                    "longitude": {
                        "type": "number"
                    },
                    "latitude": {
                        "type": "number"
                    },
                    "time": {
                        "type": "string",
                        "format": "timestamptz",
                        "description": "ISO 8601 format with a timezone",
                        "example": "2023-12-11 23:06:52.7879+00"
                    }
                }
            }
        }
    }
}

export const ApiSchema_FlightMedia : JSONSchema4  = {
    "type": "array",
    "items": {
        "type": "object",
        "required": [
            "id",
            "type",
            "file_id",
            "received_at",
            "drone_id",
            "flight_id",
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
            "flight_id": {
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
            "received_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "meta": {
                "type": "string"
            },
            "captured_at": {
                "type": "string",
                "format": "timestamptz",
                "description": "ISO 8601 format with a timezone",
                "example": "2023-12-11 23:06:52.7879+00"
            },
            "camera_location": {
                "type": "object",
                "properties": {
                    "position": {
                        "type": "object",
                        "required": [
                            "longitude",
                            "latitude"
                        ],
                        "properties": {
                            "longitude": {
                                "type": "number"
                            },
                            "latitude": {
                                "type": "number"
                            }
                        }
                    },
                    "height": {
                        "type": "number"
                    }
                }
            },
            "camera_angles": {
                "type": "object",
                "properties": {
                    "heading": {
                        "type": "number"
                    },
                    "pitch": {
                        "type": "number"
                    },
                    "roll": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

export const ApiSchema_Media : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "type",
        "file_id",
        "received_at",
        "drone_id",
        "flight_id",
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
        "flight_id": {
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
        "received_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "meta": {
            "type": "string"
        },
        "captured_at": {
            "type": "string",
            "format": "timestamptz",
            "description": "ISO 8601 format with a timezone",
            "example": "2023-12-11 23:06:52.7879+00"
        },
        "camera_location": {
            "type": "object",
            "properties": {
                "position": {
                    "type": "object",
                    "required": [
                        "longitude",
                        "latitude"
                    ],
                    "properties": {
                        "longitude": {
                            "type": "number"
                        },
                        "latitude": {
                            "type": "number"
                        }
                    }
                },
                "height": {
                    "type": "number"
                }
            }
        },
        "camera_angles": {
            "type": "object",
            "properties": {
                "heading": {
                    "type": "number"
                },
                "pitch": {
                    "type": "number"
                },
                "roll": {
                    "type": "number"
                }
            }
        }
    }
}

export const ApiSchema_MediaGroundCoverage : JSONSchema4  = {
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
                            },
                            "ray": {
                                "type": "object",
                                "required": [
                                    "bearing",
                                    "pitch",
                                    "imagePosition"
                                ],
                                "properties": {
                                    "bearing": {
                                        "type": "number"
                                    },
                                    "pitch": {
                                        "type": "number"
                                    },
                                    "imagePosition": {
                                        "type": "object",
                                        "required": [
                                            "x",
                                            "y"
                                        ],
                                        "properties": {
                                            "x": {
                                                "type": "number"
                                            },
                                            "y": {
                                                "type": "number"
                                            }
                                        }
                                    }
                                }
                            },
                            "directDistance": {
                                "type": "number"
                            },
                            "meterSize": {
                                "type": "object",
                                "required": [
                                    "vertical",
                                    "horizontal"
                                ],
                                "properties": {
                                    "vertical": {
                                        "type": "number"
                                    },
                                    "horizontal": {
                                        "type": "number"
                                    }
                                }
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
                            },
                            "ray": {
                                "type": "object",
                                "required": [
                                    "bearing",
                                    "pitch",
                                    "imagePosition"
                                ],
                                "properties": {
                                    "bearing": {
                                        "type": "number"
                                    },
                                    "pitch": {
                                        "type": "number"
                                    },
                                    "imagePosition": {
                                        "type": "object",
                                        "required": [
                                            "x",
                                            "y"
                                        ],
                                        "properties": {
                                            "x": {
                                                "type": "number"
                                            },
                                            "y": {
                                                "type": "number"
                                            }
                                        }
                                    }
                                }
                            },
                            "directDistance": {
                                "type": "number"
                            },
                            "meterSize": {
                                "type": "object",
                                "required": [
                                    "vertical",
                                    "horizontal"
                                ],
                                "properties": {
                                    "vertical": {
                                        "type": "number"
                                    },
                                    "horizontal": {
                                        "type": "number"
                                    }
                                }
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
                                },
                                "ray": {
                                    "type": "object",
                                    "required": [
                                        "bearing",
                                        "pitch",
                                        "imagePosition"
                                    ],
                                    "properties": {
                                        "bearing": {
                                            "type": "number"
                                        },
                                        "pitch": {
                                            "type": "number"
                                        },
                                        "imagePosition": {
                                            "type": "object",
                                            "required": [
                                                "x",
                                                "y"
                                            ],
                                            "properties": {
                                                "x": {
                                                    "type": "number"
                                                },
                                                "y": {
                                                    "type": "number"
                                                }
                                            }
                                        }
                                    }
                                },
                                "directDistance": {
                                    "type": "number"
                                },
                                "meterSize": {
                                    "type": "object",
                                    "required": [
                                        "vertical",
                                        "horizontal"
                                    ],
                                    "properties": {
                                        "vertical": {
                                            "type": "number"
                                        },
                                        "horizontal": {
                                            "type": "number"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_GroundCoverageLocation : JSONSchema4  = {
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
        },
        "ray": {
            "type": "object",
            "required": [
                "bearing",
                "pitch",
                "imagePosition"
            ],
            "properties": {
                "bearing": {
                    "type": "number"
                },
                "pitch": {
                    "type": "number"
                },
                "imagePosition": {
                    "type": "object",
                    "required": [
                        "x",
                        "y"
                    ],
                    "properties": {
                        "x": {
                            "type": "number"
                        },
                        "y": {
                            "type": "number"
                        }
                    }
                }
            }
        },
        "directDistance": {
            "type": "number"
        },
        "meterSize": {
            "type": "object",
            "required": [
                "vertical",
                "horizontal"
            ],
            "properties": {
                "vertical": {
                    "type": "number"
                },
                "horizontal": {
                    "type": "number"
                }
            }
        }
    }
}

export const ApiSchema_ConnectionLinkAuthLoginPost : JSONSchema4  = {
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

export const ApiSchema_ConnectionLinkConfig : JSONSchema4  = {
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

export const ApiSchema_ConnectionLinkDjiPilot2SdkConfig : JSONSchema4  = {
    "type": "object",
    "required": [
        "app_id",
        "app_key",
        "app_license",
        "mqtt_url",
        "rtmp_url",
        "api_url",
        "ws_url"
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
        },
        "ws_url": {
            "type": "string"
        }
    }
}

export const ApiSchema_DjiPilot2ApiMediaFastUploadPost : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaFastUploadPostResponse : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPost : JSONSchema4  = {
    "type": "object",
    "description": "TODO what is the format? documentation does not say"
}

export const ApiSchema_DjiPilot2ApiMediaFilesTinyFingerprintsPostResponse : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaStsPostResponse : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaUploadCallbackPost : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaUploadCallbackPostResponse : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPost : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMediaGroupUploadCallbackPostResponse : JSONSchema4  = {
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

export const ApiSchema_DjiPilot2ApiMapElementGroupsElementsPost : JSONSchema4  = {
    "type": "object",
    "required": [
        "id",
        "name",
        "resource"
    ],
    "properties": {
        "id": {
            "type": "string",
            "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
        },
        "name": {
            "type": "string"
        },
        "resource": {
            "type": "object",
            "description": "TODO missing documentation",
            "required": [
                "type",
                "content"
            ],
            "properties": {
                "type": {
                    "type": "number",
                    "description": "0 = point, 1 = line, 2 = polygon, 7 = circle"
                },
                "content": {
                    "type": "object",
                    "required": [
                        "type",
                        "geometry"
                    ],
                    "properties": {
                        "type": {
                            "type": "string"
                        },
                        "geometry": {
                            "type": "object"
                        },
                        "properties": {
                            "type": "object"
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMapElementGroupsElementsPostResponse : JSONSchema4  = {
    "type": "object",
    "required": [
        "code",
        "data",
        "message"
    ],
    "properties": {
        "code": {
            "type": "number",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "id"
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMapElementGroupsGetResponse : JSONSchema4  = {
    "type": "object",
    "required": [
        "code",
        "data",
        "message"
    ],
    "properties": {
        "code": {
            "type": "number",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "id",
                    "create_time",
                    "elements",
                    "is_lock",
                    "name",
                    "type"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                    },
                    "name": {
                        "type": "string"
                    },
                    "create_time": {
                        "type": "number",
                        "example": "1239213862",
                        "description": "Time in milliseconds since Unix Epoch time (January 1st, 1970 )"
                    },
                    "is_lock": {
                        "type": "boolean",
                        "description": "if locked, elements of this group can not be deleted/modified"
                    },
                    "type": {
                        "type": "number",
                        "description": "0 = custom element group, 1 = default element group, 2 = app shared element group (the only visible group on dji pilot 2 app)"
                    },
                    "elements": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": [
                                "id",
                                "name",
                                "create_time",
                                "update_time",
                                "resource"
                            ],
                            "properties": {
                                "id": {
                                    "type": "string",
                                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                                },
                                "name": {
                                    "type": "string"
                                },
                                "create_time": {
                                    "type": "number",
                                    "example": "1239213862",
                                    "description": "Time in milliseconds since Unix Epoch time (January 1st, 1970 )"
                                },
                                "update_time": {
                                    "type": "number",
                                    "example": "1239213862",
                                    "description": "Time in milliseconds since Unix Epoch time (January 1st, 1970 )"
                                },
                                "resource": {
                                    "type": "object",
                                    "required": [
                                        "type",
                                        "content"
                                    ],
                                    "properties": {
                                        "type": {
                                            "type": "number",
                                            "description": "0 = point, 1 = line, 2 = polygon, 7 = circle"
                                        },
                                        "content": {
                                            "type": "object",
                                            "required": [
                                                "type",
                                                "properties",
                                                "geometry"
                                            ],
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "description": "geojson format"
                                                },
                                                "properties": {
                                                    "type": "object",
                                                    "required": [
                                                        "clampToGround",
                                                        "color"
                                                    ],
                                                    "properties": {
                                                        "clampToGround": {
                                                            "type": "boolean"
                                                        },
                                                        "is3d": {
                                                            "type": "boolean"
                                                        },
                                                        "color": {
                                                            "type": "string",
                                                            "description": "only valid colors. BLUE: #2D8CF0, GREEN: #19BE6B, YELLOW: #FFBB00, RED: #E23C39, PURPLE: #B620E0",
                                                            "example": "BLUE"
                                                        }
                                                    }
                                                },
                                                "geometry": {
                                                    "type": "object",
                                                    "required": [
                                                        "type",
                                                        "coordinates"
                                                    ],
                                                    "properties": {
                                                        "type": {
                                                            "type": "string",
                                                            "description": "geojson format"
                                                        },
                                                        "coordinates": {
                                                            "type": "array",
                                                            "items": {
                                                                "type": "number"
                                                            },
                                                            "description": "geojson format"
                                                        },
                                                        "radius": {
                                                            "type": "number"
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMapElementsPut : JSONSchema4  = {
    "type": "object",
    "required": [
        "name",
        "content"
    ],
    "properties": {
        "name": {
            "type": "string"
        },
        "content": {
            "type": "object",
            "required": [
                "type",
                "geometry",
                "properties"
            ],
            "properties": {
                "type": {
                    "type": "string"
                },
                "geometry": {
                    "type": "object"
                },
                "properties": {
                    "type": "object"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMapElementsPutResponse : JSONSchema4  = {
    "type": "object",
    "required": [
        "code",
        "data",
        "message"
    ],
    "properties": {
        "code": {
            "type": "number",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "id"
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiMapElementsDeleteResponse : JSONSchema4  = {
    "type": "object",
    "required": [
        "code",
        "data",
        "message"
    ],
    "properties": {
        "code": {
            "type": "number",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "id"
            ],
            "properties": {
                "id": {
                    "type": "string",
                    "example": "87ffce7c-da28-49cf-9134-8db9fd87ccd1"
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiManageDevicesTopologyResponse : JSONSchema4  = {
    "type": "object",
    "required": [
        "code",
        "data",
        "message"
    ],
    "properties": {
        "code": {
            "type": "number",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "success"
        },
        "data": {
            "type": "object",
            "required": [
                "list"
            ],
            "properties": {
                "list": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "hosts",
                            "parents"
                        ],
                        "properties": {
                            "hosts": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": [
                                        "device_callsign",
                                        "online_status",
                                        "sn",
                                        "user_callsign",
                                        "user_id"
                                    ],
                                    "properties": {
                                        "device_callsign": {
                                            "type": "string"
                                        },
                                        "device_model": {
                                            "type": "object",
                                            "required": [
                                                "key",
                                                "domain",
                                                "type",
                                                "sub_type"
                                            ],
                                            "properties": {
                                                "key": {
                                                    "type": "string"
                                                },
                                                "domain": {
                                                    "type": "string"
                                                },
                                                "type": {
                                                    "type": "string"
                                                },
                                                "sub_type": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "icon_urls": {
                                            "type": "object",
                                            "description": "custom icon",
                                            "required": [
                                                "normal_icon_url",
                                                "selected_icon_url"
                                            ],
                                            "properties": {
                                                "normal_icon_url": {
                                                    "type": "string"
                                                },
                                                "selected_icon_url": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "online_status": {
                                            "type": "boolean"
                                        },
                                        "sn": {
                                            "type": "string"
                                        },
                                        "user_callsign": {
                                            "type": "string"
                                        },
                                        "user_id": {
                                            "type": "string"
                                        }
                                    }
                                }
                            },
                            "parents": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": [
                                        "device_callsign",
                                        "online_status",
                                        "sn",
                                        "user_callsign",
                                        "user_id"
                                    ],
                                    "properties": {
                                        "device_callsign": {
                                            "type": "string"
                                        },
                                        "device_model": {
                                            "type": "object",
                                            "required": [
                                                "key",
                                                "domain",
                                                "type",
                                                "sub_type"
                                            ],
                                            "properties": {
                                                "key": {
                                                    "type": "string"
                                                },
                                                "domain": {
                                                    "type": "string"
                                                },
                                                "type": {
                                                    "type": "string"
                                                },
                                                "sub_type": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "icon_urls": {
                                            "type": "object",
                                            "description": "custom icon",
                                            "required": [
                                                "normal_icon_url",
                                                "selected_icon_url"
                                            ],
                                            "properties": {
                                                "normal_icon_url": {
                                                    "type": "string"
                                                },
                                                "selected_icon_url": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "online_status": {
                                            "type": "boolean"
                                        },
                                        "sn": {
                                            "type": "string"
                                        },
                                        "user_callsign": {
                                            "type": "string"
                                        },
                                        "user_id": {
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export const ApiSchema_DjiPilot2ApiManageDevicesTopologyDevice : JSONSchema4  = {
    "type": "object",
    "required": [
        "device_callsign",
        "online_status",
        "sn",
        "user_callsign",
        "user_id"
    ],
    "properties": {
        "device_callsign": {
            "type": "string"
        },
        "device_model": {
            "type": "object",
            "required": [
                "key",
                "domain",
                "type",
                "sub_type"
            ],
            "properties": {
                "key": {
                    "type": "string"
                },
                "domain": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "sub_type": {
                    "type": "string"
                }
            }
        },
        "icon_urls": {
            "type": "object",
            "description": "custom icon",
            "required": [
                "normal_icon_url",
                "selected_icon_url"
            ],
            "properties": {
                "normal_icon_url": {
                    "type": "string"
                },
                "selected_icon_url": {
                    "type": "string"
                }
            }
        },
        "online_status": {
            "type": "boolean"
        },
        "sn": {
            "type": "string"
        },
        "user_callsign": {
            "type": "string"
        },
        "user_id": {
            "type": "string"
        }
    }
}

