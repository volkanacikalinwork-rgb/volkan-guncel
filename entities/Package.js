{
  "name": "Package",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "slug": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "draft",
        "sold_out"
      ],
      "default": "draft"
    },
    "type": {
      "type": "string",
      "enum": [
        "citizenship",
        "residency",
        "investment"
      ],
      "default": "citizenship"
    },
    "total_price": {
      "type": "number"
    },
    "currency": {
      "type": "string",
      "enum": [
        "USD",
        "EUR",
        "GBP",
        "TRY"
      ],
      "default": "USD"
    },
    "property_ids": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "cities": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "description": {
      "type": "string"
    },
    "benefits": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "main_image": {
      "type": "string"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "seo_title": {
      "type": "string"
    },
    "seo_description": {
      "type": "string"
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "number_of_properties": {
      "type": "number"
    }
  },
  "required": [
    "title",
    "total_price"
  ]
}