# Telegram Bot Integration

This guide covers setting up a Telegram bot for automated spark delivery to Luvora users.

## Overview

Luvora can send daily sparks directly to users via Telegram. This requires creating a Telegram bot and connecting it to your Luvora backend.

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

## Step 1: Create a Telegram Bot

### Using BotFather

1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Follow the prompts:
   - Bot name: `Luvora Sparks` (display name)
   - Bot username: `luvora_sparks_bot` (must end in `bot`)
4. BotFather will reply with your bot token

```
Done! Congratulations on your new bot. You will find it at t.me/luvora_sparks_bot.

Use this token to access the HTTP API:
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

5. Save the token:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

## Step 2: Configure Bot Settings

Send these commands to `@BotFather`:

### Set Bot Description

```
/setdescription
```
Select your bot, then send:
```
Daily love messages delivered straight to your heart. Powered by Luvora.
```

### Set Bot About

```
/setabouttext
```
Select your bot, then send:
```
Receive personalized romantic sparks every day. Connect your Luvora account to get started.
```

### Set Bot Profile Picture

```
/setuserpic
```
Select your bot, then upload your Luvora logo.

### Set Bot Commands

```
/setcommands
```
Select your bot, then send:
```
start - Connect your Luvora account
spark - Get today's spark
stop - Stop receiving messages
help - Get help
```

---

## Step 3: User Connection Flow

### How Users Connect

1. User goes to Luvora dashboard > Automation
2. Selects "Telegram" as messaging platform
3. Clicks "Connect Telegram"
4. Opens Telegram and starts chat with bot
5. Bot sends a verification code
6. User enters code in Luvora dashboard
7. Connection established

### Storing User Chat ID

When a user sends `/start` to your bot, you receive their `chat_id`. This is stored in the user's PocketBase record:

| Field | Value |
|-------|-------|
| messaging_platform | `telegram` |
| messaging_id | `123456789` (chat_id) |

---

## Step 4: Bot Implementation

### Webhook vs Polling

**Webhook (Recommended for Production)**
- Telegram pushes updates to your server
- More efficient, no constant polling
- Requires HTTPS endpoint

**Polling (Development)**
- Your server pulls updates from Telegram
- Simpler setup, works locally
- Less efficient

### Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/telegram/webhook"}'
```

### Webhook Endpoint Example

Create `/src/app/api/telegram/webhook/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const update = await request.json();

    // Handle /start command
    if (update.message?.text === '/start') {
        const chatId = update.message.chat.id;
        const username = update.message.from.username;

        // Generate verification code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Store code temporarily (Redis, database, etc.)
        // await storeVerificationCode(chatId, code);

        // Send verification message
        await sendTelegramMessage(chatId,
            `Welcome to Luvora!\n\nYour verification code is: ${code}\n\nEnter this code in your Luvora dashboard to connect your account.`
        );
    }

    // Handle /spark command
    if (update.message?.text === '/spark') {
        const chatId = update.message.chat.id;
        // Get user's spark and send it
    }

    return NextResponse.json({ ok: true });
}

async function sendTelegramMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}
```

---

## Step 5: Sending Sparks

### Daily Spark Delivery

Create a cron job or scheduled function to send daily sparks:

```typescript
async function sendDailySparkToTelegram(userId: string, chatId: string, spark: string) {
    const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `${spark}\n\n— Luvora`,
                parse_mode: 'HTML'
            })
        }
    );

    return response.ok;
}
```

### Message Formatting

Telegram supports HTML formatting:

```html
<b>Bold text</b>
<i>Italic text</i>
<code>Monospace</code>
<a href="https://luvora.love">Link</a>
```

Example spark message:

```html
<i>"Every moment with you feels like the universe conspiring in our favor."</i>

— Luvora
```

---

## Step 6: Scheduled Delivery

### Using Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-sparks",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Cron Endpoint

```typescript
// /src/app/api/cron/send-sparks/route.ts
export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Get users with Telegram enabled and matching morning_time
    // Send sparks to each user

    return Response.json({ sent: count });
}
```

---

## API Reference

### Send Message

```
POST https://api.telegram.org/bot<token>/sendMessage
```

```json
{
    "chat_id": 123456789,
    "text": "Your message here",
    "parse_mode": "HTML"
}
```

### Send Photo with Caption

```
POST https://api.telegram.org/bot<token>/sendPhoto
```

```json
{
    "chat_id": 123456789,
    "photo": "https://example.com/image.jpg",
    "caption": "Your spark message"
}
```

### Get Bot Info

```
GET https://api.telegram.org/bot<token>/getMe
```

---

## Troubleshooting

### Bot Not Responding

1. Verify token is correct
2. Check webhook is set (or polling is running)
3. Test with `getMe` endpoint

### Messages Not Delivering

1. User must have started chat with bot first
2. Verify chat_id is correct
3. Check for rate limiting (30 messages/second max)

### Webhook Issues

1. Ensure HTTPS endpoint
2. Verify SSL certificate is valid
3. Check webhook info:

```bash
curl "https://api.telegram.org/bot<token>/getWebhookInfo"
```

### Rate Limits

- 30 messages per second to different chats
- 1 message per second to same chat
- 20 messages per minute to same group

---

## Security Best Practices

1. Never expose bot token in client-side code
2. Validate webhook updates using secret token
3. Implement rate limiting on your endpoints
4. Log suspicious activity
5. Allow users to disconnect/stop at any time
