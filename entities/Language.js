{
  "name": "Language",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Language name (e.g. English)"
    },
    "code": {
      "type": "string",
      "description": "ISO 639-1 code (e.g. en)"
    },
    "native_name": {
      "type": "string",
      "description": "Native language name (e.g. English)"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "is_default": {
      "type": "boolean",
      "default": false
    },
    "rtl": {
      "type": "boolean",
      "default": false,
      "description": "Right-to-left script"
    },
    "flag_emoji": {
      "type": "string"
    },
    "order": {
      "type": "number",
      "default": 99
    }
  },
  "required": [
    "name",
    "code"
  ],
  "rls": {
    "create": {
      "user_condition": {
        "role": "admin"
      }
    },
    "read": {},
    "update": {
      "user_condition": {
        "role": "admin"
      }
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}