/**
 * Database Session Store for WhatsApp Web.js
 *
 * Stores WhatsApp session data in PocketBase instead of file system.
 * Uses compression to reduce storage from 150MB to ~5-10MB per user.
 *
 * Benefits:
 * - Sessions persist across deployments and server restarts
 * - Enables horizontal scaling (sessions not tied to specific server)
 * - Reduces storage costs by 90%+
 * - Automatic backups through PocketBase
 *
 * Architecture:
 * - Hybrid approach: file cache in /tmp for performance + database for persistence
 * - Compression: gzip compression reduces session size dramatically
 * - Auto-cleanup: removes sessions inactive for 30+ days
 */

import PocketBase from 'pocketbase';
import { gzipSync, gunzipSync } from 'zlib';
import fs from 'fs';
import path from 'path';

export interface SessionData {
    userId: string;
    sessionData: string;
    compressed: boolean;
    phoneNumber?: string;
    lastActive: string;
    sizeBytes: number;
    metadata?: Record<string, unknown>;
}

export class DatabaseSessionStore {
    private pb: PocketBase;
    private cacheDir: string;

    constructor(pocketbaseUrl?: string) {
        this.pb = new PocketBase(pocketbaseUrl || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love');

        // Use /tmp for cache (works in serverless environments)
        this.cacheDir = path.join('/tmp', '.whatsapp-session-cache');
        this.ensureCacheDir();
    }

    /**
     * Ensure cache directory exists
     */
    private ensureCacheDir(): void {
        try {
            if (!fs.existsSync(this.cacheDir)) {
                fs.mkdirSync(this.cacheDir, { recursive: true });
            }
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to create cache directory:', error);
        }
    }

    /**
     * Save session to database (with compression)
     */
    async saveSession(
        userId: string,
        sessionData: string,
        phoneNumber?: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        try {
            // Compress session data
            const compressed = this.compress(sessionData);
            const compressedBase64 = compressed.toString('base64');
            const sizeBytes = Buffer.byteLength(compressedBase64, 'utf8');

            const data = {
                user: userId,
                session_data: compressedBase64,
                compressed: true,
                phone_number: phoneNumber,
                last_active: new Date().toISOString(),
                size_bytes: sizeBytes,
                metadata: metadata || {}
            };

            // Check if session already exists
            try {
                const existing = await this.pb.collection('whatsapp_sessions').getFirstListItem(
                    `user="${userId}"`,
                    { $autoCancel: false }
                );

                // Update existing
                await this.pb.collection('whatsapp_sessions').update(
                    existing.id,
                    data,
                    { $autoCancel: false }
                );

                console.log(`[DatabaseSessionStore] Updated session for user ${userId} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
            } catch {
                // Create new
                await this.pb.collection('whatsapp_sessions').create(
                    data,
                    { $autoCancel: false }
                );

                console.log(`[DatabaseSessionStore] Created session for user ${userId} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
            }

            // Also save to file cache for faster access
            this.saveToCacheSync(userId, sessionData);

        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to save session:', error);
            throw new Error(`Failed to save session: ${(error as Error).message}`);
        }
    }

    /**
     * Load session from database (or cache)
     */
    async loadSession(userId: string): Promise<string | null> {
        try {
            // Try cache first (faster)
            const cached = this.loadFromCacheSync(userId);
            if (cached) {
                console.log(`[DatabaseSessionStore] Loaded session from cache for user ${userId}`);
                return cached;
            }

            // Load from database
            const record = await this.pb.collection('whatsapp_sessions').getFirstListItem(
                `user="${userId}"`,
                { $autoCancel: false }
            );

            if (!record) {
                return null;
            }

            // Decompress if needed
            const sessionData = record.compressed
                ? this.decompress(Buffer.from(record.session_data, 'base64'))
                : record.session_data;

            // Update last_active
            await this.pb.collection('whatsapp_sessions').update(
                record.id,
                { last_active: new Date().toISOString() },
                { $autoCancel: false }
            ).catch(() => {
                // Ignore update errors
            });

            // Save to cache for next time
            this.saveToCacheSync(userId, sessionData);

            console.log(`[DatabaseSessionStore] Loaded session from database for user ${userId}`);
            return sessionData;

        } catch (error) {
            if ((error as { status?: number }).status === 404) {
                return null; // No session found
            }
            console.error('[DatabaseSessionStore] Failed to load session:', error);
            throw new Error(`Failed to load session: ${(error as Error).message}`);
        }
    }

    /**
     * Delete session from database and cache
     */
    async deleteSession(userId: string): Promise<void> {
        try {
            // Delete from database
            const record = await this.pb.collection('whatsapp_sessions').getFirstListItem(
                `user="${userId}"`,
                { $autoCancel: false }
            );

            if (record) {
                await this.pb.collection('whatsapp_sessions').delete(record.id, {
                    $autoCancel: false
                });
            }

            // Delete from cache
            this.deleteFromCacheSync(userId);

            console.log(`[DatabaseSessionStore] Deleted session for user ${userId}`);

        } catch (error) {
            if ((error as { status?: number }).status !== 404) {
                console.error('[DatabaseSessionStore] Failed to delete session:', error);
                throw new Error(`Failed to delete session: ${(error as Error).message}`);
            }
        }
    }

    /**
     * Check if session exists
     */
    async hasSession(userId: string): Promise<boolean> {
        try {
            // Check cache first
            if (this.hasCacheSync(userId)) {
                return true;
            }

            // Check database
            const record = await this.pb.collection('whatsapp_sessions').getFirstListItem(
                `user="${userId}"`,
                { $autoCancel: false }
            );

            return !!record;
        } catch {
            return false;
        }
    }

    /**
     * Get session metadata
     */
    async getSessionInfo(userId: string): Promise<{
        phoneNumber?: string;
        lastActive?: string;
        sizeBytes?: number;
    } | null> {
        try {
            const record = await this.pb.collection('whatsapp_sessions').getFirstListItem(
                `user="${userId}"`,
                { $autoCancel: false }
            );

            return {
                phoneNumber: record.phone_number,
                lastActive: record.last_active,
                sizeBytes: record.size_bytes
            };
        } catch {
            return null;
        }
    }

    /**
     * Compress session data using gzip
     */
    private compress(data: string): Buffer {
        return gzipSync(Buffer.from(data, 'utf8'));
    }

    /**
     * Decompress session data
     */
    private decompress(data: Buffer): string {
        return gunzipSync(data).toString('utf8');
    }

    /**
     * Save session to file cache (synchronous)
     */
    private saveToCacheSync(userId: string, data: string): void {
        try {
            const cachePath = path.join(this.cacheDir, `${userId}.json`);
            fs.writeFileSync(cachePath, data, 'utf8');
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to save to cache:', error);
        }
    }

    /**
     * Load session from file cache (synchronous)
     */
    private loadFromCacheSync(userId: string): string | null {
        try {
            const cachePath = path.join(this.cacheDir, `${userId}.json`);
            if (fs.existsSync(cachePath)) {
                return fs.readFileSync(cachePath, 'utf8');
            }
            return null;
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to load from cache:', error);
            return null;
        }
    }

    /**
     * Check if cache exists (synchronous)
     */
    private hasCacheSync(userId: string): boolean {
        try {
            const cachePath = path.join(this.cacheDir, `${userId}.json`);
            return fs.existsSync(cachePath);
        } catch {
            return false;
        }
    }

    /**
     * Delete from cache (synchronous)
     */
    private deleteFromCacheSync(userId: string): void {
        try {
            const cachePath = path.join(this.cacheDir, `${userId}.json`);
            if (fs.existsSync(cachePath)) {
                fs.unlinkSync(cachePath);
            }
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to delete from cache:', error);
        }
    }

    /**
     * Cleanup old sessions (run periodically)
     * Deletes sessions inactive for more than 30 days
     */
    async cleanupOldSessions(daysInactive = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

            const oldSessions = await this.pb.collection('whatsapp_sessions').getFullList({
                filter: `last_active < "${cutoffDate.toISOString()}"`,
                $autoCancel: false
            });

            let deletedCount = 0;
            for (const session of oldSessions) {
                try {
                    await this.pb.collection('whatsapp_sessions').delete(session.id, {
                        $autoCancel: false
                    });
                    this.deleteFromCacheSync(session.user);
                    deletedCount++;
                } catch (error) {
                    console.error(`[DatabaseSessionStore] Failed to delete session ${session.id}:`, error);
                }
            }

            if (deletedCount > 0) {
                console.log(`[DatabaseSessionStore] Cleaned up ${deletedCount} inactive sessions`);
            }

            return deletedCount;
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to cleanup old sessions:', error);
            return 0;
        }
    }

    /**
     * Get total storage usage
     */
    async getStorageStats(): Promise<{
        totalSessions: number;
        totalSizeBytes: number;
        averageSizeBytes: number;
    }> {
        try {
            const sessions = await this.pb.collection('whatsapp_sessions').getFullList({
                fields: 'size_bytes',
                $autoCancel: false
            });

            const totalSizeBytes = sessions.reduce((sum, s) => sum + (s.size_bytes || 0), 0);

            return {
                totalSessions: sessions.length,
                totalSizeBytes,
                averageSizeBytes: sessions.length > 0 ? totalSizeBytes / sessions.length : 0
            };
        } catch (error) {
            console.error('[DatabaseSessionStore] Failed to get storage stats:', error);
            return {
                totalSessions: 0,
                totalSizeBytes: 0,
                averageSizeBytes: 0
            };
        }
    }
}
