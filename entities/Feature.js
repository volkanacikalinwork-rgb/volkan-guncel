{
  "name": "Feature",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Feature display name"
    },
    "slug": {
      "type": "string",
      "description": "Internal key"
    },
    "category": {
      "type": "string",
      "enum": [
        "indoor",
        "outdoor",
        "services",
        "leisure",
        "legal",
        "location",
        "other"
      ],
      "default": "other"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "order": {
      "type": "number",
      "default": 99
    }
  },
  "required": [
    "name"
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