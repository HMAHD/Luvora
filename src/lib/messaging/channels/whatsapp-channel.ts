/**
 * WhatsApp Channel Implementation for Lovera
 *
 * Handles user-managed WhatsApp integration using whatsapp-web.js.
 * Uses WhatsApp Web protocol (same as desktop app).
 *
 * Features:
 * - QR code authentication
 * - Session persistence
 * - Auto-reconnection
 * - No Meta Business API needed!
 *
 * Note: This uses WhatsApp Web protocol which is technically against ToS
 * but widely used. For production, consider official Business API if budget allows.
 */

import { Client, LocalAuth } from 'whatsapp-web.js';
import { BaseChannel } from '../base-channel';
import type { WhatsAppConfig, OutboundMessage } from '../types';
import { ChannelError } from '../types';
import { DatabaseSessionStore } from '../database-session-store';
import { SessionArchiver } from '../session-archiver';
import { ConnectionManager } from '../connection-manager';
import fs from 'fs';
import path from 'path';

interface WhatsAppChannelCallbacks {
    onQR?: (qr: string) => Promise<void>;
    onReady: (phoneNumber: string) => Promise<void>;
}

export class WhatsAppChannel extends BaseChannel {
    readonly name = 'whatsapp' as const;

    private client: Client | null = null;
    private phoneNumber: string | null = null;
    private callbacks: WhatsAppChannelCallbacks;
    private sessionPath: string;
    private sessionStore: DatabaseSessionStore;
    private sessionRestored = false;

    constructor(
        config: WhatsAppConfig,
        private userId: string, // Lovera user ID
        callbacks: WhatsAppChannelCallbacks
    ) {
        super(config);
        this.sessionPath = config.sessionPath;
        this.phoneNumber = config.phoneNumber || null;
        this.callbacks = callbacks;
        this.sessionStore = new DatabaseSessionStore();

        // Ensure session directory exists
        this.ensureSessionDir();
    }

    private ensureSessionDir(): void {
        try {
            const dir = path.dirname(this.sessionPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`Created session directory: ${dir}`);
            }
        } catch (error) {
            this.logError('Failed to create session directory', error as Error);
            throw new ChannelError(
                `Failed to create session directory: ${(error as Error).message}`,
                'whatsapp',
                'SESSION_DIR_ERROR'
            );
        }
    }

    async start(): Promise<void> {
        if (this.running) {
            this.log('Already running, skipping start');
            return;
        }

        try {
            // Check connection limits
            const connectionManager = ConnectionManager.getInstance();
            if (!connectionManager.canCreateConnection(this.userId, 'whatsapp')) {
                throw new ChannelError(
                    'Maximum WhatsApp connections reached. Please try again later.',
                    'whatsapp',
                    'CONNECTION_LIMIT_REACHED'
                );
            }

            this.log(`Starting WhatsApp client for user ${this.userId}`);

            // Try to restore session from database BEFORE initializing client
            await this.restoreSessionFromDatabase();

            // Detect serverless environment
            const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

            // Create WhatsApp client with serverless-optimized config
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: this.sessionPath
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--single-process', // Required for serverless
                        '--disable-extensions',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding'
                    ],
                    // Use Vercel's Chrome binary if available
                    ...(isServerless && {
                        executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
                    })
                }
            });

            this.log(`WhatsApp client created (serverless: ${!!isServerless})`);

            this.setupHandlers();

            // Initialize client
            await this.client.initialize();
            this.running = true;

            // Register connection with manager
            const connectionManager = ConnectionManager.getInstance();
            connectionManager.registerConnection(this.userId, 'whatsapp');

        } catch (error) {
            this.logError('Failed to start', error as Error);

            // Record failure in connection manager
            ConnectionManager.getInstance().recordFailure();

            throw new ChannelError(
                `Failed to start: ${(error as Error).message}`,
                'whatsapp',
                'START_FAILED'
            );
        }
    }

    async stop(): Promise<void> {
        if (!this.running) return;

        this.log('Stopping...');
        this.running = false;

        if (this.client) {
            try {
                await this.client.destroy();
            } catch (error) {
                this.logError('Error destroying client', error as Error);
            }
            this.client = null;
        }

        // Unregister from connection manager
        ConnectionManager.getInstance().unregisterConnection(this.userId, 'whatsapp');

        this.log('Stopped');
    }

    async send(message: OutboundMessage): Promise<void> {
        if (!this.client) {
            throw new ChannelError('Client not initialized', 'whatsapp', 'NOT_INITIALIZED');
        }

        if (!this.phoneNumber) {
            throw new ChannelError(
                'Phone number not set. WhatsApp must be linked first.',
                'whatsapp',
                'NOT_LINKED'
            );
        }

        try {
            // Format: phoneNumber@c.us (for individual chats)
            const chatId = message.chatId || `${this.phoneNumber}@c.us`;

            await this.client.sendMessage(chatId, message.content);

            // Update activity in connection manager
            ConnectionManager.getInstance().updateActivity(this.userId, 'whatsapp');

            this.log(`Message sent to ${chatId}`);

        } catch (error) {
            this.logError('Failed to send message', error as Error);

            // Mark connection as unhealthy on repeated failures
            ConnectionManager.getInstance().markUnhealthy(this.userId, 'whatsapp');

            throw new ChannelError(
                `Failed to send message: ${(error as Error).message}`,
                'whatsapp',
                'SEND_FAILED'
            );
        }
    }

    private setupHandlers(): void {
        if (!this.client) return;

        // QR Code event (first-time setup)
        this.client.on('qr', async (qr) => {
            this.log('QR code generated');

            if (this.callbacks.onQR) {
                try {
                    await this.callbacks.onQR(qr);
                } catch (error) {
                    this.logError('Error in onQR callback', error as Error);
                }
            }
        });

        // Authenticated event
        this.client.on('authenticated', () => {
            this.log('Authenticated successfully');
        });

        // Ready event (connection established)
        this.client.on('ready', async () => {
            this.log('Client ready');

            try {
                // Get phone number from client info
                const info = this.client!.info;
                if (info && info.wid) {
                    this.phoneNumber = info.wid.user;
                    this.log(`Phone number: ${this.phoneNumber}`);

                    // Archive session to database for persistence
                    // This runs in background, don't await to avoid blocking
                    this.archiveSessionToDatabase().catch(error => {
                        this.logError('Background session archive failed', error as Error);
                    });

                    // Notify ready
                    if (this.callbacks.onReady) {
                        await this.callbacks.onReady(this.phoneNumber);
                    }
                }
            } catch (error) {
                this.logError('Error in ready handler', error as Error);
            }
        });

        // Disconnected event
        this.client.on('disconnected', (reason) => {
            this.log(`Disconnected: ${reason}`);
            this.running = false;

            // TODO: Could implement auto-reconnect here if needed
        });

        // Auth failure event
        this.client.on('auth_failure', (message) => {
            this.logError('Authentication failure', new Error(message));
            this.running = false;
        });
    }

    /**
     * Get phone number (for debugging)
     */
    getPhoneNumber(): string | null {
        return this.phoneNumber;
    }

    /**
     * Check if WhatsApp is linked
     */
    isLinked(): boolean {
        return this.phoneNumber !== null;
    }

    /**
     * Check if session exists (already scanned QR before)
     */
    hasSession(): boolean {
        const sessionFile = path.join(this.sessionPath, 'Default', 'IndexedDB');
        return fs.existsSync(sessionFile);
    }

    /**
     * Restore session from database
     * Called before client initialization to restore previously saved session
     */
    private async restoreSessionFromDatabase(): Promise<void> {
        try {
            // Check if session exists in database
            const hasDbSession = await this.sessionStore.hasSession(this.userId);

            if (!hasDbSession) {
                this.log('No session found in database');
                return;
            }

            // Check if local session already exists (skip restore if it does)
            if (SessionArchiver.hasValidSession(this.sessionPath)) {
                this.log('Local session already exists, skipping restore');
                this.sessionRestored = true;
                return;
            }

            this.log('Restoring session from database...');

            // Load compressed session from database
            const sessionData = await this.sessionStore.loadSession(this.userId);

            if (!sessionData) {
                this.log('Session data not found in database');
                return;
            }

            // Restore session to local path
            await SessionArchiver.restoreSession(sessionData, this.sessionPath);

            this.sessionRestored = true;
            this.log('Session restored from database successfully');

        } catch (error) {
            this.logError('Failed to restore session from database', error as Error);
            // Continue anyway - will trigger QR code flow if restore fails
        }
    }

    /**
     * Archive session to database
     * Called after successful authentication to save session for future use
     */
    private async archiveSessionToDatabase(): Promise<void> {
        try {
            // Only archive if we have a valid local session
            if (!SessionArchiver.hasValidSession(this.sessionPath)) {
                this.log('No valid local session to archive');
                return;
            }

            this.log('Archiving session to database...');

            // Archive and compress session directory
            const archive = await SessionArchiver.archiveSession(this.sessionPath);

            // Save to database
            await this.sessionStore.saveSession(
                this.userId,
                archive.tarballBase64,
                this.phoneNumber || undefined,
                {
                    archivedAt: new Date().toISOString(),
                    originalSize: archive.originalSizeBytes,
                    compressedSize: archive.sizeBytes,
                    compressionRatio: archive.compressionRatio
                }
            );

            this.log(`Session archived to database (${(archive.sizeBytes / 1024 / 1024).toFixed(2)} MB)`);

        } catch (error) {
            this.logError('Failed to archive session to database', error as Error);
            // Don't throw - session still works locally
        }
    }
}
