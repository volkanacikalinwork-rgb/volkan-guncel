{
  "name": "PropertyType",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "slug": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "sub_types": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "order": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name",
    "slug"
  ]
}