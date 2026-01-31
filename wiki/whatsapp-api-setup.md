# WhatsApp Business API Integration

This guide covers setting up WhatsApp Business API for automated spark delivery to Luvora users.

## Overview

Luvora can send daily sparks via WhatsApp using the official WhatsApp Business API through Meta's Cloud API.

## Environment Variables

```env
WHATSAPP_API_TOKEN=EAABsbCS1IH0BO...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

---

## Step 1: Meta Developer Account Setup

### Create Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Log in with your Facebook account
3. Accept the developer terms
4. Verify your account (phone or ID)

### Create a Meta App

1. Go to **My Apps > Create App**
2. Select **Business** as app type
3. Configure:
   - App name: Luvora
   - App contact email: your_email@domain.com
   - Business Account: Select or create one
4. Click **Create App**

---

## Step 2: Add WhatsApp to Your App

1. In your app dashboard, click **Add Products**
2. Find **WhatsApp** and click **Set Up**
3. You'll be directed to WhatsApp configuration

---

## Step 3: Configure WhatsApp Business

### Get API Credentials

1. Go to **WhatsApp > API Setup**
2. You'll see:
   - **Temporary Access Token** (expires in 24 hours)
   - **Phone Number ID**
   - **WhatsApp Business Account ID**

### Generate Permanent Token

1. Go to **Meta Business Suite > System Users**
2. Create a system user with admin access
3. Generate a permanent access token:
   - Click **Generate New Token**
   - Select your app
   - Required permissions:
     - `whatsapp_business_management`
     - `whatsapp_business_messaging`
   - Click **Generate Token**
4. Save the token:

```env
WHATSAPP_API_TOKEN=EAABsbCS1IH0BO...
```

### Get Phone Number ID

1. Go to **WhatsApp > API Setup**
2. Under **From**, you'll see the test phone number
3. Copy the Phone Number ID:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

---

## Step 4: Add Your Business Phone Number

For production, you need to add your own phone number:

1. Go to **WhatsApp > API Setup > Add Phone Number**
2. Enter your business phone number
3. Verify via SMS or voice call
4. Complete business verification (may take 1-3 days)

Requirements:
- Must be a phone number not already registered with WhatsApp
- Business verification required for higher message limits
- Display name must match your business

---

## Step 5: Create Message Templates

WhatsApp requires pre-approved templates for business-initiated messages.

### Create a Template

1. Go to **WhatsApp > Message Templates**
2. Click **Create Template**
3. Configure:
   - **Name**: `daily_spark`
   - **Category**: Marketing
   - **Language**: English (US)
   - **Body**:
     ```
     {{1}}

     — Luvora

     Reply STOP to unsubscribe.
     ```
4. Submit for review (takes 1-24 hours)

### Template Variables

- `{{1}}` - First variable (the spark message)
- `{{2}}` - Second variable (optional)

Example approved template:

```
Name: daily_love_message
Category: Marketing
Language: en_US

Header: None
Body: {{1}}

— Luvora

Footer: Reply STOP to unsubscribe.
Buttons: None
```

---

## Step 6: Sending Messages

### API Endpoint

```
POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
```

### Send Template Message

```typescript
async function sendWhatsAppSpark(toPhoneNumber: string, sparkMessage: string) {
    const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: toPhoneNumber,
                type: 'template',
                template: {
                    name: 'daily_spark',
                    language: { code: 'en_US' },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: sparkMessage
                                }
                            ]
                        }
                    ]
                }
            })
        }
    );

    const data = await response.json();
    return data;
}
```

### Phone Number Format

WhatsApp requires phone numbers in international format without + or spaces:

```
+1 (555) 123-4567  ->  15551234567
+91 98765 43210    ->  919876543210
```

---

## Step 7: Webhook Configuration

### Set Up Webhook

1. Go to **WhatsApp > Configuration**
2. Under **Webhook**, click **Edit**
3. Configure:
   - **Callback URL**: `https://yourdomain.com/api/whatsapp/webhook`
   - **Verify Token**: Your custom secret string
4. Subscribe to events:
   - `messages` - Receive user messages
   - `message_status` - Delivery receipts

### Webhook Verification Endpoint

```typescript
// /src/app/api/whatsapp/webhook/route.ts
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
    const body = await request.json();

    // Handle incoming messages
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
        const from = message.from; // Sender's phone number
        const text = message.text?.body;

        // Handle STOP to unsubscribe
        if (text?.toUpperCase() === 'STOP') {
            // Unsubscribe user
        }
    }

    return Response.json({ status: 'ok' });
}
```

---

## Step 8: User Connection Flow

### How Users Connect

1. User goes to Luvora dashboard > Automation
2. Selects "WhatsApp" as messaging platform
3. Enters their phone number (with country code)
4. User receives opt-in message
5. User confirms by replying
6. Connection established

### Storing User Phone Number

| Field | Value |
|-------|-------|
| messaging_platform | `whatsapp` |
| messaging_id | `15551234567` (international format) |

---

## Message Limits

### Conversation-Based Pricing

WhatsApp charges per 24-hour conversation:

| Tier | Free Conversations/Month |
|------|-------------------------|
| Tier 1 | 1,000 |
| Tier 2 | 10,000 |
| Tier 3 | 100,000 |
| Tier 4 | Unlimited |

### Rate Limits

| Limit Type | Value |
|------------|-------|
| Messages per second | 80 |
| Phone numbers per request | 1 |
| Template messages (unverified) | 250/24h |
| Template messages (verified) | 1,000+/24h |

---

## Troubleshooting

### Message Not Delivered

1. Verify phone number format (no + or spaces)
2. Check template is approved
3. Verify recipient has WhatsApp
4. Check for opt-out status

### Template Rejected

Common rejection reasons:
- Promotional content without opt-out option
- Misleading content
- Variable placeholders in wrong format
- Missing required footer

### Authentication Errors

1. Verify access token is valid
2. Check token permissions
3. Ensure phone number ID is correct

### Webhook Not Receiving Events

1. Verify callback URL is publicly accessible
2. Check SSL certificate is valid
3. Verify subscription is active

---

## Best Practices

### Opt-In Requirements

- Always get explicit opt-in before sending messages
- Include clear opt-out instructions
- Honor STOP requests immediately

### Message Content

- Keep messages concise
- Use proper formatting
- Avoid excessive emojis in templates
- Include business identification

### Rate Limiting

- Implement exponential backoff
- Queue messages for delivery
- Monitor delivery status
- Handle failures gracefully

---

## Cost Considerations

### Pricing (as of 2024)

| Conversation Type | Cost (USD) |
|-------------------|------------|
| Marketing | $0.0147 - $0.0572 |
| Utility | $0.0034 - $0.0140 |
| Authentication | $0.0045 - $0.0315 |
| Service | Free |

Prices vary by recipient country. Check [Meta's pricing page](https://developers.facebook.com/docs/whatsapp/pricing) for current rates.

### Cost Optimization

- Batch messages when possible
- Use service conversations (reply within 24h)
- Monitor conversation count
- Set budget alerts in Meta Business Suite
