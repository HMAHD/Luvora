import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development';

Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Filter out sensitive data
    beforeSend(event, hint) {
        // Don't send health check errors
        if (event.request?.url?.includes('/api/health')) {
            return null;
        }

        // Remove sensitive data from context
        if (event.contexts?.runtime?.name) {
            delete event.contexts.runtime;
        }

        // Remove environment variables from breadcrumbs
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
                if (breadcrumb.data) {
                    // Remove any keys that might contain sensitive data
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
                    return { ...breadcrumb, data: sanitized };
                }
                return breadcrumb;
            });
        }

        return event;
    },

    // Ignore certain errors
    ignoreErrors: [
        // Database connection errors are expected during maintenance
        'Connection terminated',
        'connect ECONNREFUSED',
        // Health check errors
        'Health check failed',
    ],
});
