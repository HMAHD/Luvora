# Sentry Metrics Implementation

This document describes the custom metrics tracking implementation using Sentry Metrics for monitoring key business and technical metrics.

## Overview

Luvora uses **Sentry Metrics** to track:
- User engagement and activity
- Conversion funnel events
- Payment transactions
- Automation performance
- API health and errors
- Performance metrics

## Metrics Utility

Location: `src/lib/metrics.ts`

### Core Functions

#### `metrics.increment(name, value, tags)`
Increment a counter metric.

```typescript
import { metrics } from '@/lib/metrics';

metrics.increment('spark.copied', 1, { tier: 'hero', spark_type: 'morning' });
```

#### `metrics.gauge(name, value, tags)`
Set a gauge metric (current state/value).

```typescript
metrics.gauge('active.users', 142, { tier: 'legend' });
```

#### `metrics.distribution(name, value, tags, unit)`
Track a distribution metric (timing, sizes, etc.).

```typescript
metrics.distribution('api.latency', 250, { endpoint: '/api/health' }, 'millisecond');
```

#### `metrics.set(name, value, tags)`
Track unique values (like unique users).

```typescript
metrics.set('unique.users', userId, { tier: 'free' });
```

---

## Pre-defined Event Tracking

### User Engagement

**Spark Copied**
```typescript
trackEvent.sparkCopied('hero', 'morning');
// Tracks: spark.copied with tags { tier, spark_type }
```

**Streak Shared**
```typescript
trackEvent.streakShared('legend', 'instagram');
// Tracks: streak.shared with tags { tier, platform }
```

**Daily Active User**
```typescript
trackEvent.dailyActiveUser(userId, 'hero');
// Tracks: user.daily_active (set) with unique user ID
```

### Conversion Tracking

**Upgrade Started**
```typescript
trackEvent.upgradeStarted('free', 'hero');
// Tracks: upgrade.started with tags { from_tier, to_tier }
```

**Upgrade Completed**
```typescript
trackEvent.upgradeCompleted('legend', 'lemonsqueezy');
// Tracks: upgrade.completed with tags { tier, source }
```

### Payment Tracking

**Payment Received**
```typescript
trackEvent.paymentReceived(19.99, 'legend', 'USD');
// Tracks:
// - payment.amount (distribution) with value and tags { tier, currency }
// - payment.received (counter) with tags { tier, currency }
```

**Payment Failed**
```typescript
trackEvent.paymentFailed('hero', 'card_declined');
// Tracks: payment.failed with tags { tier, reason }
```

### Automation Tracking

**Automation Enabled**
```typescript
trackEvent.automationEnabled('telegram', 'hero');
// Tracks: automation.enabled with tags { platform, tier }
```

**Automation Sent**
```typescript
trackEvent.automationSent('whatsapp', true);
// Tracks: automation.sent with tags { platform, status: 'success' | 'failed' }
```

### User Authentication

**User Login**
```typescript
trackEvent.userLogin('email', 'free');
// Tracks: user.login with tags { method, tier }
```

**User Signup**
```typescript
trackEvent.userSignup('otp');
// Tracks: user.signup with tags { method }
```

### SEO & Content

**SEO Page View**
```typescript
trackEvent.seoPageView('morning-messages', 'google');
// Tracks: seo.page_view with tags { category, source }
```

### Feature Usage

**Feature Used**
```typescript
trackEvent.featureUsed('love_language', 'legend');
// Tracks: feature.used with tags { feature, tier }
```

### Error Tracking

**API Error**
```typescript
trackEvent.apiError('/api/test', 'timeout', 504);
// Tracks: api.error with tags { endpoint, error_type, status_code }
```

### Performance Tracking

**Core Web Vitals**
```typescript
trackEvent.performance('lcp', 1250);
// Tracks: performance.lcp (distribution) with value in milliseconds
// Supported: 'lcp', 'fid', 'cls'
```

---

## Server-Side Metrics

### Batch Processing

**Batch Send Duration**
```typescript
serverMetrics.batchSendDuration(5000, 25, true);
// Tracks: batch.send_duration (distribution) with tags { batch_size, status }
```

### Database Performance

**Database Query Duration**
```typescript
serverMetrics.dbQueryDuration('SELECT * FROM users', 150);
// Tracks: db.query_duration (distribution) with tags { query }
```

### Webhook Processing

**Webhook Processed**
```typescript
serverMetrics.webhookProcessed('lemonsqueezy', true, 250);
// Tracks:
// - webhook.processed (counter) with tags { source, status }
// - webhook.duration (distribution) if duration provided
```

---

## Integration Examples

### Spark Card Component

Location: `src/components/SparkCard.tsx`

```typescript
import { trackEvent } from '@/lib/metrics';

const handleCopy = async () => {
  // ... copy logic ...

  // Track metrics
  trackEvent.sparkCopied(
    isLegend ? 'legend' : isHeroPlus ? 'hero' : 'free',
    isNight ? 'night' : 'morning'
  );

  if (user?.id) {
    trackEvent.dailyActiveUser(user.id, tierName);
  }
};
```

### Payment Webhook

Location: `src/app/api/webhooks/payments/route.ts`

```typescript
import { trackEvent, serverMetrics } from '@/lib/metrics';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // ... payment processing ...

    // Track successful payment
    trackEvent.upgradeCompleted('hero', 'lemonsqueezy');
    trackEvent.paymentReceived(orderTotal / 100, 'hero', 'USD');

    serverMetrics.webhookProcessed('lemonsqueezy', true, Date.now() - startTime);

  } catch (error) {
    // Track failed payment
    trackEvent.paymentFailed('unknown', 'processing_error');
    serverMetrics.webhookProcessed('lemonsqueezy', false, Date.now() - startTime);
  }
}
```

### Automation Delivery

Location: `src/app/api/cron/deliver/route.ts`

```typescript
import { trackEvent, serverMetrics } from '@/lib/metrics';

async function sendToUser(user: UserRecord) {
  const platform = user.messaging_platform || 'telegram';
  const success = await sendMessage({ ... });

  // Track send result
  trackEvent.automationSent(platform, success);

  return success;
}

// Track batch performance
serverMetrics.batchSendDuration(duration, batchSize, success);
```

---

## Viewing Metrics in Sentry

1. Log in to [sentry.io](https://sentry.io)
2. Navigate to **Metrics** in the left sidebar
3. Query metrics using MQL (Metrics Query Language)

### Example Queries

**Total Sparks Copied (Last 24h)**
```
sum(spark.copied){tier:*}
```

**Conversion Rate (Free → Hero)**
```
sum(upgrade.completed){to_tier:hero} / sum(upgrade.started){to_tier:hero} * 100
```

**Payment Revenue by Tier**
```
sum(payment.amount){tier:*} by tier
```

**Automation Success Rate**
```
sum(automation.sent){status:success} / sum(automation.sent){status:*} * 100
```

**Daily Active Users by Tier**
```
count_unique(user.daily_active){tier:*} by tier
```

---

## Dashboards

Recommended Sentry Dashboards:

### 1. Engagement Dashboard
- **Sparks Copied**: `sum(spark.copied){tier:*} by tier`
- **Streak Shares**: `sum(streak.shared){tier:*} by platform`
- **Daily Active Users**: `count_unique(user.daily_active){tier:*}`
- **Feature Usage**: `sum(feature.used){feature:*} by feature`

### 2. Conversion Dashboard
- **Upgrades Started**: `sum(upgrade.started){to_tier:*} by to_tier`
- **Upgrades Completed**: `sum(upgrade.completed){tier:*} by tier`
- **Conversion Rate**: Calculated metric
- **Payment Success Rate**: `sum(payment.received) / (sum(payment.received) + sum(payment.failed))`

### 3. Revenue Dashboard
- **Total Revenue**: `sum(payment.amount){tier:*}`
- **Revenue by Tier**: `sum(payment.amount){tier:*} by tier`
- **Revenue by Currency**: `sum(payment.amount){currency:*} by currency`
- **Failed Payments**: `sum(payment.failed){tier:*} by reason`

### 4. Operations Dashboard
- **Automation Send Rate**: `sum(automation.sent){status:success} / sum(automation.sent){status:*}`
- **Webhook Processing**: `sum(webhook.processed){source:*} by source`
- **API Errors**: `sum(api.error){endpoint:*} by endpoint`
- **Batch Send Duration**: `avg(batch.send_duration){status:*}`

### 5. Performance Dashboard
- **LCP**: `p75(performance.lcp)`
- **FID**: `p75(performance.fid)`
- **CLS**: `p75(performance.cls)`
- **API Latency**: `p95(api.latency){endpoint:*}`

---

## Alerts

Recommended Sentry Alerts:

### Critical Alerts

**High Payment Failure Rate**
- Metric: `sum(payment.failed) / sum(payment.received) > 0.1`
- Threshold: > 10%
- Action: Notify #engineering and #finance

**Automation Send Failures**
- Metric: `sum(automation.sent){status:failed}`
- Threshold: > 50 failures in 1 hour
- Action: Notify #engineering

**API Error Spike**
- Metric: `sum(api.error)`
- Threshold: > 100 errors in 15 minutes
- Action: Notify #engineering

### Warning Alerts

**Conversion Drop**
- Metric: `sum(upgrade.completed) < 5 in 24 hours`
- Action: Notify #marketing

**Low Engagement**
- Metric: `count_unique(user.daily_active) < 100`
- Action: Notify #product

---

## Testing

Tests location: `tests/lib/metrics.test.ts`

Run tests:
```bash
bun test tests/lib/metrics.test.ts
```

The test suite covers:
- ✅ Core metrics functions (increment, gauge, distribution, set)
- ✅ Pre-defined event tracking helpers
- ✅ Server-side metrics
- ✅ Error handling (graceful degradation)
- ✅ Development mode logging

---

## Best Practices

1. **Use Pre-defined Helpers**: Prefer `trackEvent.*` over raw `metrics.*` calls for consistency
2. **Tag Appropriately**: Always include relevant tags (tier, platform, etc.)
3. **Avoid PII**: Never include user emails, names, or sensitive data in metrics
4. **Keep Names Consistent**: Use dot notation (e.g., `category.action`)
5. **Track Both Counts and Distributions**: Track `payment.received` (count) AND `payment.amount` (distribution)
6. **Monitor What Matters**: Focus on actionable metrics, not vanity metrics

---

## Troubleshooting

### Metrics Not Appearing in Sentry

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set in `.env.local`
2. Verify Sentry is initialized (check browser console for errors)
3. Ensure you're on a paid Sentry plan (metrics require Performance tier)
4. Check that events are being triggered (add `console.log` in development)

### Metrics Showing Wrong Values

1. Verify tag values are correct (case-sensitive)
2. Check timestamp/timezone settings
3. Ensure metrics are being called in the right place (client vs server)

### Development Mode Logging

In development, metrics are logged to console instead of Sentry:
```
[Metrics] spark.copied: +1 { tier: 'hero', spark_type: 'morning' }
```

This helps with debugging without polluting production metrics.

---

## Migration Guide

### From Google Analytics to Sentry Metrics

| GA4 Event | Sentry Metric |
|-----------|--------------|
| `spark_copied` | `trackEvent.sparkCopied()` |
| `upgrade_started` | `trackEvent.upgradeStarted()` |
| `upgrade_completed` | `trackEvent.upgradeCompleted()` |
| `page_view` | `trackEvent.seoPageView()` |

**Benefits of Sentry Metrics:**
- Real-time alerting
- Integrated with error tracking
- Better performance (lightweight, batched)
- No cookie consent required (server-side)
- Better privacy compliance

---

## Next Steps

1. **Create Sentry Dashboards**: Use the recommended queries above
2. **Set Up Alerts**: Configure critical alerts for monitoring
3. **Monitor Trends**: Watch conversion rates and engagement over time
4. **Optimize**: Use metrics to identify bottlenecks and opportunities

For questions or issues, contact the engineering team or check the Sentry documentation.
