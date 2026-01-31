# Luvora Setup Guide

Complete guide for setting up all integrations and environment variables.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [PocketBase Configuration](#pocketbase-configuration)
3. [Google Analytics 4](#google-analytics-4)
4. [Google AdSense](#google-adsense)
5. [Lemon Squeezy Payments](#lemon-squeezy-payments)
6. [Telegram Bot Setup](#telegram-bot-setup)
7. [WhatsApp Business API](#whatsapp-business-api)
8. [Cron Jobs](#cron-jobs)

---

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values for each service as described below.

---

## PocketBase Configuration

### Variables
```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.luvora.love
POCKETBASE_ADMIN_EMAIL=admin@luvora.love
POCKETBASE_ADMIN_PASSWORD=your-secure-password
```

### Setup Steps
1. Download PocketBase from [pocketbase.io](https://pocketbase.io)
2. Run `./pocketbase serve`
3. Visit `http://127.0.0.1:8090/_/` to create admin account
4. Import schema from `pb_schema.json` in Settings > Import Collections

---

## Google Analytics 4

Track user engagement, conversions, and spark interactions.

### Variables
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your-api-secret
```

### Setup Steps

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com)
   - Admin > Create Property
   - Enter "Luvora" as property name
   - Select your timezone and currency

2. **Get Measurement ID**
   - Admin > Data Streams > Web
   - Add stream with URL: `https://luvora.love`
   - Copy the **Measurement ID** (starts with `G-`)
   - Set as `NEXT_PUBLIC_GA_MEASUREMENT_ID`

3. **Create API Secret (for server-side tracking)**
   - In the Data Stream details, scroll to "Measurement Protocol API secrets"
   - Click "Create" and give it a nickname
   - Copy the secret value
   - Set as `GA_API_SECRET`

### Events Tracked
| Event | Description |
|-------|-------------|
| `spark_copied` | User copied a spark message |
| `spark_shared` | User shared a spark card |
| `upgrade_started` | User began checkout process |
| `upgrade_completed` | User completed purchase |
| `automation_enabled` | User set up auto-delivery |
| `ad_impression` | Ad was displayed (Free tier) |
| `ad_click` | User clicked an ad |

---

## Google AdSense

Display ads for Free tier users to generate revenue.

### Variables
```env
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL=0987654321
```

### Setup Steps

1. **Sign Up for AdSense**
   - Go to [Google AdSense](https://www.google.com/adsense)
   - Sign in with your Google account
   - Add your site: `luvora.love`
   - Wait for approval (can take 1-14 days)

2. **Get Publisher ID**
   - Once approved, go to Account > Account Information
   - Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXX`)
   - Set as `NEXT_PUBLIC_ADSENSE_CLIENT`

3. **Create Ad Units**
   - Go to Ads > By ad unit > Display ads
   - Create a "Banner" ad unit
     - Name: "Luvora Banner"
     - Size: Responsive
     - Copy the data-ad-slot value
     - Set as `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`
   - Create an "Interstitial" ad unit (optional)
     - Copy its data-ad-slot value
     - Set as `NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL`

### Ad Placement
- Ads only show to **Free tier** users
- Hero and Legend users get an ad-free experience
- Ad positions: Below spark card on home page

---

## Lemon Squeezy Payments

Process one-time payments for Hero and Legend tiers.

### Variables
```env
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_HERO_VARIANT_ID=your-hero-variant
LEMONSQUEEZY_LEGEND_VARIANT_ID=your-legend-variant
```

### Setup Steps

1. **Create Store**
   - Go to [Lemon Squeezy](https://app.lemonsqueezy.com)
   - Create a new store for Luvora

2. **Create Products**
   - Products > New Product
   - **Hero Tier**: $4.99 one-time
   - **Legend Tier**: $19.99 one-time
   - Note the variant IDs from each product URL

3. **Get API Key**
   - Settings > API > Create API Key
   - Copy and set as `LEMONSQUEEZY_API_KEY`

4. **Configure Webhook**
   - Settings > Webhooks > Add Endpoint
   - URL: `https://luvora.love/api/webhooks/payments`
   - Events: `order_created`, `order_paid`
   - Copy the signing secret
   - Set as `LEMONSQUEEZY_WEBHOOK_SECRET`

5. **Add Custom Data**
   - In checkout, pass `user_id` and `tier` in custom_data

---

## Telegram Bot Setup

Enable automated spark delivery via Telegram.

### Variables
```env
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Setup Steps

1. **Create Bot**
   - Open Telegram and message [@BotFather](https://t.me/BotFather)
   - Send `/newbot`
   - Name: "Luvora Sparks"
   - Username: "LuvoraSparksBot" (must end in 'bot')
   - Copy the token provided
   - Set as `TELEGRAM_BOT_TOKEN`

2. **Configure Bot**
   - Send `/setdescription` - Add description
   - Send `/setabouttext` - Add about text
   - Send `/setuserpic` - Upload Luvora logo

3. **User Flow**
   - User clicks "Connect Telegram" in dashboard
   - Opens Telegram with bot
   - User sends `/start`
   - Bot returns their chat ID
   - User enters chat ID in dashboard

---

## WhatsApp Business API

Enable automated spark delivery via WhatsApp.

### Variables
```env
WHATSAPP_API_TOKEN=your-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### Setup Steps

1. **Create Meta Developer Account**
   - Go to [Meta for Developers](https://developers.facebook.com)
   - Create a new app (Business type)

2. **Set Up WhatsApp**
   - Add WhatsApp product to your app
   - Go to WhatsApp > API Setup
   - Note your **Phone Number ID**
   - Generate a permanent access token
   - Set both in environment variables

3. **Create Message Templates**
   - WhatsApp > Message Templates
   - Create template for daily sparks
   - Wait for template approval

4. **Verify Business**
   - Complete business verification for production access

---

## Cron Jobs

Automated daily spark delivery at user-specified times.

### Variables
```env
CRON_SECRET=your-random-secret
```

### Setup Steps

1. **Generate Secret**
   ```bash
   openssl rand -hex 32
   ```
   Set this as `CRON_SECRET`

2. **Configure Vercel Cron** (if using Vercel)
   - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/deliver?secret=YOUR_CRON_SECRET",
       "schedule": "0 * * * *"
     }]
   }
   ```

3. **Alternative: External Cron Service**
   - Use [cron-job.org](https://cron-job.org) or similar
   - Set up hourly calls to:
   ```
   GET https://luvora.love/api/cron/deliver?secret=YOUR_CRON_SECRET
   ```

---

## Admin Access

### Variables
```env
NEXT_PUBLIC_ADMIN_UUIDS=user-id-1,user-id-2
NEXT_PUBLIC_ADMIN_EMAILS=admin@luvora.love
```

### Setup
- Add your PocketBase user ID to `NEXT_PUBLIC_ADMIN_UUIDS`
- Or add your email to `NEXT_PUBLIC_ADMIN_EMAILS`
- Admins can access `/admin` dashboard

---

## Verification Checklist

After setup, verify each integration:

- [ ] PocketBase: Can create/read users
- [ ] GA4: Events appear in Realtime report
- [ ] AdSense: Test ad renders (use test mode)
- [ ] Lemon Squeezy: Test purchase flow
- [ ] Telegram: Bot responds to `/start`
- [ ] WhatsApp: Test message sends successfully
- [ ] Cron: Delivery endpoint returns 200

---

## Troubleshooting

### GA4 events not appearing
- Check Measurement ID is correct
- Verify domain in GA4 Data Stream
- Wait 24-48 hours for non-realtime reports

### AdSense not showing
- Ensure account is approved
- Check ad slot IDs are correct
- Verify `NEXT_PUBLIC_ADSENSE_CLIENT` format

### Webhook failures
- Verify webhook secret matches
- Check endpoint URL is correct
- Review Lemon Squeezy webhook logs

### Telegram bot not responding
- Verify bot token is correct
- Check bot is not blocked
- Ensure user started conversation first

---

## Support

For additional help:
- Email: support@luvora.love
- GitHub Issues: [github.com/luvora/luvora](https://github.com/luvora/luvora)
