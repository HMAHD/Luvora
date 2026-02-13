/**
 * Base Channel Interface for Lovera Messaging
 *
 * Abstract base class that all messaging channels (Telegram, WhatsApp, Discord)
 * must implement. Provides:
 * - Consistent lifecycle management (start/stop)
 * - Security (allow-list checking)
 * - Error handling
 * - Status reporting
 *
 * Based on production patterns from Nanobot.
 */

import type {
    ChannelConfig,
    OutboundMessage,
    MessagingPlatform,
    ChannelError
} from './types';

/**
 * Abstract base class for all messaging channels
 */
export abstract class BaseChannel {
    /**
     * Platform identifier
     */
    abstract readonly name: MessagingPlatform;

    /**
     * Channel configuration
     */
    protected config: ChannelConfig;

    /**
     * Running state
     */
    protected running: boolean = false;

    /**
     * Error state
     */
    protected lastError: Error | null = null;

    constructor(config: ChannelConfig) {
        this.config = config;
    }

    /**
     * Start the channel and begin listening/polling
     * Must be implemented by subclasses
     */
    abstract start(): Promise<void>;

    /**
     * Stop the channel and cleanup resources
     * Must be implemented by subclasses
     */
    abstract stop(): Promise<void>;

    /**
     * Send a message through this channel
     * Must be implemented by subclasses
     *
     * @param message - The message to send
     * @throws ChannelError if sending fails
     */
    abstract send(message: OutboundMessage): Promise<void>;

    /**
     * Check if a user is allowed to interact with this channel
     * Based on allow-list in configuration
     *
     * @param userId - The user/sender ID to check
     * @returns true if allowed, false otherwise
     */
    protected isAllowed(userId: string): boolean {
        const allowList = this.config.allowFrom || [];

        // Empty allow-list = allow everyone
        if (allowList.length === 0) {
            return true;
        }

        // Check if user is in allow-list
        const userStr = String(userId);
        if (allowList.includes(userStr)) {
            return true;
        }

        // Support composite IDs like "123456789|username"
        if (userStr.includes('|')) {
            for (const part of userStr.split('|')) {
                if (part && allowList.includes(part)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if channel is currently running
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Get last error (if any)
     */
    getLastError(): Error | null {
        return this.lastError;
    }

    /**
     * Clear last error
     */
    clearError(): void {
        this.lastError = null;
    }

    /**
     * Set error state
     */
    protected setError(error: Error): void {
        this.lastError = error;
        console.error(`[${this.name}] Error:`, error);
    }

    /**
     * Log info message
     */
    protected log(message: string, ...args: unknown[]): void {
        console.log(`[${this.name}]`, message, ...args);
    }

    /**
     * Log error message
     */
    protected logError(message: string, error?: Error): void {
        console.error(`[${this.name}] ${message}`, error || '');
    }

    /**
     * Safe channel start with error handling
     */
    async safeStart(): Promise<boolean> {
        try {
            this.clearError();
            await this.start();
            return true;
        } catch (error) {
            this.setError(error as Error);
            return false;
        }
    }

    /**
     * Safe channel stop with error handling
     */
    async safeStop(): Promise<boolean> {
        try {
            await this.stop();
            this.clearError();
            return true;
        } catch (error) {
            this.setError(error as Error);
            return false;
        }
    }

    /**
     * Safe message send with error handling
     */
    async safeSend(message: OutboundMessage): Promise<boolean> {
        try {
            await this.send(message);
            return true;
        } catch (error) {
            this.setError(error as Error);
            return false;
        }
    }
}
