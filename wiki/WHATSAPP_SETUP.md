# WhatsApp Business API Setup Guide

This guide walks you through setting up WhatsApp Business API for Luvora to send romantic messages via WhatsApp.

## Overview

WhatsApp Business API allows you to send automated messages to users. However, it requires:
- Business verification by Meta
- Approved message templates
- A phone number dedicated to the business

## Prerequisites

- A Facebook Business Manager account
- A phone number that isn't already registered with WhatsApp
- Business verification documents
- Meta Developer account

## Step 1: Create Meta Developer App

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in app details:
   - App Name: "Luvora"
   - Contact Email: your email
   - Business Account: Select or create one

5. Click "Create App"

## Step 2: Add WhatsApp Product

1. In your app dashboard, find "WhatsApp" in the Products section
2. Click "Set Up"
3. Select or create a Meta Business Account
4. Complete the setup wizard

## Step 3: Get API Credentials

### App ID and Secret

1. Go to Settings → Basic
2. Copy your **App ID**
3. Click "Show" next to App Secret and copy it
4. Add to `.env.local`:
   ```bash
   WHATSAPP_APP_ID=your_app_id
   WHATSAPP_APP_SECRET=your_app_secret
   ```

### Access Token

1. Go to WhatsApp → Getting Started
2. Under "Temporary access token" click "Generate Token"
3. Copy the token (valid for 24 hours)
4. For permanent token, you'll need to:
   - Go to Business Settings
   - Click System Users → Add
   - Create a system user
   - Assign WhatsApp permissions
   - Generate a permanent token

5. Add to `.env.local`:
   ```bash
   WHATSAPP_ACCESS_TOKEN=your_access_token
   ```

### Phone Number ID

1. In WhatsApp → Getting Started
2. Find "Phone Number ID" under "Send and receive messages"
3. Copy the ID
4. Add to `.env.local`:
   ```bash
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   ```

### Business Account ID

1. In Business Settings → Business Info
2. Copy the Business Account ID
3. Add to `.env.local`:
   ```bash
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
   ```

## Step 4: Verify Your Phone Number

1. In WhatsApp → API Setup
2. Add and verify your phone number
3. Follow the verification steps:
   - Enter phone number
   - Receive verification code via SMS or call
   - Enter the code

**Important:** This number will be used to send messages and cannot be used with regular WhatsApp.

## Step 5: Configure Webhook

1. In WhatsApp → Configuration
2. Click "Edit" next to Webhook
3. Set Callback URL: `https://luvora.love/api/webhooks/whatsapp`
4. Generate a random verify token:
   ```bash
   openssl rand -hex 32
   ```
5. Add to `.env.local`:
   ```bash
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_token_here
   ```
6. Subscribe to webhook fields:
   - messages
   - message_status

## Step 6: Create Message Templates

WhatsApp requires pre-approved templates for sending messages to users.

### Create Templates in Meta Business Manager

1. Go to WhatsApp Manager (business.facebook.com)
2. Select your WhatsApp Business Account
3. Go to Account Tools → Message Templates
4. Click "Create Template"

### Template Examples for Luvora

#### Morning Message Template

**Name:** `morning_spark`
**Category:** Marketing
**Language:** English

**Body:**
```
Good morning, {{1}}! 💕

{{2}}

Sent with love from Luvora ✨
Reply STOP to unsubscribe.
```

**Variables:**
- `{{1}}` = Partner's name
- `{{2}}` = The romantic message

#### Evening Message Template

**Name:** `evening_spark`
**Category:** Marketing
**Language:** English

**Body:**
```
Good evening, {{1}}! 💕

{{2}}

Sweet dreams from Luvora 🌙
Reply STOP to unsubscribe.
```

#### Welcome Template

**Name:** `welcome_message`
**Category:** Utility
**Language:** English

**Body:**
```
Welcome to Luvora! 💕

Thanks for subscribing. Your partner will start receiving daily romantic messages from you.

To manage your subscription, visit luvora.love/dashboard
```

### Submit for Approval

1. After creating templates, submit for review
2. Approval usually takes 24-48 hours
3. Once approved, you can use them in your code

## Step 7: Implement WhatsApp Delivery

Create the WhatsApp delivery service:

```typescript
// src/lib/whatsapp.ts
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

export async function sendWhatsAppMessage(
  to: string,
  templateName: string,
  parameters: string[]
) {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: parameters.map(text => ({
                type: 'text',
                text: text,
              })),
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}
```

## Step 8: Update Delivery Endpoint

Modify `/api/cron/deliver` to support WhatsApp:

```typescript
// Check delivery method
if (subscription.delivery_method === 'whatsapp' && subscription.whatsapp_number) {
  // Send via WhatsApp
  const templateName = timeOfDay === 'morning' ? 'morning_spark' : 'evening_spark';
  await sendWhatsAppMessage(
    subscription.whatsapp_number,
    templateName,
    [subscription.partner_name || 'there', message.text]
  );
} else if (subscription.telegram_chat_id) {
  // Existing Telegram code
  // ...
}
```

## Step 9: Handle WhatsApp Webhook

Create webhook handler for incoming messages:

```typescript
// src/app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle incoming messages (e.g., STOP commands)
  if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const message = body.entry[0].changes[0].value.messages[0];
    const from = message.from;
    const text = message.text?.body?.toLowerCase();

    if (text === 'stop' || text === 'unsubscribe') {
      // Handle unsubscribe
      await handleUnsubscribe(from);
    }
  }

  return NextResponse.json({ status: 'ok' });
}
```

## Step 10: Business Verification

For production use, you need to verify your business:

1. Go to Business Settings → Security Center
2. Start business verification
3. Provide:
   - Business registration documents
   - Tax ID
   - Business address
   - Website
   - Business email

4. Wait for approval (1-2 weeks typically)

## Step 11: Request Higher Messaging Limits

Initially, you're limited to messaging 250 unique users per day.

To increase limits:
1. Maintain good message quality
2. Keep low block rates
3. Get positive user feedback
4. Request limit increase in WhatsApp Manager

Limits can increase to:
- Tier 1: 1,000 conversations/day
- Tier 2: 10,000 conversations/day
- Tier 3: 100,000 conversations/day
- Tier 4: Unlimited

## Costs

WhatsApp Business API pricing (as of 2024):
- **Marketing messages:** ~$0.0145 - $0.0366 per message (varies by country)
- **Utility messages:** ~$0.0025 - $0.0055 per message
- **Service messages:** Free (within 24-hour customer service window)

**Tip:** Use "Utility" category for subscription confirmations and "Marketing" for daily sparks.

## Best Practices

### 1. Respect Opt-Ins
- Only message users who explicitly subscribed
- Make unsubscribe easy (reply STOP)
- Honor opt-out requests immediately

### 2. Message Quality
- Use approved templates only
- Personalize with variables
- Keep messages valuable and relevant
- Avoid spam-like content

### 3. Timing
- Send messages at appropriate times
- Respect time zones
- Allow users to set preferences

### 4. Rate Limiting
- Don't exceed your tier limits
- Implement queuing for high volume
- Monitor delivery status

### 5. Error Handling
- Handle invalid phone numbers gracefully
- Retry failed messages with exponential backoff
- Log errors for debugging
- Fallback to Telegram if WhatsApp fails

### 6. Compliance
- GDPR compliance for EU users
- Store consent records
- Provide data access/deletion
- Include privacy policy links

## Testing

### Test Mode

1. Use the test phone number provided in WhatsApp → API Setup
2. Send test messages before going live
3. Verify templates render correctly
4. Check delivery status callbacks

### Going Live

1. Complete business verification
2. Get all templates approved
3. Add production phone number
4. Test with real users (start small)
5. Monitor error rates and feedback

## Monitoring & Analytics

### Track These Metrics

1. **Delivery Rate:** Successfully delivered messages
2. **Read Rate:** Messages read by recipients
3. **Response Rate:** Users replying to messages
4. **Block Rate:** Users blocking your number (keep < 0.5%)
5. **Report Rate:** Users reporting as spam (keep < 0.1%)

### View Analytics

1. Go to WhatsApp Manager
2. Select your account
3. Click "Insights"
4. Monitor:
   - Message volume
   - Quality rating
   - Limit status

## Troubleshooting

### Common Issues

**Template Not Approved:**
- Make sure template follows guidelines
- Avoid promotional language in Utility templates
- Include clear opt-out instructions
- Resubmit with modifications

**Invalid Phone Number:**
- Use E.164 format: +[country code][number]
- Validate before sending
- Remove spaces and special characters

**Rate Limit Exceeded:**
- Implement queuing
- Spread messages throughout the day
- Request tier upgrade

**Low Quality Rating:**
- Reduce message frequency
- Improve message relevance
- Make opt-out easier
- Respond to user feedback

**Webhook Not Working:**
- Verify SSL certificate is valid
- Check verify token matches
- Ensure endpoint is publicly accessible
- Review webhook logs in Meta dashboard

## Resources

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Message Templates Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [WhatsApp Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)

## Next Steps

After setting up WhatsApp:

1. Update database schema to store `whatsapp_number`
2. Add WhatsApp number field to onboarding flow
3. Let users choose delivery method (Telegram or WhatsApp)
4. Monitor delivery success rates
5. Gather user feedback
6. Optimize templates based on engagement

## Security Checklist

- [ ] Secure all API keys and tokens
- [ ] Use HTTPS for all webhook endpoints
- [ ] Validate webhook signatures
- [ ] Implement rate limiting
- [ ] Log all API calls for audit
- [ ] Encrypt stored phone numbers
- [ ] Regular security audits
- [ ] GDPR compliance measures

## Support

For issues with WhatsApp Business API:
- Meta Business Help Center
- WhatsApp Business API Support
- Developer Community Forums
