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

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0,

    // Integrations for error tracking, performance monitoring, and session replay
    integrations: [
        Sentry.browserTracingIntegration(), // Distributed tracing for performance monitoring
        Sentry.replayIntegration({
            // Session replay configuration
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    // Define tracePropagationTargets to avoid CORS issues and enable distributed tracing
    // This connects frontend traces to backend traces
    tracePropagationTargets: [
        'localhost',
        /^https:\/\/luvora\.love/,
        /^https:\/\/api\.luvora\.love/,
        /^https:\/\/staging\.luvora\.love/,
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
        // Don't send health check errors
        if (event.request?.url?.includes('/api/health')) {
            return null;
        }

        // Remove sensitive headers
        if (event.request?.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers.Cookie;
        }

        return event;
    },

    // Ignore certain errors
    ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Network errors that we can't control
        'NetworkError',
        'Network request failed',
        'Failed to fetch',
        // Resizable observer errors (harmless)
        'ResizeObserver loop limit exceeded',
    ],
});
