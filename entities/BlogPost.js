{
  "name": "BlogPost",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "slug": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "blog",
        "news",
        "guide"
      ],
      "default": "blog"
    },
    "status": {
      "type": "string",
      "enum": [
        "published",
        "draft",
        "archived"
      ],
      "default": "draft"
    },
    "category": {
      "type": "string",
      "enum": [
        "market-news",
        "investment",
        "citizenship",
        "residency",
        "lifestyle",
        "legal",
        "city-guides",
        "other"
      ]
    },
    "author": {
      "type": "string"
    },
    "excerpt": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "main_image": {
      "type": "string"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "published_date": {
      "type": "string",
      "format": "date"
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
    },
    "reading_time_min": {
      "type": "number"
    }
  },
  "required": [
    "title",
    "type"
  ],
  "rls": {
    "create": {
      "$or": [
        {
          "created_by": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "read": {},
    "update": {
      "$or": [
        {
          "created_by": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "delete": {
      "$or": [
        {
          "created_by": "{{user.email}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}