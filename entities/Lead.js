{
  "name": "Lead",
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "nationality": {
      "type": "string"
    },
    "source": {
      "type": "string",
      "enum": [
        "contact-form",
        "property-inquiry",
        "citizenship-page",
        "residency-page",
        "package-inquiry",
        "sell-property",
        "other"
      ],
      "default": "contact-form"
    },
    "status": {
      "type": "string",
      "enum": [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "closed",
        "lost"
      ],
      "default": "new"
    },
    "interest": {
      "type": "string",
      "enum": [
        "buy",
        "citizenship",
        "residency",
        "investment",
        "rent",
        "sell",
        "other"
      ]
    },
    "budget_min": {
      "type": "number"
    },
    "budget_max": {
      "type": "number"
    },
    "preferred_city": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    },
    "assigned_agent": {
      "type": "string"
    },
    "property_ref": {
      "type": "string"
    },
    "follow_up_date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "full_name",
    "email"
  ]
}