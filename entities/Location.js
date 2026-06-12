{
  "name": "Location",
  "type": "object",
  "properties": {
    "country": {
      "type": "string",
      "description": "Country name",
      "default": "Turkey"
    },
    "city": {
      "type": "string",
      "description": "City slug (e.g. istanbul)"
    },
    "city_label": {
      "type": "string",
      "description": "Display name of the city"
    },
    "region": {
      "type": "string",
      "description": "Region within city (e.g. European Side, Asian Side)"
    },
    "district": {
      "type": "string",
      "description": "District / il\u00e7e name"
    },
    "neighborhood": {
      "type": "string",
      "description": "Neighborhood / mahalle name"
    },
    "property_count": {
      "type": "number",
      "default": 0
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
    "city",
    "district"
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