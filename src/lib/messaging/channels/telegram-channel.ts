/**
 * Telegram Channel Implementation for Lovera
 *
 * Handles user-managed Telegram bot integration.
 * Each user creates their own bot via @BotFather and provides the token.
 *
 * Features:
 * - Polling mode (no webhook needed)
 * - /start command to link user
 * - Markdown formatting
 * - Auto-reconnection on errors
 */

import TelegramBot from 'node-telegram-bot-api';
import { BaseChannel } from '../base-channel';
import type { TelegramConfig, OutboundMessage } from '../types';
import { ChannelError } from '../types';

interface TelegramChannelCallbacks {
    onUserIdReceived: (telegramUserId: string) => Promise<void>;
}

export class TelegramChannel extends BaseChannel {
    readonly name = 'telegram' as const;

    private bot: TelegramBot | null = null;
    private telegramUserId: string | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private callbacks: TelegramChannelCallbacks;

    constructor(
        config: TelegramConfig,
        private userId: string, // Lovera user ID
        callbacks: TelegramChannelCallbacks
    ) {
        super(config);
        this.telegramUserId = config.telegramUserId || null;
        this.callbacks = callbacks;
    }

    async start(): Promise<void> {
        if (this.running) {
            this.log('Already running, skipping start');
            return;
        }

        const config = this.config as TelegramConfig;

        if (!config.botToken) {
            throw new ChannelError('Bot token is required', 'telegram', 'MISSING_TOKEN');
        }

        try {
            // Create bot instance
            this.bot = new TelegramBot(config.botToken, {
                polling: {
                    params: {
                        timeout: 30
                    }
                }
            });

            // Setup message handlers
            this.setupHandlers();

            this.running = true;
            this.log(`Started for user ${this.userId}`);

        } catch (error) {
            this.logError('Failed to start', error as Error);
            this.scheduleReconnect();
            throw new ChannelError(
                `Failed to start: ${(error as Error).message}`,
                'telegram',
                'START_FAILED'
            );
        }
    }

    async stop(): Promise<void> {
        if (!this.running) return;

        this.log('Stopping...');
        this.running = false;

        // Cancel reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Stop polling
        if (this.bot) {
            try {
                await this.bot.stopPolling();
            } catch (error) {
                this.logError('Error stopping polling', error as Error);
            }
            this.bot = null;
        }

        this.log('Stopped');
    }

    async send(message: OutboundMessage): Promise<void> {
        if (!this.bot) {
            throw new ChannelError('Bot not initialized', 'telegram', 'NOT_INITIALIZED');
        }

        if (!this.telegramUserId) {
            throw new ChannelError(
                'Telegram user ID not set. User must send /start to the bot first.',
                'telegram',
                'USER_NOT_LINKED'
            );
        }

        try {
            await this.bot.sendMessage(this.telegramUserId, message.content, {
                parse_mode: 'Markdown'
            });

            this.log(`Message sent to ${this.telegramUserId}`);

        } catch (error) {
            this.logError('Failed to send message', error as Error);
            throw new ChannelError(
                `Failed to send message: ${(error as Error).message}`,
                'telegram',
                'SEND_FAILED'
            );
        }
    }

    private setupHandlers(): void {
        if (!this.bot) return;

        // Handle /start command
        this.bot.onText(/\/start/, async (msg) => {
            try {
                const chatId = msg.chat.id.toString();
                const username = msg.from?.username;
                const firstName = msg.from?.first_name || 'there';

                this.log(`/start received from ${chatId} (@${username})`);

                // Save Telegram user ID if not already set
                if (!this.telegramUserId) {
                    this.telegramUserId = chatId;
                    await this.callbacks.onUserIdReceived(chatId);
                    this.log(`Linked Telegram user ${chatId} to Lovera user ${this.userId}`);
                }

                // Send welcome message
                const welcomeMessage =
                    `✅ *Connected to Lovera!*\n\n` +
                    `Hi ${firstName}! You will now receive:\n` +
                    `• ✨ Daily Spark messages\n` +
                    `• 🔔 Automation notifications\n` +
                    `• ⚠️ Important alerts\n\n` +
                    `_Your love journey just got automated!_ ❤️`;

                await this.bot!.sendMessage(chatId, welcomeMessage, {
                    parse_mode: 'Markdown'
                });

            } catch (error) {
                this.logError('Error handling /start', error as Error);
            }
        });

        // Handle polling errors
        this.bot.on('polling_error', (error) => {
            this.logError('Polling error', error);
            this.scheduleReconnect();
        });

        // Handle webhook errors (shouldn't happen in polling mode, but just in case)
        this.bot.on('webhook_error', (error) => {
            this.logError('Webhook error', error);
        });
    }

    private scheduleReconnect(): void {
        if (!this.running) return;
        if (this.reconnectTimer) return; // Already scheduled

        this.log('Scheduling reconnect in 5 seconds...');

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;

            if (!this.running) return;

            this.log('Attempting to reconnect...');

            try {
                // Stop current instance
                if (this.bot) {
                    await this.bot.stopPolling().catch(() => {});
                    this.bot = null;
                }

                // Restart
                await this.start();
                this.log('Reconnected successfully');

            } catch (error) {
                this.logError('Reconnect failed', error as Error);
                this.scheduleReconnect(); // Try again
            }
        }, 5000);
    }

    /**
     * Get Telegram user ID (for debugging)
     */
    getTelegramUserId(): string | null {
        return this.telegramUserId;
    }

    /**
     * Check if user is linked
     */
    isLinked(): boolean {
        return this.telegramUserId !== null;
    }
}
