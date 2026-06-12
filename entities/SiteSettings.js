{
  "name": "SiteSettings",
  "type": "object",
  "properties": {
    "key": {
      "type": "string",
      "description": "Setting key (e.g. background_image)"
    },
    "value": {
      "type": "string",
      "description": "Setting value"
    },
    "label": {
      "type": "string",
      "description": "Human readable label"
    }
  },
  "required": [
    "key",
    "value"
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