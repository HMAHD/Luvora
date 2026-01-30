# PocketBase Collections

This document describes the PocketBase collections used by Luvora.

## Core Collections

### users (built-in auth collection)

Extended user collection with custom fields.

| Field | Type | Description |
|-------|------|-------------|
| email | email | User's email (built-in) |
| name | text | User's display name |
| partner_name | text | Partner's nickname |
| role | select | neutral, masculine, feminine |
| tier | number | 0=Free, 1=Hero, 2=Legend |
| love_language | select | Primary love language |
| preferred_tone | select | Preferred message tone |
| anniversary_date | date | Anniversary date |
| partner_birthday | date | Partner's birthday |
| messaging_platform | select | telegram, whatsapp |
| messaging_id | text | Telegram chat ID or WhatsApp number |
| delivery_time | text | Preferred delivery time (HH:MM) |
| timezone | text | User's timezone |

### messages

Pool of romantic messages.

| Field | Type | Description |
|-------|------|-------------|
| content | text | Message content |
| target | select | neutral, masculine, feminine |
| vibe | select | poetic, playful, romantic, passionate, sweet, supportive |
| time_of_day | select | morning, night, any |
| rarity | select | common, rare, epic, legendary |
| love_language | select | Love language category |
| tier | number | Minimum tier required (0=all, 2=Legend only) |
| occasion | select | daily, anniversary, birthday, special |

**API Rules:**
- List/Search: (empty) - Public read access
- View: (empty) - Public read access
- Create: @request.auth.id != "" - Authenticated only
- Update: @request.auth.id != "" - Authenticated only
- Delete: @request.auth.id != "" - Authenticated only

---

## Admin Collections

### tier_audit_logs

Tracks all tier changes for accountability.

| Field | Type | Description |
|-------|------|-------------|
| user_id | relation (users) | User whose tier changed |
| previous_tier | number | Tier before change (0, 1, 2) |
| new_tier | number | Tier after change (0, 1, 2) |
| reason | select | purchase, refund, dispute, admin_upgrade, admin_downgrade, sync_script, promo_code, gift, system |
| changed_by | text | Admin user ID or "system" |
| metadata | json | Optional JSON with additional context |

**API Rules:**
- All operations: Only superusers (admin panel only)

### broadcast_logs

Tracks automated message deliveries.

| Field | Type | Description |
|-------|------|-------------|
| user_id | relation (users) | User who received the message |
| user_email | text | User's email (for quick reference) |
| platform | select | telegram, whatsapp, email |
| status | select | success, failed, pending |
| error | text | Error message if failed |
| sent_at | date | When the message was sent |

**API Rules:**
- All operations: Only superusers (admin panel only)

---

## Creating Collections via Admin UI

### tier_audit_logs Collection

1. Go to PocketBase Admin → Collections → New Collection
2. Name: `tier_audit_logs`
3. Type: Base collection
4. Add fields:
   - `user_id`: Relation → users collection
   - `previous_tier`: Number (min: 0, max: 2)
   - `new_tier`: Number (min: 0, max: 2)
   - `reason`: Select → Options: purchase, refund, dispute, admin_upgrade, admin_downgrade, sync_script, promo_code, gift, system
   - `changed_by`: Text
   - `metadata`: JSON (optional)
5. API Rules → Set all to: Only superusers can access
6. Save

### Quick Import (JSON)

You can also import this schema via Settings → Import Collections:

```json
[
  {
    "name": "tier_audit_logs",
    "type": "base",
    "schema": [
      {
        "name": "user_id",
        "type": "relation",
        "required": true,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "maxSelect": 1
        }
      },
      {
        "name": "previous_tier",
        "type": "number",
        "required": true,
        "options": {
          "min": 0,
          "max": 2
        }
      },
      {
        "name": "new_tier",
        "type": "number",
        "required": true,
        "options": {
          "min": 0,
          "max": 2
        }
      },
      {
        "name": "reason",
        "type": "select",
        "required": true,
        "options": {
          "values": ["purchase", "refund", "dispute", "admin_upgrade", "admin_downgrade", "sync_script", "promo_code", "gift", "system"]
        }
      },
      {
        "name": "changed_by",
        "type": "text",
        "required": true
      },
      {
        "name": "metadata",
        "type": "json",
        "required": false
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null
  }
]
```

---

## Notes

- Setting API rules to `null` means only superusers (PocketBase admins) can access
- The `@request.auth.id != ""` rule means any authenticated user
- Empty string `""` means public access (no auth required)
