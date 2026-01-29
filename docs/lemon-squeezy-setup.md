# Lemon Squeezy Payment Integration

This guide covers the complete setup for integrating Lemon Squeezy payments with Luvora.

## Overview

Luvora uses Lemon Squeezy for one-time payments to upgrade users to Hero or Legend tiers.

| Tier | Price | Numeric Value |
|------|-------|---------------|
| Free (Voyager) | $0 | 0 |
| Hero | $4.99 | 1 |
| Legend | $14.99 | 2 |

## Environment Variables

```env
LEMONSQUEEZY_API_KEY=eyJ...
LEMONSQUEEZY_STORE_ID=123456
LEMONSQUEEZY_HERO_VARIANT_ID=789012
LEMONSQUEEZY_LEGEND_VARIANT_ID=789013
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
```

---

## Step 1: Create a Lemon Squeezy Account

1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Sign up for a new account
3. Complete the verification process (may take 1-3 business days)
4. Set up your payout method in Settings > Payouts

---

## Step 2: Create Your Store

1. Navigate to **Settings > Store**
2. Configure your store details:
   - Store name: Luvora
   - Store URL: luvora (creates luvora.lemonsqueezy.com)
   - Currency: USD
   - Tax settings: Configure based on your location

---

## Step 3: Create Products

### Product 1: Luvora Hero

1. Go to **Store > Products > Create Product**
2. Configure:
   - **Name**: Luvora Hero
   - **Description**: Unlock daily sparks, automation features, and 30-day message history.
   - **Pricing**: One-time payment, $4.99 USD
   - **Media**: Upload product image (optional)
3. Click **Publish**

### Product 2: Luvora Legend

1. Go to **Store > Products > Create Product**
2. Configure:
   - **Name**: Luvora Legend
   - **Description**: All Hero features plus premium messages, partner linking, photo memory cards, and 90-day history.
   - **Pricing**: One-time payment, $14.99 USD
   - **Media**: Upload product image (optional)
3. Click **Publish**

---

## Step 4: Get Your Credentials

### API Key

1. Go to **Settings > API**
2. Click **Create API Key**
3. Name: "Luvora Production"
4. Permissions: Leave default (full access)
5. Click **Create**
6. Copy the key immediately (it won't be shown again)

```env
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

### Store ID

1. Go to **Settings > Store**
2. Find your Store ID in the URL or General settings
3. Example URL: `https://app.lemonsqueezy.com/stores/281930`

```env
LEMONSQUEEZY_STORE_ID=281930
```

### Variant IDs

Each product has variants. For simple one-time products, there's typically one default variant.

1. Go to **Store > Products**
2. Click on **Luvora Hero**
3. Click on the variant row
4. Check the URL: `/products/XXXXX/variants/YYYYYY`
5. The variant ID is `YYYYYY`

```env
LEMONSQUEEZY_HERO_VARIANT_ID=123456
LEMONSQUEEZY_LEGEND_VARIANT_ID=123457
```

---

## Step 5: Configure Webhook

The webhook receives payment notifications and automatically upgrades users.

### Create Webhook

1. Go to **Settings > Webhooks**
2. Click **Create Webhook**
3. Configure:
   - **URL**: `https://yourdomain.com/api/webhooks/payments`
   - **Events**: Select the following:
     - `order_created`
     - `order_paid`
   - **Signing Secret**: Click "Generate" to create one
4. Click **Save**
5. Copy the signing secret

```env
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_abc123...
```

### Webhook Endpoint

The webhook is located at `/src/app/api/webhooks/payments/route.ts` and handles:

1. Signature verification using HMAC SHA-256
2. Event type validation (order_created, order_paid)
3. User tier upgrade based on purchased product
4. Idempotency check to prevent duplicate upgrades

---

## Step 6: Testing

### Enable Test Mode

1. In Lemon Squeezy dashboard, toggle **Test Mode** (top right)
2. Create test products or use existing ones in test mode
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry, any CVC

### Test Webhook Locally

For local development, use a tunnel service:

```bash
# Using ngrok
ngrok http 3000

# Update webhook URL temporarily
# https://abc123.ngrok.io/api/webhooks/payments
```

### Send Test Webhook

1. Go to **Settings > Webhooks**
2. Click on your webhook
3. Click **Send Test**
4. Check your server logs for the response

---

## Payment Flow

```
1. User clicks "Upgrade to Hero" on pricing page
   |
2. Frontend calls createCheckoutSession(userId, email, 'hero')
   |
3. Server creates checkout via Lemon Squeezy API
   |
4. User redirected to Lemon Squeezy checkout page
   |
5. User completes payment
   |
6. Lemon Squeezy sends webhook to /api/webhooks/payments
   |
7. Webhook verifies signature and extracts user_id + tier
   |
8. Server updates user.tier in PocketBase (0 -> 1 or 2)
   |
9. User sees upgraded features on next page load
```

---

## Checkout Session API

The checkout session is created in `/src/actions/payments.ts`:

```typescript
export async function createCheckoutSession(
    userId: string,
    userEmail: string,
    tier: 'hero' | 'legend' = 'hero'
)
```

Custom data passed to checkout:
- `user_id`: PocketBase user ID
- `tier`: 'hero' or 'legend'

This data is returned in the webhook payload for user identification.

---

## Troubleshooting

### Webhook Not Receiving Events

1. Verify webhook URL is publicly accessible
2. Check webhook is enabled in Lemon Squeezy
3. Ensure SSL certificate is valid (HTTPS required)
4. Check server logs for incoming requests

### Invalid Signature Error

1. Verify `LEMONSQUEEZY_WEBHOOK_SECRET` matches Lemon Squeezy
2. Ensure raw body is used for signature verification (not parsed JSON)
3. Check for middleware that might modify the request body

### User Not Upgraded

1. Check webhook logs in Lemon Squeezy dashboard
2. Verify `custom_data.user_id` is present in checkout
3. Check PocketBase admin credentials are correct
4. Ensure user exists in PocketBase

### Test Mode vs Live Mode

- Test mode webhooks only work with test mode checkouts
- Live mode webhooks only work with live mode checkouts
- Ensure consistency between dashboard mode and environment

---

## Security Considerations

1. Never expose API keys in client-side code
2. Always verify webhook signatures
3. Use HTTPS for all webhook endpoints
4. Implement idempotency to handle duplicate webhooks
5. Log webhook events for debugging (without sensitive data)
