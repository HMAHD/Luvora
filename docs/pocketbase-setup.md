# PocketBase Backend Setup

This guide covers the complete PocketBase configuration for Luvora.

## Overview

Luvora uses PocketBase as a self-hosted backend for authentication, user data, and spark history storage.

## Environment Variables

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.yourdomain.com
POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password
```

---

## Step 1: Install PocketBase

### Option A: Direct Download

1. Download from [pocketbase.io](https://pocketbase.io/docs/)
2. Extract the binary
3. Run: `./pocketbase serve`

### Option B: Docker

```dockerfile
FROM alpine:latest

ARG PB_VERSION=0.22.4

RUN apk add --no-cache \
    unzip \
    ca-certificates

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

### Option C: PocketHost (Managed)

1. Go to [pockethost.io](https://pockethost.io)
2. Create a new instance
3. Use the provided URL as `NEXT_PUBLIC_POCKETBASE_URL`

---

## Step 2: Initial Setup

1. Start PocketBase and navigate to `http://localhost:8090/_/`
2. Create your admin account
3. Save credentials in `.env.local`:

```env
POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password
```

---

## Step 3: Configure Collections

### Users Collection (Auth Type)

The `users` collection is created automatically. Add these custom fields:

| Field Name | Type | Options |
|------------|------|---------|
| partner_name | Text | max: 50 |
| recipient_role | Select | values: masculine, feminine, neutral |
| tier | Number | min: 0, max: 2, noDecimal: true |
| timezone | Text | - |
| morning_time | Text | pattern: `^([01]?[0-9]\|2[0-3]):([0-5][0-9])$` |
| messaging_platform | Select | values: whatsapp, telegram |
| messaging_id | Text | - |
| streak | Number | min: 0, noDecimal: true |
| last_sent_date | Text | pattern: `^\d{4}-\d{2}-\d{2}$` |
| love_language | Select | values: words_of_affirmation, acts_of_service, receiving_gifts, quality_time, physical_touch |
| preferred_tone | Select | values: poetic, playful, romantic, passionate, sweet, supportive |
| anniversary_date | Text | pattern: `^\d{4}-\d{2}-\d{2}$` |
| partner_birthday | Text | pattern: `^\d{4}-\d{2}-\d{2}$` |
| relationship_start | Text | pattern: `^\d{4}-\d{2}-\d{2}$` |
| linked_partner_id | Text | - |

**API Rules for users:**

| Rule | Value |
|------|-------|
| List | `@request.auth.id != ""` |
| View | `@request.auth.id = id` |
| Update | `@request.auth.id = id` |
| Delete | `@request.auth.id = id` |

---

### spark_history Collection (Base Type)

Create a new collection named `spark_history`:

| Field Name | Type | Options |
|------------|------|---------|
| user_id | Relation | collection: users, cascade delete: true |
| message_content | Text | required: true |
| date | Text | pattern: `^\d{4}-\d{2}-\d{2}$`, required: true |
| love_language | Select | values: words_of_affirmation, acts_of_service, receiving_gifts, quality_time, physical_touch |
| tone | Select | values: poetic, playful, romantic, passionate, sweet, supportive |
| rarity | Select | values: common, rare, epic, legendary |
| is_favorite | Bool | - |
| was_shared | Bool | - |

**API Rules for spark_history:**

| Rule | Value |
|------|-------|
| List | `@request.auth.id != "" && user_id = @request.auth.id` |
| View | `@request.auth.id != "" && user_id = @request.auth.id` |
| Create | `@request.auth.id != "" && @request.body.user_id = @request.auth.id` |
| Update | `@request.auth.id != "" && user_id = @request.auth.id` |
| Delete | `@request.auth.id != "" && user_id = @request.auth.id` |

---

### partner_links Collection (Base Type)

Create a new collection named `partner_links`:

| Field Name | Type | Options |
|------------|------|---------|
| inviter_id | Relation | collection: users, cascade delete: true, required: true |
| invitee_id | Relation | collection: users, cascade delete: false |
| invite_code | Text | min: 8, max: 32, required: true |
| status | Select | values: pending, accepted, expired, revoked, required: true |
| expires_at | Date | - |

**API Rules for partner_links:**

| Rule | Value |
|------|-------|
| List | `@request.auth.id != "" && (inviter_id = @request.auth.id \|\| invitee_id = @request.auth.id)` |
| View | `@request.auth.id != ""` |
| Create | `@request.auth.id != "" && @request.body.inviter_id = @request.auth.id` |
| Update | `@request.auth.id != "" && (inviter_id = @request.auth.id \|\| invitee_id = @request.auth.id)` |
| Delete | `@request.auth.id != "" && inviter_id = @request.auth.id` |

---

### message_stats Collection (Base Type)

Create a new collection named `message_stats` for analytics:

| Field Name | Type | Options |
|------------|------|---------|
| date | Text | required: true |
| copy_count | Number | noDecimal: true |
| total_users | Number | noDecimal: true |

**API Rules for message_stats:**

| Rule | Value |
|------|-------|
| List | (empty - admin only) |
| View | (empty - admin only) |
| Create | `@request.auth.id != ""` |
| Update | (empty - admin only) |
| Delete | (empty - admin only) |

---

## Step 4: Authentication Settings

1. Go to **Settings > Auth providers**
2. Enable **Email/Password** authentication
3. Configure email settings for verification (optional)

### OAuth Providers (Optional)

To enable Google OAuth:

1. Go to **Settings > Auth providers > Google**
2. Enable the provider
3. Add your Google OAuth credentials
4. Set redirect URL: `https://yourdomain.com/auth/confirm`

---

## Step 5: Email Configuration

For email verification and password reset:

1. Go to **Settings > Mail settings**
2. Configure SMTP:

```
SMTP Host: smtp.gmail.com (or your provider)
SMTP Port: 587
SMTP Username: your_email@gmail.com
SMTP Password: your_app_password
Sender Address: noreply@yourdomain.com
Sender Name: Luvora
```

---

## Step 6: Backup Configuration

### Manual Backup

```bash
./pocketbase backup
```

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR="/backups/pocketbase"
DATE=$(date +%Y%m%d_%H%M%S)

./pocketbase backup --output="$BACKUP_DIR/backup_$DATE.zip"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.zip" -mtime +7 -delete
```

---

## Step 7: Production Deployment

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Systemd Service

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=pocketbase
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http="127.0.0.1:8090"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Tier System Reference

| Tier | Numeric Value | Display Name | Features |
|------|---------------|--------------|----------|
| Free | 0 | Voyager | Basic sparks, 7-day history |
| Hero | 1 | Hero | Automation, 30-day history, all tones |
| Legend | 2 | Legend | Premium messages, partner link, 90-day history, photo cards |

---

## Troubleshooting

### Connection Refused

1. Ensure PocketBase is running
2. Check firewall rules
3. Verify URL in `NEXT_PUBLIC_POCKETBASE_URL`

### Authentication Failed

1. Verify admin credentials
2. Check if admin account exists
3. Ensure email is verified (if required)

### API Rules Not Working

1. Rules use PocketBase filter syntax
2. `@request.auth.id` refers to authenticated user
3. Test rules in PocketBase Admin > Collection > API Rules

### CORS Issues

PocketBase handles CORS automatically. If issues persist:

1. Check `NEXT_PUBLIC_POCKETBASE_URL` matches exactly
2. Ensure no trailing slash in URL
3. Verify SSL certificate is valid
