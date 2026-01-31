# ⚡️ Luvora
> **The Deterministic Daily Spark.**
> *Meaningful connection, one day at a time.*

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.1-black?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-v0.26-orange?style=for-the-badge&logo=pocketbase&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white)

[![CI](https://github.com/HMAHD/Luvora/actions/workflows/ci.yml/badge.svg)](https://github.com/HMAHD/Luvora/actions/workflows/ci.yml)
[![Deploy Production](https://github.com/HMAHD/Luvora/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/HMAHD/Luvora/actions/workflows/deploy-production.yml)

</div>

## 📖 About

**Luvora** is a sovereign relationship companion app designed to deliver one deterministic, meaningful "Daily Spark" message to couples every day.

Built with the **"Mirat" Spirit** (Meaningful, Intentional, Ritualistic, Authentic, Timeless), it avoids infinite scrolling and dopamine loops in favor of a single, high-quality moment of connection.

### ✨ Key Features

#### Core Experience
- **🔐 Deterministic Algorithm**: Generates the same message for everyone on the same day, fostering a shared global experience
- **🧁/🖤 Auto-Theme Switching**: Adapts to Dawn (Cupcake) and Night (Luxury) modes automatically based on local time
- **💫 Daily Sparks**: Morning and evening messages delivered with perfect timing

#### Premium Features
- **⚡️ Tier System**: Free (Voyager), Hero, and Legend tiers with progressive features
- **🤖 Automated Delivery**: Telegram and WhatsApp integration for automatic message delivery
- **💳 One-Time Payments**: Powered by LemonSqueezy - no subscriptions, lifetime access
- **🎨 Customization**: Personalized messages based on love language and emotional tone preferences

#### Technical Excellence
- **⚡️ Sovereignty**: Self-hosted backend using PocketBase for privacy and ownership
- **📊 Observability**: Comprehensive Sentry integration with custom metrics tracking
- **🚀 CI/CD**: Automated testing and deployment with GitHub Actions
- **🔄 Zero-Downtime Deployments**: PM2 with health checks and automatic rollbacks

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Runtime**: [Bun](https://bun.sh/) for fast package management
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

### Backend & Services
- **Database**: [PocketBase](https://pocketbase.io/) (SQLite with optional PostgreSQL/MySQL)
- **Payments**: [LemonSqueezy](https://lemonsqueezy.com/)
- **Messaging**: Telegram + [Whapi.cloud](https://whapi.cloud/) (WhatsApp)
- **Email**: SendPulse SMTP
- **Monitoring**: [Sentry](https://sentry.io/) with custom metrics
- **Process Manager**: PM2

### Infrastructure
- **CI/CD**: GitHub Actions
- **Deployment**: VPS with Nginx reverse proxy
- **SSL**: Let's Encrypt via Certbot
- **Environments**: Staging (develop) & Production (main)

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** v1.1 or higher
- **[PocketBase](https://pocketbase.io/)** v0.26 or higher
- **Node.js** 20+ (for compatibility tools)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/HMAHD/Luvora.git
   cd Luvora
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start PocketBase** (in a separate terminal)
   ```bash
   # Download PocketBase: https://pocketbase.io/docs/
   ./pocketbase serve
   # Access admin at http://127.0.0.1:8090/_/
   ```

5. **Run the development server**
   ```bash
   bun dev
   ```

6. **Run tests**
   ```bash
   # Unit tests
   bun test

   # E2E tests
   bun test:e2e
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 📚 Documentation

### Setup & Configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete VPS setup, Nginx config, PM2, SSL certificates
- **[Environment Variables](.env.example)** - All configuration options explained
- **[PocketBase Schema](pb_schema.json)** - Database schema and collections

### Integrations & Services
- **[Sentry Setup](docs/SENTRY_SETUP.md)** - Error tracking and performance monitoring
- **[Metrics Documentation](docs/METRICS.md)** - Custom metrics, tracking, and Sentry queries
- **[WhatsApp Integration](docs/WHATSAPP_SETUP.md)** - Whapi.cloud configuration
- **[Telegram Webhook Setup](scripts/setup-telegram-webhook.sh)** - Automated script

### Development
- **[Testing Guide](tests/README.md)** - Unit and integration test examples
- **[Roadmap](docs/ROADMAP.md)** - Feature planning and implementation phases

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🔧 Configuration

### Required Environment Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://luvora.love
NEXT_PUBLIC_POCKETBASE_URL=https://api.luvora.love

# Database (PocketBase)
POCKETBASE_ADMIN_EMAIL=your-admin@example.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password

# Payments (LemonSqueezy)
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: Messaging
TELEGRAM_BOT_TOKEN=your-bot-token
WHAPI_API_TOKEN=your-whapi-token
```

**📖 See [.env.example](.env.example) for complete configuration**

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🚀 Deployment

### Quick Deploy

The project includes automated CI/CD workflows:

- **Staging**: Pushes to `develop` branch deploy to staging environment
- **Production**: Pushes to `main` branch deploy to production

### Manual Deployment

See the comprehensive [DEPLOYMENT.md](docs/DEPLOYMENT.md) guide for:
- VPS setup and configuration
- Nginx reverse proxy setup (ports 3002 & 3003)
- PM2 process management
- SSL certificate configuration
- GitHub Actions secrets setup
- Monitoring and troubleshooting

### Deployment Architecture

```
GitHub Actions
      ↓
  Git Push (develop/main)
      ↓
  Run Tests (CI)
      ↓
  SSH to VPS
      ↓
  Pull Latest Code
      ↓
  Build with Bun
      ↓
  Reload PM2 (Zero Downtime)
      ↓
  Health Check
      ↓
  Notify Sentry
```

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🧪 Testing

```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun test --watch

# Run E2E tests
bun test:e2e

# Run linter
bun run lint

# Type check
bun run tsc --noEmit
```

**Test Coverage:**
- Unit tests for core logic (algorithms, metrics, utilities)
- API route tests (health checks, webhooks)
- Integration tests (Sentry, database)

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 📊 Monitoring & Observability

### Sentry Integration

Track application health and user engagement:

- **Performance Monitoring**: API response times, database queries
- **Error Tracking**: Automatic error capture with context
- **Custom Metrics**: User engagement, conversions, automation success
- **Release Tracking**: Deployments linked to commits

**View metrics in Sentry:**
```sql
-- Daily active users by tier
sum(d:custom/user.active@none) by (tier)

-- Conversion rate
sum(d:custom/upgrade.completed@none) / sum(d:custom/spark.copied@none) * 100

-- Automation success rate
sum(d:custom/automation.sent@none{success:true}) / sum(d:custom/automation.sent@none) * 100
```

See [docs/METRICS.md](docs/METRICS.md) for complete metrics documentation.

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🗺 Roadmap Status

| Phase | Goal | Status |
| :--- | :--- | :--- |
| **Phase 0** | **Project Genesis** (Infrastructure) | ✅ Complete |
| **Phase 1** | **Core Logic** (The Engine) | ✅ Complete |
| **Phase 2** | **Frontend "Pro-Max"** (The Interface) | ✅ Complete |
| **Phase 3** | **Sovereign Backend** (PocketBase) | ✅ Complete |
| **Phase 4** | **Premium & Payments** (LemonSqueezy) | ✅ Complete |
| **Phase 5** | **Automation** (Telegram/WhatsApp) | ✅ Complete |
| **Phase 6** | **Admin Panel** (Analytics Dashboard) | ✅ Complete |
| **Phase 7** | **Deployment** (VPS, CI/CD) | ✅ Complete |
| **Phase 8** | **Legend Tier Enhancements** | 🚧 In Progress |

**[📖 View Full Roadmap](docs/ROADMAP.md)**

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
5. Push to your branch and open a Pull Request

**Development Guidelines:**
- Run tests before committing (`bun test`)
- Follow TypeScript best practices
- Update documentation for new features
- Keep commits atomic and well-described

![Gradient Line](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.png)

## 📝 License

This project is proprietary and confidential.

**© 2025-2026 HMAHD. All rights reserved.**

---

## 🔗 Links

- **Production**: [luvora.love](https://luvora.love)
- **Staging**: [staging.luvora.love](https://staging.luvora.love)
- **Sentry**: [akash-hasendra.sentry.io](https://akash-hasendra.sentry.io/)
- **Documentation**: [docs/](docs/)

---

<div align="center">
  <sub>Built with ❤️ by HMAHD</sub><br>
  <sub>Powered by Next.js, Bun, PocketBase, and Sentry</sub>
</div>
