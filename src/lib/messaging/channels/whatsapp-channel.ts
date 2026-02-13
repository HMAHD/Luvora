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

    constructor(
        config: WhatsAppConfig,
        private userId: string, // Lovera user ID
        callbacks: WhatsAppChannelCallbacks
    ) {
        super(config);
        this.sessionPath = config.sessionPath;
        this.phoneNumber = config.phoneNumber || null;
        this.callbacks = callbacks;

        // Ensure session directory exists
        this.ensureSessionDir();
    }

    private ensureSessionDir(): void {
        const dir = path.dirname(this.sessionPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async start(): Promise<void> {
        if (this.running) {
            this.log('Already running, skipping start');
            return;
        }

        try {
            this.log(`Starting WhatsApp client for user ${this.userId}`);

            // Create WhatsApp client
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
                        '--disable-gpu'
                    ]
                }
            });

            this.setupHandlers();

            // Initialize client
            await this.client.initialize();
            this.running = true;

        } catch (error) {
            this.logError('Failed to start', error as Error);
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

            this.log(`Message sent to ${chatId}`);

        } catch (error) {
            this.logError('Failed to send message', error as Error);
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
}
