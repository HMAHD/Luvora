/**
 * Discord Channel Implementation for Luvora
 *
 * Handles user-managed Discord bot integration.
 * Each user creates their own bot via Discord Developer Portal and provides the token.
 *
 * Features:
 * - Gateway connection (similar to Telegram polling)
 * - DM-based messaging
 * - /start command to link user
 * - Markdown formatting
 * - Auto-reconnection on errors
 *
 * Discord Bot Setup:
 * 1. Go to https://discord.com/developers/applications
 * 2. Create New Application
 * 3. Go to Bot section
 * 4. Copy bot token
 * 5. Enable "Message Content Intent" under Privileged Gateway Intents
 */

import { Client, GatewayIntentBits, Events, Message, Partials } from 'discord.js';
import { BaseChannel } from '../base-channel';
import type { DiscordConfig, OutboundMessage } from '../types';
import { ChannelError } from '../types';

interface DiscordChannelCallbacks {
    onUserIdReceived: (discordUserId: string, username: string) => Promise<void>;
}

export class DiscordChannel extends BaseChannel {
    readonly name = 'discord' as const;

    private client: Client | null = null;
    private discordUserId: string | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private callbacks: DiscordChannelCallbacks;

    constructor(
        config: DiscordConfig,
        private userId: string, // Luvora user ID
        callbacks: DiscordChannelCallbacks
    ) {
        super(config);
        this.discordUserId = config.discordUserId || null;
        this.callbacks = callbacks;
    }

    async start(): Promise<void> {
        if (this.running) {
            this.log('Already running, skipping start');
            return;
        }

        const config = this.config as DiscordConfig;

        if (!config.botToken) {
            throw new ChannelError('Bot token is required', 'discord', 'MISSING_TOKEN');
        }

        try {
            // Create Discord client
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.MessageContent
                ],
                partials: [Partials.Channel, Partials.Message]
            });

            // Setup event handlers
            this.setupHandlers();

            // Login to Discord
            await this.client.login(config.botToken);

            this.running = true;
            this.log(`Started for user ${this.userId}`);

        } catch (error) {
            this.logError('Failed to start', error as Error);
            this.scheduleReconnect();
            throw new ChannelError(
                `Failed to start: ${(error as Error).message}`,
                'discord',
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

        // Destroy client
        if (this.client) {
            try {
                this.client.destroy();
            } catch (error) {
                this.logError('Error destroying client', error as Error);
            }
            this.client = null;
        }

        this.log('Stopped');
    }

    async send(message: OutboundMessage): Promise<void> {
        if (!this.client) {
            throw new ChannelError('Client not initialized', 'discord', 'NOT_INITIALIZED');
        }

        if (!this.discordUserId) {
            throw new ChannelError(
                'Discord user ID not set. User must send /start to the bot first.',
                'discord',
                'USER_NOT_LINKED'
            );
        }

        try {
            // Fetch the user
            const user = await this.client.users.fetch(this.discordUserId);

            // Send DM
            await user.send(message.content);

            this.log(`Message sent to ${this.discordUserId}`);

        } catch (error) {
            this.logError('Failed to send message', error as Error);
            throw new ChannelError(
                `Failed to send message: ${(error as Error).message}`,
                'discord',
                'SEND_FAILED'
            );
        }
    }

    private setupHandlers(): void {
        if (!this.client) return;

        // Ready event
        this.client.on(Events.ClientReady, () => {
            this.log(`Logged in as ${this.client!.user?.tag}`);
        });

        // Message handler for /start command
        this.client.on(Events.MessageCreate, async (message: Message) => {
            // Ignore bot messages
            if (message.author.bot) return;

            // Only handle DMs
            if (!message.guild && message.content.toLowerCase() === '/start') {
                try {
                    const discordUserId = message.author.id;
                    const username = message.author.username;

                    this.log(`/start received from ${discordUserId} (@${username})`);

                    // Save Discord user ID if not already set
                    if (!this.discordUserId) {
                        this.discordUserId = discordUserId;
                        await this.callbacks.onUserIdReceived(discordUserId, username);
                        this.log(`Linked Discord user ${discordUserId} to Luvora user ${this.userId}`);
                    }

                    // Send welcome message
                    const welcomeMessage =
                        `✅ **Connected to Luvora!**\n\n` +
                        `Hi ${message.author.username}! You will now receive:\n` +
                        `• ✨ Daily Spark messages\n` +
                        `• 🔔 Automation notifications\n` +
                        `• ⚠️ Important alerts\n\n` +
                        `_Your love journey just got automated!_ ❤️`;

                    await message.reply(welcomeMessage);

                } catch (error) {
                    this.logError('Error handling /start', error as Error);
                }
            }
        });

        // Error event
        this.client.on(Events.Error, (error) => {
            this.logError('Client error', error);
        });

        // Disconnect event
        this.client.on(Events.ShardDisconnect, () => {
            this.log('Disconnected from Discord');
            this.running = false;
            this.scheduleReconnect();
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
                // Destroy current instance
                if (this.client) {
                    this.client.destroy();
                    this.client = null;
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
     * Get Discord user ID (for debugging)
     */
    getDiscordUserId(): string | null {
        return this.discordUserId;
    }

    /**
     * Check if user is linked
     */
    isLinked(): boolean {
        return this.discordUserId !== null;
    }

    /**
     * Get bot username
     */
    getBotUsername(): string | null {
        return this.client?.user?.username || null;
    }
}
