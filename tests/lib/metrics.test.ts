import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
    metrics: {
        increment: vi.fn(),
        gauge: vi.fn(),
        distribution: vi.fn(),
        set: vi.fn(),
    },
}));

// Must import after mocking
import { metrics, trackEvent, serverMetrics } from '@/lib/metrics';

describe('Metrics Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Metrics Functions', () => {
        it('should increment a counter metric', () => {
            metrics.increment('test.counter', 5, { tier: 'hero' });

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'test.counter',
                5,
                { tags: { tier: 'hero' } }
            );
        });

        it('should set a gauge metric', () => {
            metrics.gauge('active.users', 142, { tier: 'legend' });

            expect(Sentry.metrics.gauge).toHaveBeenCalledWith(
                'active.users',
                142,
                { tags: { tier: 'legend' } }
            );
        });

        it('should track a distribution metric', () => {
            metrics.distribution('api.latency', 250, { endpoint: '/api/health' }, 'millisecond');

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'api.latency',
                250,
                { tags: { endpoint: '/api/health' }, unit: 'millisecond' }
            );
        });

        it('should track unique values with set', () => {
            metrics.set('unique.users', 'user-123', { tier: 'free' });

            expect(Sentry.metrics.set).toHaveBeenCalledWith(
                'unique.users',
                'user-123',
                { tags: { tier: 'free' } }
            );
        });

        it('should default increment value to 1', () => {
            metrics.increment('test.counter');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'test.counter',
                1,
                { tags: undefined }
            );
        });
    });

    describe('Track Event Helpers', () => {
        it('should track spark copied event', () => {
            trackEvent.sparkCopied('hero', 'morning');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'spark.copied',
                1,
                { tags: { tier: 'hero', spark_type: 'morning' } }
            );
        });

        it('should track streak shared event', () => {
            trackEvent.streakShared('legend', 'instagram');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'streak.shared',
                1,
                { tags: { tier: 'legend', platform: 'instagram' } }
            );
        });

        it('should track upgrade started event', () => {
            trackEvent.upgradeStarted('free', 'hero');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'upgrade.started',
                1,
                { tags: { from_tier: 'free', to_tier: 'hero' } }
            );
        });

        it('should track upgrade completed event', () => {
            trackEvent.upgradeCompleted('legend', 'stripe');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'upgrade.completed',
                1,
                { tags: { tier: 'legend', source: 'stripe' } }
            );
        });

        it('should track automation enabled event', () => {
            trackEvent.automationEnabled('telegram', 'hero');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'automation.enabled',
                1,
                { tags: { platform: 'telegram', tier: 'hero' } }
            );
        });

        it('should track automation sent event - success', () => {
            trackEvent.automationSent('whatsapp', true);

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'automation.sent',
                1,
                { tags: { platform: 'whatsapp', status: 'success' } }
            );
        });

        it('should track automation sent event - failed', () => {
            trackEvent.automationSent('telegram', false);

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'automation.sent',
                1,
                { tags: { platform: 'telegram', status: 'failed' } }
            );
        });

        it('should track payment received event', () => {
            trackEvent.paymentReceived(19.99, 'legend', 'USD');

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'payment.amount',
                19.99,
                { tags: { tier: 'legend', currency: 'USD' }, unit: 'none' }
            );

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'payment.received',
                1,
                { tags: { tier: 'legend', currency: 'USD' } }
            );
        });

        it('should track payment failed event', () => {
            trackEvent.paymentFailed('hero', 'card_declined');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'payment.failed',
                1,
                { tags: { tier: 'hero', reason: 'card_declined' } }
            );
        });

        it('should track user login event', () => {
            trackEvent.userLogin('email', 'free');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'user.login',
                1,
                { tags: { method: 'email', tier: 'free' } }
            );
        });

        it('should track user signup event', () => {
            trackEvent.userSignup('otp');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'user.signup',
                1,
                { tags: { method: 'otp' } }
            );
        });

        it('should track daily active user', () => {
            trackEvent.dailyActiveUser('user-123', 'hero');

            expect(Sentry.metrics.set).toHaveBeenCalledWith(
                'user.daily_active',
                'user-123',
                { tags: { tier: 'hero' } }
            );
        });

        it('should track SEO page view', () => {
            trackEvent.seoPageView('morning-messages', 'google');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'seo.page_view',
                1,
                { tags: { category: 'morning-messages', source: 'google' } }
            );
        });

        it('should track API error', () => {
            trackEvent.apiError('/api/test', 'timeout', 504);

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'api.error',
                1,
                { tags: { endpoint: '/api/test', error_type: 'timeout', status_code: '504' } }
            );
        });

        it('should track feature usage', () => {
            trackEvent.featureUsed('love_language', 'legend');

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'feature.used',
                1,
                { tags: { feature: 'love_language', tier: 'legend' } }
            );
        });

        it('should track performance metrics', () => {
            trackEvent.performance('lcp', 1250);

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'performance.lcp',
                1250,
                { tags: {}, unit: 'millisecond' }
            );
        });
    });

    describe('Server Metrics', () => {
        it('should track batch send duration', () => {
            serverMetrics.batchSendDuration(5000, 25, true);

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'batch.send_duration',
                5000,
                {
                    tags: { batch_size: '25', status: 'success' },
                    unit: 'millisecond',
                }
            );
        });

        it('should track database query duration', () => {
            serverMetrics.dbQueryDuration('SELECT * FROM users', 150);

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'db.query_duration',
                150,
                { tags: { query: 'SELECT * FROM users' }, unit: 'millisecond' }
            );
        });

        it('should track webhook processing - success', () => {
            serverMetrics.webhookProcessed('stripe', true, 250);

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'webhook.processed',
                1,
                { tags: { source: 'stripe', status: 'success' } }
            );

            expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
                'webhook.duration',
                250,
                { tags: { source: 'stripe' }, unit: 'millisecond' }
            );
        });

        it('should track webhook processing - failed', () => {
            serverMetrics.webhookProcessed('lemonsqueezy', false);

            expect(Sentry.metrics.increment).toHaveBeenCalledWith(
                'webhook.processed',
                1,
                { tags: { source: 'lemonsqueezy', status: 'failed' } }
            );

            expect(Sentry.metrics.distribution).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle Sentry errors gracefully in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            (Sentry.metrics.increment as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
                throw new Error('Sentry error');
            });

            // Should not throw
            expect(() => {
                metrics.increment('test.counter');
            }).not.toThrow();

            process.env.NODE_ENV = originalEnv;
        });

        it('should log metrics in development mode when Sentry fails', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            (Sentry.metrics.increment as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
                throw new Error('Sentry not initialized');
            });

            metrics.increment('test.counter', 5, { tier: 'hero' });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[Metrics] test.counter: +5',
                { tier: 'hero' }
            );

            consoleSpy.mockRestore();
            process.env.NODE_ENV = originalEnv;
        });
    });
});
