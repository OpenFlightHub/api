import {JSONSchema} from 'json-schema-to-typescript'

export const ApiSchema_Id : JSONSchema  = {
    "type": "number",
    "example": 42
}

export const ApiSchema_Time : JSONSchema  = {
    "type": "string",
    "format": "time",
    "description": "hh:mm:ss",
    "example": "01:00:00"
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

export const ApiSchema_References : JSONSchema  = {
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

