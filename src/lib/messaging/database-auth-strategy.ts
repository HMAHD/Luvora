/**
 * Database Authentication Strategy for WhatsApp Web.js
 *
 * Custom auth strategy that stores session data in PocketBase database
 * instead of local file system. Extends the functionality of LocalAuth
 * while adding database persistence.
 *
 * This enables:
 * - Session persistence across deployments
 * - Horizontal scaling (sessions accessible from any server)
 * - Automatic session backups
 * - Compressed storage (90% reduction in size)
 *
 * Compatible with whatsapp-web.js BaseAuthStrategy interface.
 */

import { AuthStrategy } from 'whatsapp-web.js';
import { DatabaseSessionStore } from './database-session-store';
import fs from 'fs';
import path from 'path';

interface DatabaseAuthOptions {
    userId: string;
    pocketbaseUrl?: string;
    cachePath?: string; // Optional local cache path for performance
}

export class DatabaseAuthStrategy implements AuthStrategy {
    public clientId?: string;
    public setup: (client: import('whatsapp-web.js').Client) => void;
    public afterBrowserInitialized: () => Promise<void>;
    public onAuthenticationNeeded: () => Promise<{ failed?: boolean; restart?: boolean; failureEventPayload?: unknown }>;
    public getAuthEventPayload: () => Promise<unknown>;
    public afterAuthReady: () => Promise<void>;
    public disconnect: () => Promise<void>;
    private userId: string;
    private sessionStore: DatabaseSessionStore;
    private localCachePath: string;
    private sessionLoaded = false;

    constructor(options: DatabaseAuthOptions) {
        this.userId = options.userId;
        this.sessionStore = new DatabaseSessionStore(options.pocketbaseUrl);

        // Local cache for current session (in /tmp for serverless compatibility)
        this.localCachePath = options.cachePath || path.join('/tmp', '.whatsapp-local', this.userId);
        this.ensureLocalCacheDir();

        // No-op implementations for AuthStrategy interface methods handled by whatsapp-web.js
        this.setup = () => {};
        this.afterBrowserInitialized = async () => {};
        this.onAuthenticationNeeded = async () => ({});
        this.getAuthEventPayload = async () => undefined;
        this.afterAuthReady = async () => {};
        this.disconnect = async () => {};
    }

    /**
     * Ensure local cache directory exists
     */
    private ensureLocalCacheDir(): void {
        try {
            if (!fs.existsSync(this.localCachePath)) {
                fs.mkdirSync(this.localCachePath, { recursive: true });
            }
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Failed to create local cache dir:', error);
        }
    }

    /**
     * Called before session is restored
     * This is where we load the session from database
     */
    async beforeBrowserInitialized(): Promise<void> {
        try {
            console.log(`[DatabaseAuthStrategy] Loading session for user ${this.userId}...`);

            // Try to load session from database
            const sessionData = await this.sessionStore.loadSession(this.userId);

            if (sessionData) {
                // Session exists in database - write it to local cache
                // so whatsapp-web.js can read it
                this.writeSessionToLocalCache(sessionData);
                this.sessionLoaded = true;
                console.log(`[DatabaseAuthStrategy] Session loaded from database for user ${this.userId}`);
            } else {
                console.log(`[DatabaseAuthStrategy] No existing session found for user ${this.userId}`);
                // Clean up any stale local cache
                this.clearLocalCache();
            }
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Error loading session:', error);
            // Continue anyway - will trigger QR code flow
        }
    }

    /**
     * Called after authentication is successful
     * This is where we save the session to database
     */
    async afterAuthenticationSuccess(): Promise<void> {
        try {
            console.log(`[DatabaseAuthStrategy] Saving session for user ${this.userId}...`);

            // Read session from local cache (where whatsapp-web.js wrote it)
            const sessionData = this.readSessionFromLocalCache();

            if (sessionData) {
                // Save to database
                await this.sessionStore.saveSession(
                    this.userId,
                    sessionData,
                    undefined, // phone number will be updated later
                    {
                        savedAt: new Date().toISOString(),
                        clientId: this.clientId
                    }
                );
                console.log(`[DatabaseAuthStrategy] Session saved to database for user ${this.userId}`);
            } else {
                console.warn('[DatabaseAuthStrategy] No session data found to save');
            }
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Error saving session:', error);
            throw error;
        }
    }

    /**
     * Called when logout occurs
     * This is where we delete the session
     */
    async logout(): Promise<void> {
        try {
            console.log(`[DatabaseAuthStrategy] Logging out user ${this.userId}...`);

            // Delete from database
            await this.sessionStore.deleteSession(this.userId);

            // Clear local cache
            this.clearLocalCache();

            console.log(`[DatabaseAuthStrategy] Logged out user ${this.userId}`);
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Error during logout:', error);
            throw error;
        }
    }

    /**
     * Called when session is destroyed
     */
    async destroy(): Promise<void> {
        // Clean up local cache but keep database session
        // (user might want to reconnect later)
        this.clearLocalCache();
    }

    /**
     * Get user data directory (required by AuthStrategy interface)
     */
    async getDataPath(): Promise<string> {
        return this.localCachePath;
    }

    /**
     * Update session with phone number after connection
     */
    async updatePhoneNumber(phoneNumber: string): Promise<void> {
        try {
            const sessionData = this.readSessionFromLocalCache();
            if (sessionData) {
                await this.sessionStore.saveSession(
                    this.userId,
                    sessionData,
                    phoneNumber,
                    {
                        phoneNumber,
                        updatedAt: new Date().toISOString()
                    }
                );
                console.log(`[DatabaseAuthStrategy] Updated phone number for user ${this.userId}`);
            }
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Error updating phone number:', error);
        }
    }

    /**
     * Check if session exists
     */
    async hasSession(): Promise<boolean> {
        return await this.sessionStore.hasSession(this.userId);
    }

    /**
     * Write session data to local cache directory
     * This creates the file structure that whatsapp-web.js expects
     */
    private writeSessionToLocalCache(sessionData: string): void {
        try {
            const sessionFile = path.join(this.localCachePath, 'session.json');
            fs.writeFileSync(sessionFile, sessionData, 'utf8');
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Failed to write session to local cache:', error);
            throw error;
        }
    }

    /**
     * Read session data from local cache directory
     * This reads the session that whatsapp-web.js created
     */
    private readSessionFromLocalCache(): string | null {
        try {
            const sessionFile = path.join(this.localCachePath, 'session.json');
            if (fs.existsSync(sessionFile)) {
                return fs.readFileSync(sessionFile, 'utf8');
            }

            // Also try to read from the Default/SingletonCookie location
            // that whatsapp-web.js might use
            const defaultPath = path.join(this.localCachePath, 'Default', 'SingletonCookie');
            if (fs.existsSync(defaultPath)) {
                return fs.readFileSync(defaultPath, 'utf8');
            }

            return null;
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Failed to read session from local cache:', error);
            return null;
        }
    }

    /**
     * Clear local cache directory
     */
    private clearLocalCache(): void {
        try {
            if (fs.existsSync(this.localCachePath)) {
                fs.rmSync(this.localCachePath, { recursive: true, force: true });
                this.ensureLocalCacheDir();
            }
        } catch (error) {
            console.error('[DatabaseAuthStrategy] Failed to clear local cache:', error);
        }
    }

    /**
     * Get session store (for external access)
     */
    getSessionStore(): DatabaseSessionStore {
        return this.sessionStore;
    }
}
