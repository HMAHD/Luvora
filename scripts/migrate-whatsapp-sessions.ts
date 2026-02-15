#!/usr/bin/env tsx
/**
 * Migration Script: File-based WhatsApp Sessions → Database
 *
 * Migrates existing WhatsApp sessions from file system to PocketBase database.
 * This should be run ONCE during the deployment of database-backed sessions.
 *
 * Usage:
 *   npx tsx scripts/migrate-whatsapp-sessions.ts
 *
 * What it does:
 * 1. Scans .whatsapp-sessions/ directory for existing sessions
 * 2. Archives each session directory (tar + gzip)
 * 3. Saves compressed archives to whatsapp_sessions collection
 * 4. Optionally deletes old file-based sessions after successful migration
 *
 * Safety:
 * - Dry-run mode by default (use --execute to actually migrate)
 * - Validates sessions before migration
 * - Creates backups before deletion
 * - Detailed logging of all operations
 */

import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';
import { SessionArchiver } from '../src/lib/messaging/session-archiver';
import { DatabaseSessionStore } from '../src/lib/messaging/database-session-store';

interface MigrationStats {
    totalSessions: number;
    successfulMigrations: number;
    failedMigrations: number;
    totalSizeBefore: number;
    totalSizeAfter: number;
    errors: Array<{ userId: string; error: string }>;
}

class WhatsAppSessionMigrator {
    private pb: PocketBase;
    private sessionStore: DatabaseSessionStore;
    private stats: MigrationStats;
    private dryRun: boolean;
    private deleteAfterMigration: boolean;

    constructor(options: { dryRun?: boolean; deleteAfterMigration?: boolean } = {}) {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
        this.pb = new PocketBase(pbUrl);
        this.sessionStore = new DatabaseSessionStore(pbUrl);
        this.dryRun = options.dryRun ?? true;
        this.deleteAfterMigration = options.deleteAfterMigration ?? false;

        this.stats = {
            totalSessions: 0,
            successfulMigrations: 0,
            failedMigrations: 0,
            totalSizeBefore: 0,
            totalSizeAfter: 0,
            errors: []
        };
    }

    /**
     * Run the migration
     */
    async migrate(): Promise<void> {
        console.log('\n=== WhatsApp Session Migration ===\n');
        console.log(`Mode: ${this.dryRun ? 'DRY RUN (no changes will be made)' : 'EXECUTE'}`);
        console.log(`Delete after migration: ${this.deleteAfterMigration ? 'YES' : 'NO'}\n`);

        // Find sessions directory
        const sessionsDir = path.join(process.cwd(), '.whatsapp-sessions');

        if (!fs.existsSync(sessionsDir)) {
            console.log('No .whatsapp-sessions directory found. Nothing to migrate.');
            return;
        }

        // Get list of user session directories
        const userDirs = fs.readdirSync(sessionsDir)
            .filter(file => {
                const fullPath = path.join(sessionsDir, file);
                return fs.statSync(fullPath).isDirectory();
            });

        this.stats.totalSessions = userDirs.length;

        if (userDirs.length === 0) {
            console.log('No user sessions found. Nothing to migrate.');
            return;
        }

        console.log(`Found ${userDirs.length} user session(s) to migrate\n`);

        // Migrate each session
        for (const userId of userDirs) {
            await this.migrateUserSession(userId, sessionsDir);
        }

        // Print summary
        this.printSummary();
    }

    /**
     * Migrate a single user's session
     */
    private async migrateUserSession(userId: string, sessionsDir: string): Promise<void> {
        const sessionPath = path.join(sessionsDir, userId);

        console.log(`\n[${userId}] Starting migration...`);

        try {
            // Validate session
            if (!SessionArchiver.hasValidSession(sessionPath)) {
                throw new Error('Invalid or incomplete session directory');
            }

            // Check if already migrated
            const existingSession = await this.sessionStore.hasSession(userId);
            if (existingSession && this.dryRun) {
                console.log(`[${userId}] ⚠️  Session already exists in database (skipping)`);
                return;
            }

            if (this.dryRun) {
                console.log(`[${userId}] ✓ Would archive and migrate session`);
                this.stats.successfulMigrations++;
                return;
            }

            // Archive session
            console.log(`[${userId}] Archiving session...`);
            const archive = await SessionArchiver.archiveSession(sessionPath);

            this.stats.totalSizeBefore += archive.originalSizeBytes;
            this.stats.totalSizeAfter += archive.sizeBytes;

            console.log(`[${userId}] Size: ${(archive.originalSizeBytes / 1024 / 1024).toFixed(2)} MB → ${(archive.sizeBytes / 1024 / 1024).toFixed(2)} MB (${archive.compressionRatio}% reduction)`);

            // Save to database
            console.log(`[${userId}] Saving to database...`);
            await this.sessionStore.saveSession(
                userId,
                archive.tarballBase64,
                undefined,
                {
                    migratedAt: new Date().toISOString(),
                    migrationVersion: '1.0',
                    originalSize: archive.originalSizeBytes,
                    compressedSize: archive.sizeBytes
                }
            );

            console.log(`[${userId}] ✓ Migration successful`);
            this.stats.successfulMigrations++;

            // Delete original if requested
            if (this.deleteAfterMigration) {
                console.log(`[${userId}] Deleting original session...`);
                await SessionArchiver.cleanupSession(sessionPath);
                console.log(`[${userId}] ✓ Original session deleted`);
            }

        } catch (error) {
            console.error(`[${userId}] ✗ Migration failed:`, error);
            this.stats.failedMigrations++;
            this.stats.errors.push({
                userId,
                error: (error as Error).message
            });
        }
    }

    /**
     * Print migration summary
     */
    private printSummary(): void {
        console.log('\n=== Migration Summary ===\n');
        console.log(`Total sessions found: ${this.stats.totalSessions}`);
        console.log(`Successful migrations: ${this.stats.successfulMigrations}`);
        console.log(`Failed migrations: ${this.stats.failedMigrations}`);

        if (!this.dryRun) {
            console.log(`\nStorage savings:`);
            console.log(`  Before: ${(this.stats.totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  After: ${(this.stats.totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Saved: ${(((this.stats.totalSizeBefore - this.stats.totalSizeAfter) / this.stats.totalSizeBefore) * 100).toFixed(2)}%`);
        }

        if (this.stats.errors.length > 0) {
            console.log('\nErrors:');
            this.stats.errors.forEach(({ userId, error }) => {
                console.log(`  [${userId}]: ${error}`);
            });
        }

        if (this.dryRun) {
            console.log('\n⚠️  This was a DRY RUN. No changes were made.');
            console.log('To execute the migration, run with --execute flag:');
            console.log('  npx tsx scripts/migrate-whatsapp-sessions.ts --execute\n');
        } else {
            console.log('\n✓ Migration complete!\n');
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const execute = args.includes('--execute');
const deleteAfter = args.includes('--delete');

// Run migration
const migrator = new WhatsAppSessionMigrator({
    dryRun: !execute,
    deleteAfterMigration: deleteAfter
});

migrator.migrate()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n✗ Migration failed:', error);
        process.exit(1);
    });
