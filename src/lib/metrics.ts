import * as Sentry from '@sentry/nextjs';

/**
 * Centralized metrics tracking utility using Sentry Metrics
 *
 * Usage:
 * - metrics.increment('spark.copied') - Count events
 * - metrics.gauge('active.users', 142) - Set current value
 * - metrics.distribution('spark.load_time', 350) - Track distributions
 * - metrics.set('unique.users', userId) - Count unique values
 */

export const metrics = {
    /**
     * Increment a counter metric
     * @param name Metric name (use dot notation: 'category.action')
     * @param value Amount to increment by (default: 1)
     * @param tags Optional tags for filtering (e.g., { tier: 'hero', platform: 'web' })
     */
    increment: (name: string, value = 1, tags?: Record<string, string>) => {
        try {
            Sentry.metrics.increment(name, value, { tags });
        } catch (error) {
            // Silently fail in development or if Sentry not initialized
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Metrics] ${name}: +${value}`, tags);
            }
        }
    },

    /**
     * Set a gauge metric (current state/value)
     * @param name Metric name
     * @param value Current value
     * @param tags Optional tags
     */
    gauge: (name: string, value: number, tags?: Record<string, string>) => {
        try {
            Sentry.metrics.gauge(name, value, { tags });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Metrics] ${name}: ${value}`, tags);
            }
        }
    },

    /**
     * Track a distribution metric (timing, sizes, etc.)
     * @param name Metric name
     * @param value Value to record
     * @param tags Optional tags
     * @param unit Optional unit (e.g., 'millisecond', 'byte')
     */
    distribution: (
        name: string,
        value: number,
        tags?: Record<string, string>,
        unit?: string
    ) => {
        try {
            Sentry.metrics.distribution(name, value, { tags, unit });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Metrics] ${name}: ${value}${unit ? unit : ''}`, tags);
            }
        }
    },

    /**
     * Track unique values (like unique users)
     * @param name Metric name
     * @param value Unique identifier (string or number)
     * @param tags Optional tags
     */
    set: (name: string, value: string | number, tags?: Record<string, string>) => {
        try {
            Sentry.metrics.set(name, value, { tags });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Metrics] ${name}: ${value}`, tags);
            }
        }
    },
};

/**
 * Pre-defined metric tracking functions for common events
 */
export const trackEvent = {
    /** Track when a user copies a spark */
    sparkCopied: (tier: 'free' | 'hero' | 'legend', sparkType?: string) => {
        metrics.increment('spark.copied', 1, { tier, spark_type: sparkType || 'daily' });
    },

    /** Track when a user shares a streak card */
    streakShared: (tier: 'free' | 'hero' | 'legend', platform?: string) => {
        metrics.increment('streak.shared', 1, { tier, platform: platform || 'unknown' });
    },

    /** Track upgrade button clicks */
    upgradeStarted: (fromTier: string, toTier: string) => {
        metrics.increment('upgrade.started', 1, { from_tier: fromTier, to_tier: toTier });
    },

    /** Track successful upgrades */
    upgradeCompleted: (tier: 'hero' | 'legend', source: string) => {
        metrics.increment('upgrade.completed', 1, { tier, source });
    },

    /** Track automation enablement */
    automationEnabled: (platform: 'telegram' | 'whatsapp', tier: string) => {
        metrics.increment('automation.enabled', 1, { platform, tier });
    },

    /** Track automation message sends */
    automationSent: (platform: 'telegram' | 'whatsapp', success: boolean) => {
        metrics.increment('automation.sent', 1, {
            platform,
            status: success ? 'success' : 'failed',
        });
    },

    /** Track payment events */
    paymentReceived: (amount: number, tier: 'hero' | 'legend', currency = 'USD') => {
        metrics.distribution('payment.amount', amount, { tier, currency }, 'none');
        metrics.increment('payment.received', 1, { tier, currency });
    },

    /** Track payment failures */
    paymentFailed: (tier: string, reason?: string) => {
        metrics.increment('payment.failed', 1, { tier, reason: reason || 'unknown' });
    },

    /** Track user login */
    userLogin: (method: 'email' | 'otp', tier: string) => {
        metrics.increment('user.login', 1, { method, tier });
    },

    /** Track user signup */
    userSignup: (method: 'email' | 'otp') => {
        metrics.increment('user.signup', 1, { method });
    },

    /** Track daily active users (call once per user per day) */
    dailyActiveUser: (userId: string, tier: string) => {
        metrics.set('user.daily_active', userId, { tier });
    },

    /** Track page views for SEO pages */
    seoPageView: (category: string, source?: string) => {
        metrics.increment('seo.page_view', 1, { category, source: source || 'organic' });
    },

    /** Track API errors */
    apiError: (endpoint: string, errorType: string, statusCode?: number) => {
        metrics.increment('api.error', 1, {
            endpoint,
            error_type: errorType,
            status_code: statusCode?.toString() || 'unknown',
        });
    },

    /** Track feature usage */
    featureUsed: (feature: string, tier: string) => {
        metrics.increment('feature.used', 1, { feature, tier });
    },

    /** Track performance metrics */
    performance: (metric: 'lcp' | 'fid' | 'cls', value: number) => {
        metrics.distribution(`performance.${metric}`, value, {}, 'millisecond');
    },
};

/**
 * Server-side metrics helper (for API routes and server actions)
 */
export const serverMetrics = {
    /** Track batch send performance */
    batchSendDuration: (duration: number, batchSize: number, success: boolean) => {
        metrics.distribution('batch.send_duration', duration, {
            batch_size: batchSize.toString(),
            status: success ? 'success' : 'failed',
        }, 'millisecond');
    },

    /** Track database query performance */
    dbQueryDuration: (query: string, duration: number) => {
        metrics.distribution('db.query_duration', duration, { query }, 'millisecond');
    },

    /** Track webhook processing */
    webhookProcessed: (source: string, success: boolean, duration?: number) => {
        metrics.increment('webhook.processed', 1, {
            source,
            status: success ? 'success' : 'failed',
        });
        if (duration) {
            metrics.distribution('webhook.duration', duration, { source }, 'millisecond');
        }
    },
};
