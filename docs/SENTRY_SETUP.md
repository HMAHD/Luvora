# Sentry Setup Instructions

Sentry is configured but requires installation before it can be used.

## Step 1: Install Sentry SDK

```bash
npm install @sentry/nextjs
```

## Step 2: Run Sentry Wizard (Recommended)

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Guide you through Sentry setup
- Create necessary configuration files
- Add Sentry to your Next.js config

## Step 3: Manual Setup (If needed)

If you prefer manual setup, rename the example files:

```bash
mv sentry.client.config.ts.example sentry.client.config.ts
mv sentry.server.config.ts.example sentry.server.config.ts
mv sentry.edge.config.ts.example sentry.edge.config.ts
mv instrumentation.ts.example instrumentation.ts
```

## Step 4: Add Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=your_dsn_from_sentry_dashboard
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

For CI/CD, also add:

```bash
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org_name
SENTRY_PROJECT=luvora
```

## Step 5: Enable Instrumentation

Update `next.config.mjs` to enable instrumentation:

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // ... rest of config
};
```

## Step 6: Test

1. Build the application: `npm run build`
2. Trigger a test error to verify Sentry captures it
3. Check Sentry dashboard for the error

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
