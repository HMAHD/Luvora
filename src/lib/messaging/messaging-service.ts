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
import type { BaseChannel } from './base-channel';
import type { MessagingPlatform, OutboundMessage, TelegramConfig, WhatsAppConfig } from './types';
import path from 'path';

type ChannelInstance = BaseChannel & {
    isLinked?: () => boolean;
    hasSession?: () => boolean;
};

interface UserChannels {
    telegram?: ChannelInstance;
    whatsapp?: ChannelInstance;
}

class MessagingService {
    private channels: Map<string, UserChannels> = new Map();
    private initialized = false;

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
            // Authenticate as admin to fetch all channels
            await pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL || '',
                process.env.POCKETBASE_ADMIN_PASSWORD || ''
            );

            // Fetch all enabled channels
            const channels = await pb.collection('messaging_channels').getFullList({
                filter: 'enabled = true',
                $autoCancel: false
            });

            console.log(`[MessagingService] Found ${channels.length} enabled channels`);

            // Initialize each channel
            for (const channelRecord of channels) {
                try {
                    await this.startChannel(
                        channelRecord.user,
                        channelRecord.platform as MessagingPlatform,
                        channelRecord.config
                    );
                } catch (error) {
                    console.error(
                        `[MessagingService] Failed to start ${channelRecord.platform} for user ${channelRecord.user}:`,
                        error
                    );
                }
            }

            this.initialized = true;
            console.log('[MessagingService] Initialization complete');

        } catch (error) {
            console.error('[MessagingService] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Start a channel for a specific user
     */
    async startChannel(
        userId: string,
        platform: MessagingPlatform,
        config: TelegramConfig | WhatsAppConfig
    ): Promise<void> {
        console.log(`[MessagingService] Starting ${platform} channel for user ${userId}`);

        // Get or create user channels map
        if (!this.channels.has(userId)) {
            this.channels.set(userId, {});
        }
        const userChannels = this.channels.get(userId)!;

        // Stop existing channel if running
        const existingChannel = userChannels[platform as keyof UserChannels];
        if (existingChannel) {
            await existingChannel.stop();
        }

        // Create and start new channel
        let channel: ChannelInstance;

        if (platform === 'telegram') {
            const telegramConfig = config as TelegramConfig;

            // Decrypt bot token
            const botToken = decrypt(telegramConfig.botToken);

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

        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Start the channel
        await channel.start();

        // Store channel instance
        userChannels[platform as keyof UserChannels] = channel as any;
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
        delete userChannels[platform as keyof UserChannels];
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

            // Send message
            await channel.send(outboundMessage);

            // Log success
            await this.logNotification(userId, message.platform, message.content, 'sent');

            console.log(`[MessagingService] Message sent via ${message.platform} for user ${userId}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[MessagingService] Failed to send message:`, error);

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
     * Shutdown all channels
     */
    async shutdown(): Promise<void> {
        console.log('[MessagingService] Shutting down...');

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
