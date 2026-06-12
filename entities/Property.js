{
  "name": "Property",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Property title"
    },
    "slug": {
      "type": "string",
      "description": "URL slug"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "draft",
        "sold",
        "pending"
      ],
      "default": "draft"
    },
    "type": {
      "type": "string",
      "enum": [
        "apartment",
        "villa",
        "commercial",
        "land"
      ],
      "default": "apartment"
    },
    "sub_type": {
      "type": "string"
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
        "side",
        "kas",
        "other"
      ]
    },
    "district": {
      "type": "string",
      "description": "District / neighbourhood"
    },
    "price": {
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
    "bedrooms": {
      "type": "number"
    },
    "bathrooms": {
      "type": "number"
    },
    "size_sqm": {
      "type": "number"
    },
    "sea_view": {
      "type": "boolean",
      "default": false
    },
    "citizenship_eligible": {
      "type": "boolean",
      "default": false
    },
    "residency_eligible": {
      "type": "boolean",
      "default": false
    },
    "description": {
      "type": "string"
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Property features / amenities"
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
    "seo_title": {
      "type": "string"
    },
    "seo_description": {
      "type": "string"
    },
    "seo_keywords": {
      "type": "string"
    },
    "property_ref": {
      "type": "string"
    },
    "agent_id": {
      "type": "string"
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "year_built": {
      "type": "number"
    },
    "floors": {
      "type": "number"
    },
    "floor_number": {
      "type": "number"
    }
  },
  "required": [
    "title",
    "city",
    "price"
  ]
}