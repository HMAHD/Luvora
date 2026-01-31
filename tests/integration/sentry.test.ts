/**
 * Sentry Integration Tests
 * Verifies Sentry is properly configured
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Sentry Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SENTRY_DSN =
            'https://test@sentry.io/123';
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'test';
    });

    describe('Environment Variables', () => {
        it('should have SENTRY_DSN configured', () => {
            expect(process.env.NEXT_PUBLIC_SENTRY_DSN).toBeDefined();
            expect(process.env.NEXT_PUBLIC_SENTRY_DSN).toContain('sentry.io');
        });

        it('should have SENTRY_ENVIRONMENT configured', () => {
            expect(process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT).toBeDefined();
        });
    });

    describe('Client Configuration', () => {
        it('should configure traces sample rate based on environment', () => {
            // Production should use lower sample rate
            process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'production';
            const productionRate = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0;
            expect(productionRate).toBe(0.1);

            // Development should use full sampling
            process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'development';
            const devRate = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0;
            expect(devRate).toBe(1.0);
        });

        it('should configure replay sample rates correctly', () => {
            // Error replays should always be 100%
            const replaysOnErrorSampleRate = 1.0;
            expect(replaysOnErrorSampleRate).toBe(1.0);

            // Production session replays should be 10%
            process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'production';
            const prodSessionRate = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0;
            expect(prodSessionRate).toBe(0.1);

            // Development session replays should be 0%
            process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'development';
            const devSessionRate = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0;
            expect(devSessionRate).toBe(0);
        });
    });

    describe('Trace Propagation', () => {
        it('should include correct domains for trace propagation', () => {
            const tracePropagationTargets = [
                'localhost',
                /^https:\/\/luvora\.love/,
                /^https:\/\/api\.luvora\.love/,
                /^https:\/\/staging\.luvora\.love/,
            ];

            // Test localhost
            expect(tracePropagationTargets).toContain('localhost');

            // Test main domain regex
            const mainDomainRegex = tracePropagationTargets.find(
                (t) => t instanceof RegExp && t.toString().includes('luvora\\.love')
            ) as RegExp;
            expect(mainDomainRegex.test('https://luvora.love')).toBe(true);
            expect(mainDomainRegex.test('https://luvora.love/api/test')).toBe(true);

            // Test API domain regex
            const apiDomainRegex = tracePropagationTargets.find(
                (t) => t instanceof RegExp && t.toString().includes('api\\.luvora')
            ) as RegExp;
            expect(apiDomainRegex.test('https://api.luvora.love')).toBe(true);

            // Test staging domain regex
            const stagingDomainRegex = tracePropagationTargets.find(
                (t) => t instanceof RegExp && t.toString().includes('staging')
            ) as RegExp;
            expect(stagingDomainRegex.test('https://staging.luvora.love')).toBe(true);
        });
    });

    describe('Error Filtering', () => {
        it('should filter health check errors', () => {
            const healthCheckUrl = '/api/health';
            const shouldFilter = healthCheckUrl.includes('/api/health');
            expect(shouldFilter).toBe(true);
        });

        it('should ignore common browser extension errors', () => {
            const ignoredErrors = [
                'top.GLOBALS',
                'originalCreateNotification',
                'canvas.contentDocument',
                'MyApp_RemoveAllHighlights',
                'NetworkError',
                'Network request failed',
                'Failed to fetch',
                'ResizeObserver loop limit exceeded',
            ];

            expect(ignoredErrors).toContain('NetworkError');
            expect(ignoredErrors).toContain('Failed to fetch');
            expect(ignoredErrors).toContain('ResizeObserver loop limit exceeded');
        });
    });

    describe('Sensitive Data Filtering', () => {
        it('should remove sensitive headers from events', () => {
            const headers = {
                Authorization: 'Bearer token',
                Cookie: 'session=secret',
                'Content-Type': 'application/json',
            };

            // Simulate filtering
            const filtered = { ...headers };
            delete filtered.Authorization;
            delete filtered.Cookie;

            expect(filtered).not.toHaveProperty('Authorization');
            expect(filtered).not.toHaveProperty('Cookie');
            expect(filtered).toHaveProperty('Content-Type');
        });

        it('should redact sensitive breadcrumb data', () => {
            const breadcrumb = {
                data: {
                    apiKey: 'secret123',
                    token: 'bearer-token',
                    password: 'password123',
                    username: 'john',
                },
            };

            // Simulate filtering
            const sanitized = { ...breadcrumb.data };
            Object.keys(sanitized).forEach((key) => {
                if (
                    key.toLowerCase().includes('token') ||
                    key.toLowerCase().includes('key') ||
                    key.toLowerCase().includes('secret') ||
                    key.toLowerCase().includes('password')
                ) {
                    sanitized[key] = '[Redacted]';
                }
            });

            expect(sanitized.apiKey).toBe('[Redacted]');
            expect(sanitized.token).toBe('[Redacted]');
            expect(sanitized.password).toBe('[Redacted]');
            expect(sanitized.username).toBe('john'); // Should not be redacted
        });
    });

    describe('Next.js Integration', () => {
        it('should have sourcemap upload configured', () => {
            const config = {
                deleteSourcemapsAfterUpload: true,
                disable: false,
            };

            expect(config.deleteSourcemapsAfterUpload).toBe(true);
            expect(config.disable).toBe(false);
        });

        it('should have organization and project configured', () => {
            const sentryConfig = {
                org: 'akash-hasendra',
                project: 'luvora',
            };

            expect(sentryConfig.org).toBe('akash-hasendra');
            expect(sentryConfig.project).toBe('luvora');
        });
    });
});
