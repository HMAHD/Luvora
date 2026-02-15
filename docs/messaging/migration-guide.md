# Migration Guide: Old Messaging → User-Managed Messaging

**Date:** February 13, 2026
**Migration Type:** Centralized messaging → User-managed channels

---

## 🎯 What Changed

### Before (Centralized Messaging)
- Single Telegram bot for ALL users (one TELEGRAM_BOT_TOKEN)
- Single WhatsApp API for ALL users (one WHAPI_API_TOKEN)
- Users stored `messaging_platform` and `messaging_id` in their profile
- Complex Meta Business API setup required

### After (User-Managed Messaging)
- **Each user** creates their own Telegram bot
- **Each user** scans their own WhatsApp QR code
- Channels stored in separate `messaging_channels` collection
- No centralized API tokens needed
- Much simpler setup for users

---

## 📊 Database Changes

### Users Collection

#### Fields to DEPRECATE (do NOT delete immediately):
```
messaging_platform (select: telegram, whatsapp)
messaging_id (text: chat_id or phone number)
```

**Why keep them?**
- For backward compatibility during transition
- To help migrate existing users
- Can be removed after all active users have migrated

#### Recommended Action:
1. Keep the fields in the schema for now
2. In the PocketBase admin UI, mark them as "Hidden" or "Deprecated" in documentation
3. Update any frontend forms to NOT show these fields to new users
4. After 30-60 days (when all users have migrated), delete the fields

### New Collections (Already Created)

#### messaging_channels
```json
{
  "id": "auto",
  "user": "relation to users",
  "platform": "select (telegram, whatsapp, discord)",
  "enabled": "bool (default: true)",
  "config": "json (encrypted tokens, settings)",
  "last_used": "datetime",
  "created": "auto",
  "updated": "auto"
}
```

#### messaging_notifications
```json
{
  "id": "auto",
  "user": "relation to users",
  "platform": "text (telegram, whatsapp, discord)",
  "type": "text (outbound, inbound)",
  "content": "text",
  "status": "select (sent, failed, pending)",
  "error": "text (optional)",
  "sent_at": "datetime",
  "created": "auto"
}
```

---

## 🔄 Migration Strategy

### For Existing Users (with messaging_platform/messaging_id)

**Option 1: Manual Migration (Recommended)**

1. Send email to existing users:
   ```
   Subject: 🎉 Easier Telegram/WhatsApp Setup!

   Hey there!

   We've made it easier to receive your daily Sparks. You now control
   your own bot/WhatsApp account!

   New Setup (takes 2 minutes):
   1. Go to Settings → Automation
   2. Click "Connect Telegram" or "Connect WhatsApp"
   3. Follow the simple steps

   Why this is better:
   ✅ No more Meta Business API complexity
   ✅ You own your bot
   ✅ More reliable delivery
   ✅ Works with free Telegram bots

   Your old setup will work for 30 more days, then you'll need to migrate.

   Questions? Reply to this email!

   — Luvora Team
   ```

2. Show in-app banner for users with old fields:
   ```tsx
   {user.messaging_id && !hasNewChannel && (
     <Alert variant="warning">
       <AlertTitle>Action Required: Update Your Messaging Setup</AlertTitle>
       <AlertDescription>
         We've improved how you receive Sparks! Please set up your new
         messaging channel in Settings → Automation.
         <Link to="/settings/automation">Update Now →</Link>
       </AlertDescription>
     </Alert>
   )}
   ```

**Option 2: Automatic Migration (Not Recommended)**

You **cannot** automatically migrate because:
- Old system used YOUR centralized bot (one token for all users)
- New system requires EACH USER to create their own bot
- Users must perform the setup steps themselves

---

## 🚀 Deployment Steps

### 1. Pre-Deployment

- ✅ Phase 1-4 code deployed
- ✅ `messaging_channels` collection created
- ✅ `messaging_notifications` collection created
- ✅ ENCRYPTION_KEY environment variable set
- ✅ MessagingService initialization tested

### 2. Deployment

```bash
# 1. Deploy the new code (already committed)
git push origin main

# 2. Verify environment variables on server
# - ENCRYPTION_KEY (required)
# - POCKETBASE_ADMIN_EMAIL (required)
# - POCKETBASE_ADMIN_PASSWORD (required)

# 3. Restart Next.js server
# MessagingService will auto-initialize via instrumentation.ts

# 4. Check logs for successful initialization
# Look for: [MessagingService] Initialization complete
```

### 3. Post-Deployment

#### Verify MessagingService is Running
```bash
# SSH into your server
# Check Next.js logs
pm2 logs # or your process manager

# Look for:
# [MessagingService] Initializing...
# [MessagingService] Found X enabled channels
# [MessagingService] Initialization complete
```

#### Test the System
1. Create a test Telegram bot via @BotFather
2. Call `POST /api/channels/telegram/setup` with bot token
3. Send `/start` to your bot
4. Call `GET /api/test-telegram` to send test message
5. Verify message arrives in Telegram

#### Monitor for Issues
```bash
# Watch for channel errors
tail -f logs/app.log | grep "\[MessagingService\]"

# Check PocketBase for failed notifications
# Visit: http://your-pocketbase/messaging_notifications
# Filter: status = "failed"
```

---

## 🔧 Handling Edge Cases

### User Has Both Old and New Setup

If a user has both `messaging_id` (old) and a record in `messaging_channels` (new):

**Current Behavior (cron/deliver):**
- Only uses `messaging_channels` (new system)
- Ignores `messaging_id` field completely

**Recommendation:**
- Keep this behavior
- Old fields are ignored by design
- Users must migrate to new system

### User Deletes Their Bot Token

If a user accidentally deletes their Telegram bot:

**Solution:**
1. User creates a new bot via @BotFather
2. User updates setup via `POST /api/channels/telegram/setup` (same endpoint)
3. System updates existing channel record or creates new one
4. User sends `/start` to new bot

### Channel Fails to Start on Server Boot

If a channel fails during initialization:

**Current Behavior:**
- MessagingService logs error
- Continues initializing other channels
- Server doesn't crash

**User Impact:**
- That specific user won't receive messages
- Logged in `messaging_notifications` as "failed"

**Admin Action:**
1. Check logs for specific error
2. Common issues:
   - Invalid bot token (user needs to re-setup)
   - WhatsApp session expired (user needs to re-scan QR)
3. Contact user to re-setup channel

---

## 📝 Environment Variables Cleanup

### Old (can remove after migration complete):
```bash
# DEPRECATED - Remove these from .env.local
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
WHAPI_API_TOKEN=...
WHAPI_API_URL=...
```

### New (keep these):
```bash
# Required for user-managed messaging
ENCRYPTION_KEY=your-64-char-hex-key
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your-password
```

---

## 🎨 Frontend Updates Needed

### Settings Page

**Add these UI components:**

1. **Telegram Setup Section**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Telegram Integration</CardTitle>
       <CardDescription>
         Create your own bot to receive daily sparks
       </CardDescription>
     </CardHeader>
     <CardContent>
       <TelegramSetupForm />
       {/* Shows: bot creation steps, token input, status */}
     </CardContent>
   </Card>
   ```

2. **WhatsApp Setup Section**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>WhatsApp Integration</CardTitle>
       <CardDescription>
         Scan QR code to link your WhatsApp
       </CardDescription>
     </CardHeader>
     <CardContent>
       <WhatsAppSetupForm />
       {/* Shows: QR code (via SSE), scan instructions, status */}
     </CardContent>
   </Card>
   ```

3. **Channel Status Display**
   ```tsx
   <Badge variant={enabled ? "success" : "secondary"}>
     {platform === 'telegram' && linked ? "✓ Connected" : "⊗ Not Connected"}
   </Badge>
   ```

### Example: Telegram Setup Component

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TelegramSetupForm() {
  const [botToken, setBotToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/channels/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken })
      });

      if (res.ok) {
        setStatus('success');
        // Show instructions: "Now send /start to your bot"
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Open Telegram and search for <code>@BotFather</code></li>
        <li>Send <code>/newbot</code> and follow instructions</li>
        <li>Copy the bot token you receive</li>
        <li>Paste it below and click Connect</li>
      </ol>

      <Input
        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
        value={botToken}
        onChange={(e) => setBotToken(e.target.value)}
      />

      <Button onClick={handleSetup} disabled={loading || !botToken}>
        {loading ? 'Connecting...' : 'Connect Telegram Bot'}
      </Button>

      {status === 'success' && (
        <Alert variant="success">
          <AlertTitle>Bot Connected!</AlertTitle>
          <AlertDescription>
            Now send <code>/start</code> to your bot on Telegram to complete setup.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### MessagingService not starting

**Symptoms:**
- No logs showing `[MessagingService] Initializing...`
- Test endpoints fail with "channel not initialized"

**Solutions:**
1. Check `instrumentation.ts` includes init import
2. Verify `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` are set
3. Check PocketBase is accessible from server
4. Restart Next.js server

### Channels not sending messages

**Symptoms:**
- MessagingService initialized
- But `sendMessage()` fails

**Solutions:**
1. Check channel is enabled in `messaging_channels`
2. Verify user sent `/start` to their Telegram bot (for Telegram)
3. Check WhatsApp session hasn't expired (for WhatsApp)
4. Look at `messaging_notifications` for specific error messages

### QR Code not appearing (WhatsApp)

**Symptoms:**
- GET `/api/channels/whatsapp/setup` times out
- No QR code received via SSE

**Solutions:**
1. Check Puppeteer dependencies installed on server
2. Verify server has enough memory (WhatsApp Web needs ~500MB)
3. Check firewall allows WhatsApp Web connections
4. Try headless: false in dev for debugging

---

## ✅ Migration Checklist

### Backend
- [x] MessagingService created and tested
- [x] Telegram/WhatsApp channels implemented
- [x] API endpoints created (setup, status)
- [x] Cron delivery updated to use new system
- [x] Test endpoints updated
- [x] Old messaging.ts removed
- [x] Environment variables documented

### Database
- [x] messaging_channels collection created
- [x] messaging_notifications collection created
- [ ] Old users.messaging_id field marked as deprecated (manual step)

### Frontend (TODO - Not yet implemented)
- [ ] Telegram setup UI component
- [ ] WhatsApp setup UI component with SSE QR display
- [ ] Channel status indicators
- [ ] Migration banner for old users
- [ ] Help documentation

### DevOps
- [ ] ENCRYPTION_KEY added to production .env
- [ ] Server restarted to initialize MessagingService
- [ ] Monitoring set up for failed notifications
- [ ] Alert emails for critical channel failures

### User Communication
- [ ] Migration email drafted
- [ ] In-app banner implemented
- [ ] Help docs updated
- [ ] FAQ created

---

## 📞 Support

If you encounter issues during migration:

1. Check logs: `tail -f logs/app.log | grep MessagingService`
2. Review PocketBase `messaging_notifications` for errors
3. Test with a fresh user account
4. Verify all environment variables are set correctly

**Migration complete when:**
- ✅ All active users have migrated to new system
- ✅ No more messages to users.messaging_id
- ✅ messaging_channels has records for all active users
- ✅ Cron delivery successful for 7+ days
- ✅ Zero failed notifications in logs

Then you can safely remove `messaging_platform` and `messaging_id` fields from users collection.
