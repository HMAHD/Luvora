/**
 * Messaging System Types for Lovera
 *
 * Defines interfaces and types for the user-managed messaging system.
 * Supports Telegram, WhatsApp, and Discord channels.
 */

/**
 * Supported messaging platforms
 */
export type MessagingPlatform = 'telegram' | 'whatsapp' | 'discord';

/**
 * Notification types
 */
export type NotificationType = 'spark' | 'automation' | 'alert';

/**
 * Message delivery status
 */
export type MessageStatus = 'pending' | 'sent' | 'failed';

/**
 * Base channel configuration interface
 */
export interface ChannelConfig {
    enabled: boolean;
    allowFrom?: string[]; // User IDs allowed to interact (empty = allow all)
}

/**
 * Telegram-specific configuration
 */
export interface TelegramConfig extends ChannelConfig {
    botToken: string; // Encrypted in database
    botUsername?: string;
    botName?: string;
    telegramUserId?: string; // Set after user sends /start
}

/**
 * WhatsApp-specific configuration
 */
export interface WhatsAppConfig extends ChannelConfig {
    sessionPath: string; // Path to session data
    phoneNumber?: string; // Set after QR scan
}

/**
 * Discord-specific configuration
 */
export interface DiscordConfig extends ChannelConfig {
    botToken: string; // Encrypted in database
    botUsername?: string;
    discordUserId?: string; // Set after user DMs bot
}

/**
 * Union type for all channel configurations
 */
export type AnyChannelConfig = TelegramConfig | WhatsAppConfig | DiscordConfig;

/**
 * Outbound message (to be sent to user)
 */
export interface OutboundMessage {
    userId: string; // Lovera user ID
    chatId: string; // Platform-specific chat ID
    content: string; // Message content (Markdown supported)
    metadata?: Record<string, unknown>; // Optional metadata
}

/**
 * PocketBase record for messaging_channels collection
 */
export interface MessagingChannelRecord {
    id: string;
    user: string; // User ID
    platform: MessagingPlatform;
    enabled: boolean;
    config: AnyChannelConfig; // Stored as JSON (with encrypted fields)
    last_used?: string; // ISO datetime
    created: string; // ISO datetime
    updated: string; // ISO datetime
}

/**
 * PocketBase record for messaging_notifications collection
 */
export interface MessagingNotificationRecord {
    id: string;
    user: string; // User ID
    platform: MessagingPlatform;
    type: NotificationType;
    content: string;
    status: MessageStatus;
    error?: string;
    sent_at?: string; // ISO datetime
    created: string; // ISO datetime
}

/**
 * Channel status information
 */
export interface ChannelStatus {
    platform: MessagingPlatform;
    enabled: boolean;
    connected: boolean;
    lastUsed?: Date;
    metadata?: {
        botUsername?: string;
        userId?: string;
        phoneNumber?: string;
    };
}

/**
 * Notification result
 */
export interface NotificationResult {
    success: boolean;
    platform?: MessagingPlatform;
    error?: string;
    messageId?: string;
}

/**
 * Channel error
 */
export class ChannelError extends Error {
    constructor(
        message: string,
        public platform: MessagingPlatform,
        public code?: string
    ) {
        super(message);
        this.name = 'ChannelError';
    }
}

/**
 * Encryption error
 */
export class EncryptionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EncryptionError';
    }
}
