/**
 * MessagingService Initialization
 *
 * Initializes the MessagingService when the server starts.
 * Import this file in your Next.js root layout or instrumentation file.
 *
 * Usage in instrumentation.ts:
 * ```ts
 * export async function register() {
 *   if (process.env.NEXT_RUNTIME === 'nodejs') {
 *     await import('./lib/messaging/init');
 *   }
 * }
 * ```
 */

import { messagingService } from './messaging-service';

let initialized = false;

async function initializeMessaging() {
    if (initialized) {
        console.log('[Messaging Init] Already initialized');
        return;
    }

    console.log('[Messaging Init] Starting initialization...');

    try {
        await messagingService.initialize();
        initialized = true;
        console.log('[Messaging Init] ✅ Initialization complete');

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('[Messaging Init] SIGINT received, shutting down...');
            await messagingService.shutdown();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('[Messaging Init] SIGTERM received, shutting down...');
            await messagingService.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error('[Messaging Init] ❌ Initialization failed:', error);
        // Don't crash the server if messaging fails to initialize
        // The service will still work for new setups
    }
}

// Auto-initialize when this module is imported
if (process.env.NODE_ENV !== 'test') {
    initializeMessaging();
}

export { initializeMessaging };
