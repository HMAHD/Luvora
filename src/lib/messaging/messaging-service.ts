/**
 * MessagingService - Central Channel Manager
 *
 * Manages all messaging channels (Telegram, WhatsApp) for all users.
 * Singleton service that:
 * - Loads channel configurations from PocketBase
 * - Initializes and starts channels
 * - Routes messages to appropriate channels
 * - Handles channel lifecycle (start/stop/restart)
 * - Logs message delivery to messaging_notifications
 *
 * Usage:
 * ```ts
 * import { messagingService } from '@/lib/messaging/messaging-service';
 *
 * // Initialize all channels on server startup
 * await messagingService.initialize();
 *
 * // Send a message
 * await messagingService.sendMessage(userId, {
 *   platform: 'telegram',
 *   content: 'Hello from Lovera!'
 * });
 * ```
 */

import { pb } from '@/lib/pocketbase';
import { decrypt } from '@/lib/crypto';
import { TelegramChannel } from './channels/telegram-channel';
import { WhatsAppChannel } from './channels/whatsapp-channel';
import { ConnectionManager } from './connection-manager';
// Discord is dynamically imported to avoid loading discord.js on every API route
import type { BaseChannel } from './base-channel';
import type { MessagingPlatform, OutboundMessage, TelegramConfig, WhatsAppConfig, DiscordConfig } from './types';
import path from 'path';
import { TIER } from '@/lib/types';
import { createPlatformRateLimiters, type RateLimiter } from './rate-limiter';
import { MessagingMetrics } from './messaging-metrics';

type ChannelInstance = BaseChannel & {
    isLinked?: () => boolean;
    hasSession?: () => boolean;
};

interface UserChannels {
    telegram?: ChannelInstance;
    whatsapp?: ChannelInstance;
    discord?: ChannelInstance;
}

class MessagingService {
    private channels: Map<string, UserChannels> = new Map();
    private initialized = false;
    private readonly MAX_START_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 5000; // 5 seconds
    private cleanupTimer?: NodeJS.Timeout;
    private rateLimiters: Record<MessagingPlatform, RateLimiter>;
    private metrics: MessagingMetrics;

    constructor() {
        // Initialize rate limiters for each platform
        this.rateLimiters = createPlatformRateLimiters();

        // Initialize metrics tracking
        this.metrics = new MessagingMetrics();
    }

    /**
     * Start periodic cleanup of inactive channels
     * Runs every hour to check for disabled channels and clean up memory
     */
    private startPeriodicCleanup(): void {
        const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

        this.cleanupTimer = setInterval(async () => {
            console.log('[MessagingService] Running periodic cleanup...');

            for (const [userId, userChannels] of this.channels.entries()) {
                try {
                    // Check if user still has enabled channels
                    const activeChannels = await pb.collection('messaging_channels').getFullList({
                        filter: `user="${userId}" && enabled=true`,
                        $autoCancel: false
                    });

                    // Build a set of platforms that should be active
                    const activePlatforms = new Set(
                        activeChannels.map(ch => ch.platform as MessagingPlatform)
                    );

                    // Stop channels that are running but no longer enabled
                    for (const platform of Object.keys(userChannels) as MessagingPlatform[]) {
                        if (!activePlatforms.has(platform)) {
                            console.log(
                                `[MessagingService] Cleanup: Stopping disabled ${platform} channel for user ${userId}`
                            );
                            await this.stopChannel(userId, platform);
                        }
                    }

                } catch (error) {
                    console.error(
                        `[MessagingService] Cleanup error for user ${userId}:`,
                        error
                    );
                }
            }

            console.log('[MessagingService] Periodic cleanup complete');
        }, CLEANUP_INTERVAL_MS);

        console.log('[MessagingService] Periodic cleanup scheduled (every hour)');
    }

    /**
     * Retry helper with exponential backoff
     */
    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        operationName: string,
        maxRetries: number = this.MAX_START_RETRIES
    ): Promise<T> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error(`[MessagingService] ${operationName} failed after ${maxRetries} attempts:`, error);
                    throw error;
                }

                const delay = this.RETRY_DELAY_MS * Math.pow(1.5, attempt - 1); // Exponential backoff
                console.warn(
                    `[MessagingService] ${operationName} attempt ${attempt}/${maxRetries} failed. ` +
                    `Retrying in ${delay}ms...`,
                    error instanceof Error ? error.message : error
                );

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error(`${operationName} failed after ${maxRetries} attempts`);
    }

    /**
     * Initialize all enabled channels from PocketBase
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('[MessagingService] Already initialized');
            return;
        }

        console.log('[MessagingService] Initializing...');

        try {
            // Validate admin credentials
            const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
            const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

            if (!adminEmail || !adminPassword) {
                throw new Error(
                    'Missing required environment variables: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD. ' +
                    'Set these in .env.local to enable messaging service initialization.'
                );
            }

            // Validate encryption key early
            const encryptionKey = process.env.ENCRYPTION_KEY;
            if (!encryptionKey || encryptionKey.length < 64) {
                throw new Error(
                    'Invalid ENCRYPTION_KEY. Must be at least 64 characters (32 bytes in hex). ' +
                    'Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
                );
            }

            // Test encryption/decryption to ensure key is valid
            try {
                const { encrypt, decrypt } = await import('@/lib/crypto');
                const testData = 'encryption_test_' + Date.now();
                const encrypted = encrypt(testData);
                const decrypted = decrypt(encrypted);

                if (decrypted !== testData) {
                    throw new Error('Encryption round-trip test failed: decrypted data does not match original');
                }

                console.log('[MessagingService] Encryption key validated successfully');
            } catch (error) {
                throw new Error(
                    `Encryption validation failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
                    'Check that ENCRYPTION_KEY is correctly set in .env.local'
                );
            }

            // Authenticate as admin to fetch all channels
            await pb.admins.authWithPassword(adminEmail, adminPassword);

            // Fetch all enabled channels
            const channels = await pb.collection('messaging_channels').getFullList({
                filter: 'enabled = true',
                $autoCancel: false
            });

            console.log(`[MessagingService] Found ${channels.length} enabled channels`);

            // Initialize all channels in parallel with graceful degradation
            // Use Promise.allSettled to allow partial success - don't let one failing channel break all others
            const startPromises = channels.map(channelRecord =>
                this.startChannel(
                    channelRecord.user,
                    channelRecord.platform as MessagingPlatform,
                    channelRecord.config
                ).then(() => ({
                    userId: channelRecord.user,
                    platform: channelRecord.platform,
                    success: true
                })).catch(error => ({
                    userId: channelRecord.user,
                    platform: channelRecord.platform,
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                }))
            );

            const results = await Promise.all(startPromises);

            // Report results
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            console.log(
                `[MessagingService] Initialization results: ${successful.length}/${channels.length} channels started successfully`
            );

            if (failed.length > 0) {
                console.warn(
                    `[MessagingService] ${failed.length} channels failed to start:`,
                    failed.map(f => `${f.platform}@${f.userId}: ${f.error}`).join(', ')
                );
                // Don't throw - partial success is acceptable for graceful degradation
            }

            this.initialized = true;

            // Start periodic cleanup to prevent memory leaks
            this.startPeriodicCleanup();

            console.log('[MessagingService] Initialization complete');

        } catch (error) {
            console.error('[MessagingService] Initialization failed:', error);
            // Don't throw - allow app to start even if messaging service fails
            // Individual channels can still be configured later via API
            // This implements graceful degradation
            this.initialized = false;
        }
    }

    /**
     * Start a channel for a specific user
     */
    async startChannel(
        userId: string,
        platform: MessagingPlatform,
        config: TelegramConfig | WhatsAppConfig | DiscordConfig
    ): Promise<void> {
        console.log(`[MessagingService] Starting ${platform} channel for user ${userId}`);

        // Get ConnectionManager instance (used throughout this method)
        const connectionManager = ConnectionManager.getInstance();

        // Check connection limits before starting
        if (!connectionManager.canCreateConnection(userId, platform)) {
            const error = `Maximum ${platform} connections reached. Please try again later.`;
            console.error(`[MessagingService] ${error}`);
            throw new Error(error);
        }

        // Enforce single-channel restriction for Elite and Legend users
        try {
            const userRecord = await pb.collection('users').getOne(userId, { $autoCancel: false });
            const userTier = userRecord.tier as number;

            // Elite (tier 1) and Legend (tier 2) users can only have ONE active channel
            if (userTier >= TIER.HERO) {
                const userChannels = this.channels.get(userId);
                const existingPlatforms = userChannels
                    ? (Object.keys(userChannels) as MessagingPlatform[]).filter(
                        p => userChannels[p as keyof UserChannels]
                    )
                    : [];

                // If user already has a different platform connected, prevent adding a new one
                if (existingPlatforms.length > 0 && !existingPlatforms.includes(platform)) {
                    const connectedPlatform = existingPlatforms[0];
                    const error = `You can only connect one messaging channel at a time. Please disconnect ${connectedPlatform} first before connecting ${platform}.`;
                    console.error(`[MessagingService] ${error}`);
                    throw new Error(error);
                }
            }
        } catch (error) {
            // If it's our single-channel error, re-throw it
            if (error instanceof Error && error.message.includes('only connect one messaging channel')) {
                throw error;
            }
            // Otherwise, log but don't block (user might not exist, etc.)
            console.warn(`[MessagingService] Could not check user tier for ${userId}:`, error);
        }

        // Get or create user channels map
        if (!this.channels.has(userId)) {
            this.channels.set(userId, {});
        }
        const userChannels = this.channels.get(userId)!;

        // Stop existing channel if running
        const existingChannel = userChannels[platform as keyof UserChannels];
        if (existingChannel) {
            await existingChannel.stop();
            connectionManager.unregisterConnection(userId, platform);
        }

        // Create and start new channel
        let channel: ChannelInstance;

        if (platform === 'telegram') {
            const telegramConfig = config as TelegramConfig;

            // Decrypt bot token
            let botToken: string;
            try {
                botToken = decrypt(telegramConfig.botToken);
            } catch (error) {
                console.error(`[MessagingService] Failed to decrypt bot token for user ${userId}:`, error);
                throw new Error('Failed to decrypt bot token. Check ENCRYPTION_KEY configuration.');
            }

            channel = new TelegramChannel(
                {
                    enabled: telegramConfig.enabled,
                    botToken,
                    botUsername: telegramConfig.botUsername,
                    telegramUserId: telegramConfig.telegramUserId
                },
                userId,
                {
                    onUserIdReceived: async (telegramUserId: string) => {
                        console.log(`[MessagingService] Telegram linked: ${telegramUserId}`);

                        // Update config in PocketBase
                        try {
                            const channels = await pb.collection('messaging_channels').getFullList({
                                filter: `user="${userId}" && platform="telegram"`,
                                $autoCancel: false
                            });

                            if (channels.length > 0) {
                                await pb.collection('messaging_channels').update(
                                    channels[0].id,
                                    {
                                        config: {
                                            ...telegramConfig,
                                            telegramUserId
                                        }
                                    },
                                    { $autoCancel: false }
                                );
                            }
                        } catch (error) {
                            console.error('[MessagingService] Failed to update Telegram config:', error);
                        }
                    }
                }
            );

        } else if (platform === 'whatsapp') {
            const whatsappConfig = config as WhatsAppConfig;

            channel = new WhatsAppChannel(
                {
                    enabled: whatsappConfig.enabled,
                    sessionPath: whatsappConfig.sessionPath,
                    phoneNumber: whatsappConfig.phoneNumber
                },
                userId,
                {
                    onReady: async (phoneNumber: string) => {
                        console.log(`[MessagingService] WhatsApp ready: ${phoneNumber}`);

                        // Update config in PocketBase
                        try {
                            const channels = await pb.collection('messaging_channels').getFullList({
                                filter: `user="${userId}" && platform="whatsapp"`,
                                $autoCancel: false
                            });

                            if (channels.length > 0) {
                                await pb.collection('messaging_channels').update(
                                    channels[0].id,
                                    {
                                        config: {
                                            ...whatsappConfig,
                                            phoneNumber
                                        }
                                    },
                                    { $autoCancel: false }
                                );
                            }
                        } catch (error) {
                            console.error('[MessagingService] Failed to update WhatsApp config:', error);
                        }
                    }
                }
            );

        } else if (platform === 'discord') {
            const discordConfig = config as DiscordConfig;

            // Decrypt bot token
            let botToken: string;
            try {
                botToken = decrypt(discordConfig.botToken);
            } catch (error) {
                console.error(`[MessagingService] Failed to decrypt Discord token for user ${userId}:`, error);
                throw new Error('Failed to decrypt bot token. Check ENCRYPTION_KEY configuration.');
            }

            // Dynamically import Discord to avoid loading discord.js on every API route
            const { DiscordChannel } = await import('./channels/discord-channel');

            channel = new DiscordChannel(
                {
                    enabled: discordConfig.enabled,
                    botToken,
                    botUsername: discordConfig.botUsername,
                    discordUserId: discordConfig.discordUserId
                },
                userId,
                {
                    onUserIdReceived: async (discordUserId: string, username: string) => {
                        console.log(`[MessagingService] Discord linked: ${discordUserId} (@${username})`);

                        // Update config in PocketBase
                        try {
                            const channels = await pb.collection('messaging_channels').getFullList({
                                filter: `user="${userId}" && platform="discord"`,
                                $autoCancel: false
                            });

                            if (channels.length > 0) {
                                await pb.collection('messaging_channels').update(
                                    channels[0].id,
                                    {
                                        config: {
                                            ...discordConfig,
                                            discordUserId,
                                            botUsername: username
                                        }
                                    },
                                    { $autoCancel: false }
                                );
                            }
                        } catch (error) {
                            console.error('[MessagingService] Failed to update Discord config:', error);
                        }
                    }
                }
            );

        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Start the channel with retry logic and error handling
        try {
            await this.retryWithBackoff(
                () => channel.start(),
                `Starting ${platform} channel for user ${userId}`
            );

            // Register connection with ConnectionManager
            connectionManager.registerConnection(userId, platform);

            // Store channel instance
            if (platform === 'telegram') {
                userChannels.telegram = channel;
            } else if (platform === 'whatsapp') {
                userChannels.whatsapp = channel;
            } else if (platform === 'discord') {
                userChannels.discord = channel;
            }

            console.log(`[MessagingService] Successfully started ${platform} channel for user ${userId}`);

        } catch (error) {
            // Ensure channel is properly cleaned up on failure
            try {
                await channel.stop();
            } catch (stopError) {
                console.error(`[MessagingService] Error stopping failed channel:`, stopError);
            }

            console.error(`[MessagingService] Failed to start ${platform} channel for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Stop a channel for a specific user
     */
    async stopChannel(userId: string, platform: MessagingPlatform): Promise<void> {
        console.log(`[MessagingService] Stopping ${platform} channel for user ${userId}`);

        const userChannels = this.channels.get(userId);
        const channel = userChannels?.[platform as keyof UserChannels];

        if (!userChannels || !channel) {
            console.log(`[MessagingService] Channel not found`);
            return;
        }

        await channel.stop();

        // Unregister connection from ConnectionManager
        const connectionManager = ConnectionManager.getInstance();
        connectionManager.unregisterConnection(userId, platform);

        // Remove channel from map
        if (platform === 'telegram') {
            delete userChannels.telegram;
        } else if (platform === 'whatsapp') {
            delete userChannels.whatsapp;
        } else if (platform === 'discord') {
            delete userChannels.discord;
        }

        // Clean up empty user channel maps to prevent memory leaks
        if (Object.keys(userChannels).length === 0) {
            this.channels.delete(userId);
            console.log(`[MessagingService] Cleaned up empty channel map for user ${userId}`);
        }

        console.log(`[MessagingService] Successfully stopped ${platform} channel for user ${userId}`);
    }

    /**
     * Send a message through a specific channel
     */
    async sendMessage(
        userId: string,
        message: { platform: MessagingPlatform; content: string }
    ): Promise<void> {
        const userChannels = this.channels.get(userId);
        const platform = message.platform;
        const channel = userChannels?.[platform as keyof UserChannels];

        if (!channel) {
            const error = `${platform} channel not initialized for user ${userId}`;
            console.error(`[MessagingService] ${error}`);

            // Log failed notification
            await this.logNotification(userId, platform, message.content, 'failed', error);

            throw new Error(error);
        }

        try {
            // Build OutboundMessage for the channel
            const outboundMessage: OutboundMessage = {
                userId,
                chatId: userId, // Platform channels will resolve the actual chat ID
                content: message.content
            };

            // Apply rate limiting before sending
            const rateLimiter = this.rateLimiters[platform];
            console.log(
                `[MessagingService] Rate limiter status for ${platform}:`,
                rateLimiter.getStatus()
            );

            // Send message with rate limiting and retry logic
            const startTime = Date.now();

            await rateLimiter.execute(async () => {
                await this.retryWithBackoff(
                    () => channel.send(outboundMessage),
                    `Sending ${platform} message for user ${userId}`,
                    3 // Retry 3 times for message sending
                );
            });

            const latencyMs = Date.now() - startTime;

            // Track successful message
            this.metrics.trackMessageSent(platform, latencyMs);

            // Log success
            await this.logNotification(userId, message.platform, message.content, 'sent');

            console.log(
                `[MessagingService] Message sent via ${message.platform} for user ${userId} ` +
                `(latency: ${latencyMs}ms)`
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorType = error instanceof Error ? error.name : 'UnknownError';

            console.error(`[MessagingService] Failed to send message:`, error);

            // Track failed message
            this.metrics.trackMessageFailed(platform, errorType);

            // Log failure
            await this.logNotification(
                userId,
                message.platform,
                message.content,
                'failed',
                errorMessage
            );

            throw error;
        }
    }

    /**
     * Log a notification to PocketBase
     */
    private async logNotification(
        userId: string,
        platform: MessagingPlatform,
        content: string,
        status: 'sent' | 'failed',
        error?: string
    ): Promise<void> {
        try {
            await pb.collection('messaging_notifications').create(
                {
                    user: userId,
                    platform,
                    type: 'outbound',
                    content,
                    status,
                    error,
                    sent_at: new Date().toISOString()
                },
                { $autoCancel: false }
            );
        } catch (err) {
            console.error('[MessagingService] Failed to log notification:', err);
        }
    }

    /**
     * Check if a channel is running
     */
    isChannelRunning(userId: string, platform: MessagingPlatform): boolean {
        const userChannels = this.channels.get(userId);
        return !!userChannels?.[platform as keyof UserChannels];
    }

    /**
     * Get a channel instance
     */
    getChannel(userId: string, platform: MessagingPlatform): ChannelInstance | null {
        const userChannels = this.channels.get(userId);
        return userChannels?.[platform as keyof UserChannels] || null;
    }

    /**
     * Reload a user's channels from PocketBase
     */
    async reloadUserChannels(userId: string): Promise<void> {
        console.log(`[MessagingService] Reloading channels for user ${userId}`);

        // Stop all existing channels
        const userChannels = this.channels.get(userId);
        if (userChannels) {
            for (const platform of Object.keys(userChannels) as MessagingPlatform[]) {
                await this.stopChannel(userId, platform);
            }
        }

        // Fetch fresh channel configs
        const channels = await pb.collection('messaging_channels').getFullList({
            filter: `user="${userId}" && enabled=true`,
            $autoCancel: false
        });

        // Start each enabled channel
        for (const channelRecord of channels) {
            try {
                await this.startChannel(
                    userId,
                    channelRecord.platform as MessagingPlatform,
                    channelRecord.config
                );
            } catch (error) {
                console.error(
                    `[MessagingService] Failed to start ${channelRecord.platform}:`,
                    error
                );
            }
        }
    }

    /**
     * Get metrics for all messaging platforms
     */
    getMetrics() {
        // Update channel counts in metrics
        for (const [platform] of [['telegram'], ['whatsapp'], ['discord']] as [MessagingPlatform][]) {
            let active = 0;
            let total = 0;

            for (const [, userChannels] of this.channels.entries()) {
                const channel = userChannels[platform as keyof UserChannels];
                if (channel) {
                    total++;
                    if (channel.running) {
                        active++;
                    }
                }
            }

            this.metrics.updateChannelCounts(platform, active, total);
        }

        return this.metrics.getAllMetrics();
    }

    /**
     * Get health status of all messaging channels
     */
    getHealthStatus(): {
        initialized: boolean;
        totalChannels: number;
        totalUsers: number;
        platformBreakdown: {
            telegram: { total: number; healthy: number; unhealthy: number };
            whatsapp: { total: number; healthy: number; unhealthy: number };
            discord: { total: number; healthy: number; unhealthy: number };
        };
        connectionLimits: {
            telegram: { current: number; max: number; available: number };
            whatsapp: { current: number; max: number; available: number };
            discord: { current: number; max: number; available: number };
        };
        issues: string[];
    } {
        const connectionManager = ConnectionManager.getInstance();

        const health = {
            initialized: this.initialized,
            totalChannels: 0,
            totalUsers: this.channels.size,
            platformBreakdown: {
                telegram: { total: 0, healthy: 0, unhealthy: 0 },
                whatsapp: { total: 0, healthy: 0, unhealthy: 0 },
                discord: { total: 0, healthy: 0, unhealthy: 0 }
            },
            connectionLimits: {
                telegram: connectionManager.getConnectionStats('telegram'),
                whatsapp: connectionManager.getConnectionStats('whatsapp'),
                discord: connectionManager.getConnectionStats('discord')
            },
            issues: [] as string[]
        };

        for (const [userId, userChannels] of this.channels.entries()) {
            for (const platform of Object.keys(userChannels) as MessagingPlatform[]) {
                const channel = userChannels[platform as keyof UserChannels];
                if (channel) {
                    health.totalChannels++;
                    health.platformBreakdown[platform].total++;

                    // Check if channel is healthy (connected and running)
                    const isHealthy = channel.running;
                    if (isHealthy) {
                        health.platformBreakdown[platform].healthy++;
                    } else {
                        health.platformBreakdown[platform].unhealthy++;
                        health.issues.push(`${platform} channel for user ${userId} is not running`);
                    }
                }
            }
        }

        return health;
    }

    /**
     * Shutdown all channels
     */
    async shutdown(): Promise<void> {
        console.log('[MessagingService] Shutting down...');

        // Stop periodic cleanup
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
            console.log('[MessagingService] Stopped periodic cleanup');
        }

        // Clear rate limiter queues
        Object.values(this.rateLimiters).forEach(limiter => {
            limiter.clearQueue();
        });
        console.log('[MessagingService] Cleared rate limiter queues');

        for (const [userId, userChannels] of this.channels.entries()) {
            for (const platform of Object.keys(userChannels) as MessagingPlatform[]) {
                try {
                    await this.stopChannel(userId, platform);
                } catch (error) {
                    console.error(
                        `[MessagingService] Error stopping ${platform} for user ${userId}:`,
                        error
                    );
                }
            }
        }

        this.channels.clear();
        this.initialized = false;

        console.log('[MessagingService] Shutdown complete');
    }
}

// Export singleton instance
export const messagingService = new MessagingService();
