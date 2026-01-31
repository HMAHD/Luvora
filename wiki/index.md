# Luvora Documentation

Welcome to the Luvora technical documentation. This guide covers all configuration and integration setup for the Luvora application.

## Environment Configuration

All environment variables are configured in `.env.local`. Below is a reference of all required variables.

### Quick Reference

```env
# PocketBase Backend
NEXT_PUBLIC_POCKETBASE_URL=https://api.yourdomain.com
POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password

# Payment Processing (Lemon Squeezy)
LEMONSQUEEZY_API_KEY=eyJ...
LEMONSQUEEZY_STORE_ID=123456
LEMONSQUEEZY_HERO_VARIANT_ID=789012
LEMONSQUEEZY_LEGEND_VARIANT_ID=789013
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...

# Messaging Automation
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
WHATSAPP_API_TOKEN=EAABsbCS1IH0BO...
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# Security
PREMIUM_POOL_SECRET=random_secret_for_premium_messages

# Admin Access
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [PocketBase Setup](./pocketbase-setup.md) | Backend database configuration, collections, and API rules |
| [PocketBase Email Templates](./pocketbase-email-templates.md) | Auth email templates (verification, password reset, OTP, etc.) |
| [Lemon Squeezy Setup](./lemon-squeezy-setup.md) | Payment integration for Hero and Legend tiers |
| [Telegram Bot Setup](./telegram-bot-setup.md) | Automated spark delivery via Telegram |
| [WhatsApp API Setup](./whatsapp-api-setup.md) | Automated spark delivery via WhatsApp Business API |
| [Email Templates](./email-templates.md) | HTML email templates for user communications (welcome, sparks, etc.) |

---

## Architecture Overview

```
                                 +------------------+
                                 |    Frontend      |
                                 |   (Next.js)      |
                                 +--------+---------+
                                          |
                    +---------------------+---------------------+
                    |                     |                     |
           +--------v--------+   +--------v--------+   +--------v--------+
           |   PocketBase    |   | Lemon Squeezy   |   |   Messaging     |
           |   (Backend)     |   |  (Payments)     |   | (Telegram/WA)   |
           +-----------------+   +-----------------+   +-----------------+
```

### Data Flow

1. **User Authentication**: PocketBase handles user signup, login, and session management
2. **Spark Generation**: Algorithm generates daily sparks based on user preferences and tier
3. **Payment Processing**: Lemon Squeezy handles checkout, webhooks upgrade user tier in PocketBase
4. **Automated Delivery**: Cron jobs send sparks via Telegram or WhatsApp based on user settings

---

## Tier System

| Tier | Value | Price | Key Features |
|------|-------|-------|--------------|
| Free (Voyager) | 0 | $0 | Basic sparks, 7-day history |
| Hero | 1 | $4.99 | Automation, 30-day history, all tones |
| Legend | 2 | $14.99 | Premium messages, partner link, 90-day history, photo cards |

---

## Deployment Checklist

### Pre-Launch

- [ ] PocketBase deployed and accessible
- [ ] All collections created with correct API rules
- [ ] Lemon Squeezy account verified
- [ ] Products created with correct pricing
- [ ] Webhook configured and tested
- [ ] Telegram bot created (if using)
- [ ] WhatsApp Business API configured (if using)
- [ ] Email templates configured in email provider
- [ ] Environment variables set in production

### Post-Launch

- [ ] Monitor webhook logs for payment issues
- [ ] Check user upgrade flow works end-to-end
- [ ] Verify automated spark delivery
- [ ] Test password reset flow
- [ ] Confirm email delivery

---

## Support

For technical issues or questions:

1. Check the relevant documentation section
2. Review error logs in your deployment platform
3. Check PocketBase admin panel for data issues
4. Review Lemon Squeezy dashboard for payment issues
5. Check Telegram/WhatsApp API logs for delivery issues

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial documentation |
