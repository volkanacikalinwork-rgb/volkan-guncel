{
  "name": "Project",
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
        "completed",
        "upcoming"
      ],
      "default": "draft"
    },
    "city": {
      "type": "string",
      "enum": [
        "istanbul",
        "antalya",
        "fethiye",
        "bodrum",
        "ankara",
        "izmir",
        "alanya",
        "other"
      ]
    },
    "district": {
      "type": "string"
    },
    "developer": {
      "type": "string"
    },
    "completion_date": {
      "type": "string",
      "format": "date"
    },
    "min_price": {
      "type": "number"
    },
    "max_price": {
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
    "total_units": {
      "type": "number"
    },
    "available_units": {
      "type": "number"
    },
    "description": {
      "type": "string"
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "main_image": {
      "type": "string"
    },
    "citizenship_eligible": {
      "type": "boolean",
      "default": false
    },
    "seo_title": {
      "type": "string"
    },
    "seo_description": {
      "type": "string"
    },
    "seo_keywords": {
      "type": "string"
    },
    "featured": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "title",
    "city"
  ]
}