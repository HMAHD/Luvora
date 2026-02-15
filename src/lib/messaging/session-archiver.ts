/**
 * Session Archiver for WhatsApp Web.js
 *
 * Handles archiving and restoring WhatsApp session directories to/from database.
 * Uses tar + gzip compression to reduce session size from 150MB to ~5-10MB.
 *
 * Flow:
 * 1. After authentication: Archive session directory → compress → save to database
 * 2. On startup: Load from database → decompress → extract to /tmp
 * 3. Active session runs from /tmp (fast local access)
 * 4. Database provides persistence across deployments
 */

import fs from 'fs';
import path from 'path';
import { gzipSync, gunzipSync } from 'zlib';
import { execSync } from 'child_process';

export interface SessionArchive {
    tarballBase64: string;
    sizeBytes: number;
    originalSizeBytes: number;
    compressionRatio: number;
}

export class SessionArchiver {
    /**
     * Archive a session directory to compressed tarball
     */
    static async archiveSession(sessionPath: string): Promise<SessionArchive> {
        try {
            if (!fs.existsSync(sessionPath)) {
                throw new Error(`Session path does not exist: ${sessionPath}`);
            }

            // Get original size
            const originalSize = this.getDirectorySize(sessionPath);

            // Create tarball in /tmp
            const tarballPath = path.join('/tmp', `whatsapp-session-${Date.now()}.tar`);

            try {
                // Use tar to create archive (much faster than Node.js recursive copy)
                // -C changes to parent directory, so we can tar just the session folder
                const sessionDir = path.basename(sessionPath);
                const parentDir = path.dirname(sessionPath);

                execSync(`tar -cf "${tarballPath}" -C "${parentDir}" "${sessionDir}"`, {
                    stdio: 'pipe'
                });

                // Read tarball and compress with gzip
                const tarball = fs.readFileSync(tarballPath);
                const compressed = gzipSync(tarball, { level: 9 }); // Maximum compression

                // Convert to base64 for storage
                const tarballBase64 = compressed.toString('base64');
                const sizeBytes = Buffer.byteLength(tarballBase64, 'utf8');

                // Clean up temporary tarball
                fs.unlinkSync(tarballPath);

                const compressionRatio = ((1 - (sizeBytes / originalSize)) * 100).toFixed(2);

                console.log(`[SessionArchiver] Archived session:`);
                console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`  Compressed: ${(sizeBytes / 1024 / 1024).toFixed(2)} MB`);
                console.log(`  Compression: ${compressionRatio}%`);

                return {
                    tarballBase64,
                    sizeBytes,
                    originalSizeBytes: originalSize,
                    compressionRatio: parseFloat(compressionRatio)
                };

            } catch (error) {
                // Clean up on error
                if (fs.existsSync(tarballPath)) {
                    fs.unlinkSync(tarballPath);
                }
                throw error;
            }

        } catch (error) {
            console.error('[SessionArchiver] Failed to archive session:', error);
            throw new Error(`Failed to archive session: ${(error as Error).message}`);
        }
    }

    /**
     * Restore a session from compressed tarball
     */
    static async restoreSession(tarballBase64: string, targetPath: string): Promise<void> {
        try {
            // Ensure target parent directory exists
            const parentDir = path.dirname(targetPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }

            // Delete existing session if it exists
            if (fs.existsSync(targetPath)) {
                console.log(`[SessionArchiver] Removing existing session at ${targetPath}`);
                fs.rmSync(targetPath, { recursive: true, force: true });
            }

            // Decode and decompress
            const compressed = Buffer.from(tarballBase64, 'base64');
            const tarball = gunzipSync(compressed);

            // Write tarball to temporary file
            const tarballPath = path.join('/tmp', `whatsapp-restore-${Date.now()}.tar`);
            fs.writeFileSync(tarballPath, tarball);

            try {
                // Extract tarball to parent directory
                // This will create the session directory with the correct name
                execSync(`tar -xf "${tarballPath}" -C "${parentDir}"`, {
                    stdio: 'pipe'
                });

                // Clean up temporary tarball
                fs.unlinkSync(tarballPath);

                console.log(`[SessionArchiver] Restored session to ${targetPath}`);
                console.log(`  Size: ${(compressed.length / 1024 / 1024).toFixed(2)} MB (compressed)`);

            } catch (error) {
                // Clean up on error
                if (fs.existsSync(tarballPath)) {
                    fs.unlinkSync(tarballPath);
                }
                throw error;
            }

        } catch (error) {
            console.error('[SessionArchiver] Failed to restore session:', error);
            throw new Error(`Failed to restore session: ${(error as Error).message}`);
        }
    }

    /**
     * Check if session directory exists and is valid
     */
    static hasValidSession(sessionPath: string): boolean {
        try {
            if (!fs.existsSync(sessionPath)) {
                return false;
            }

            // Check for essential WhatsApp Web.js session files
            // The structure can be either:
            // 1. Direct: sessionPath/Default/IndexedDB
            // 2. Nested: sessionPath/session/Default/IndexedDB
            const possiblePaths = [
                [path.join(sessionPath, 'Default'), path.join(sessionPath, 'Default', 'IndexedDB')],
                [path.join(sessionPath, 'session', 'Default'), path.join(sessionPath, 'session', 'Default', 'IndexedDB')]
            ];

            // Check if any of the possible structures exist
            return possiblePaths.some(paths => paths.every(p => fs.existsSync(p)));
        } catch {
            return false;
        }
    }

    /**
     * Get directory size in bytes (recursive)
     */
    private static getDirectorySize(dirPath: string): number {
        try {
            // Use du command for fast directory size calculation
            const output = execSync(`du -sb "${dirPath}" | cut -f1`, {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            return parseInt(output.trim(), 10);
        } catch (error) {
            console.warn('[SessionArchiver] Failed to get directory size with du, falling back to Node.js');
            // Fallback to Node.js method
            return this.getDirectorySizeRecursive(dirPath);
        }
    }

    /**
     * Get directory size recursively (fallback method)
     */
    private static getDirectorySizeRecursive(dirPath: string): number {
        let size = 0;

        try {
            const files = fs.readdirSync(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);

                if (stats.isDirectory()) {
                    size += this.getDirectorySizeRecursive(filePath);
                } else {
                    size += stats.size;
                }
            }
        } catch (error) {
            console.error(`[SessionArchiver] Error calculating directory size:`, error);
        }

        return size;
    }

    /**
     * Clean up old session directory
     */
    static async cleanupSession(sessionPath: string): Promise<void> {
        try {
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log(`[SessionArchiver] Cleaned up session directory: ${sessionPath}`);
            }
        } catch (error) {
            console.error('[SessionArchiver] Failed to cleanup session:', error);
        }
    }
}
