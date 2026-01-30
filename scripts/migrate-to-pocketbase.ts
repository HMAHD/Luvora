#!/usr/bin/env bun
/**
 * Pool.json to PocketBase Migration Script
 *
 * BEFORE RUNNING:
 * 1. Go to PocketBase Admin (_/)
 * 2. Open "messages" collection
 * 3. Add these fields if they don't exist:
 *
 *    - tier (Number) - Min: 0, Max: 2
 *    - occasion (Select) - Options: daily, anniversary, birthday, valentines, holiday
 *
 * 4. Make sure these fields exist (should already):
 *    - content (Text) - Required
 *    - target (Select) - Options: neutral, feminine, masculine
 *    - vibe (Select) - Options: poetic, playful, romantic, passionate, sweet, supportive
 *    - time_of_day (Select) - Options: morning, night, midday, anytime
 *    - rarity (Select) - Options: common, rare, epic, legendary
 *    - love_language (Select) - Options: words_of_affirmation, acts_of_service, receiving_gifts, quality_time, physical_touch
 *
 * USAGE:
 *    bun run scripts/migrate-to-pocketbase.ts
 *
 * OPTIONS:
 *    --dry-run    Show what would be imported without actually importing
 *    --clear      Clear existing messages before import (DANGEROUS!)
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || '';

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CLEAR_FIRST = args.includes('--clear');

// Rate limiting to avoid overwhelming PocketBase
const BATCH_SIZE = 50;
const DELAY_MS = 500;

interface PoolMessage {
    content: string;
    target?: string;
    tier?: number;
    rarity?: string;
    love_language?: string;
}

interface PocketBaseMessage {
    content: string;
    target: string;
    vibe: string;
    time_of_day: string;
    rarity: string;
    love_language: string;
    tier: number;
    occasion: string;
}

// Load pool.json
const POOL_PATH = join(__dirname, '../src/lib/data/pool.json');

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrate() {
    console.log('🚀 Starting PocketBase Migration');
    console.log(`📍 PocketBase URL: ${POCKETBASE_URL}`);
    console.log(`🔧 Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
    console.log('');

    // Read pool.json
    console.log('📖 Reading pool.json...');
    const poolRaw = readFileSync(POOL_PATH, 'utf-8');
    const pool = JSON.parse(poolRaw);

    // Collect all messages to import
    const toImport: PocketBaseMessage[] = [];

    // Process morning messages
    console.log('📝 Processing morning messages...');
    for (const [tone, messages] of Object.entries(pool.messages.morning || {})) {
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: tone,
                time_of_day: 'morning',
                rarity: msg.rarity || 'common',
                love_language: msg.love_language || '',
                tier: msg.tier ?? 0,
                occasion: 'daily'
            });
        }
    }

    // Process night messages
    console.log('📝 Processing night messages...');
    for (const [tone, messages] of Object.entries(pool.messages.night || {})) {
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: tone,
                time_of_day: 'night',
                rarity: msg.rarity || 'common',
                love_language: msg.love_language || '',
                tier: msg.tier ?? 0,
                occasion: 'daily'
            });
        }
    }

    // Process midday messages
    console.log('📝 Processing midday messages...');
    for (const [type, messages] of Object.entries(pool.messages.midday || {})) {
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: type === 'encouragement' ? 'supportive' : 'sweet',
                time_of_day: 'midday',
                rarity: msg.rarity || 'common',
                love_language: msg.love_language || '',
                tier: msg.tier ?? 0,
                occasion: 'daily'
            });
        }
    }

    // Process premium messages
    console.log('📝 Processing premium messages...');
    for (const msg of (pool.messages.premium || []) as PoolMessage[]) {
        toImport.push({
            content: msg.content,
            target: msg.target || 'neutral',
            vibe: 'poetic',
            time_of_day: 'anytime',
            rarity: msg.rarity || 'legendary',
            love_language: msg.love_language || '',
            tier: 2, // Premium = Legend tier
            occasion: 'daily'
        });
    }

    // Process special occasions
    console.log('📝 Processing special occasion messages...');
    for (const [occasion, messages] of Object.entries(pool.messages.special_occasions || {})) {
        const occasionMap: Record<string, string> = {
            'anniversary': 'anniversary',
            'birthday': 'birthday',
            'valentines': 'valentines',
            'holiday': 'holiday',
            'milestone': 'daily'
        };
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: 'romantic',
                time_of_day: 'anytime',
                rarity: msg.rarity || 'epic',
                love_language: msg.love_language || '',
                tier: msg.tier ?? 2,
                occasion: occasionMap[occasion] || 'daily'
            });
        }
    }

    // Process love language specific messages
    console.log('📝 Processing love language specific messages...');
    for (const [lang, messages] of Object.entries(pool.messages.love_language_specific || {})) {
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: 'romantic',
                time_of_day: 'anytime',
                rarity: msg.rarity || 'rare',
                love_language: lang,
                tier: msg.tier ?? 1,
                occasion: 'daily'
            });
        }
    }

    // Process quick replies
    console.log('📝 Processing quick replies...');
    const quickReplyVibeMap: Record<string, string> = {
        'flirty': 'playful',
        'grateful': 'sweet',
        'loving': 'romantic',
        'supportive': 'supportive',
        'playful': 'playful'
    };
    for (const [type, messages] of Object.entries(pool.messages.quick_replies || {})) {
        for (const msg of messages as PoolMessage[]) {
            toImport.push({
                content: msg.content,
                target: msg.target || 'neutral',
                vibe: quickReplyVibeMap[type] || 'sweet',
                time_of_day: 'anytime',
                rarity: msg.rarity || 'common',
                love_language: '',
                tier: msg.tier ?? 0,
                occasion: 'daily'
            });
        }
    }

    console.log('');
    console.log(`📊 Total messages to import: ${toImport.length}`);
    console.log('');

    // Show breakdown
    const byTimeOfDay: Record<string, number> = {};
    const byTier: Record<number, number> = {};
    const byOccasion: Record<string, number> = {};

    for (const msg of toImport) {
        byTimeOfDay[msg.time_of_day] = (byTimeOfDay[msg.time_of_day] || 0) + 1;
        byTier[msg.tier] = (byTier[msg.tier] || 0) + 1;
        byOccasion[msg.occasion] = (byOccasion[msg.occasion] || 0) + 1;
    }

    console.log('📈 Breakdown by Time of Day:');
    for (const [key, count] of Object.entries(byTimeOfDay)) {
        console.log(`   ${key}: ${count}`);
    }

    console.log('');
    console.log('📈 Breakdown by Tier:');
    for (const [key, count] of Object.entries(byTier)) {
        const tierName = key === '0' ? 'Free' : key === '1' ? 'Hero' : 'Legend';
        console.log(`   ${tierName} (${key}): ${count}`);
    }

    console.log('');
    console.log('📈 Breakdown by Occasion:');
    for (const [key, count] of Object.entries(byOccasion)) {
        console.log(`   ${key}: ${count}`);
    }

    if (DRY_RUN) {
        console.log('');
        console.log('✅ Dry run complete. No changes made.');
        console.log('   Run without --dry-run to actually import.');
        return;
    }

    // Actual import
    console.log('');
    console.log('🔐 Authenticating with PocketBase...');

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('❌ Error: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD env vars required');
        console.error('   Set them in .env.local or export them');
        process.exit(1);
    }

    const pb = new PocketBase(POCKETBASE_URL);
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated');

    // Clear existing if requested
    if (CLEAR_FIRST) {
        console.log('');
        console.log('⚠️  Clearing existing messages...');
        const existing = await pb.collection('messages').getFullList();
        console.log(`   Found ${existing.length} existing messages`);

        for (const msg of existing) {
            await pb.collection('messages').delete(msg.id);
        }
        console.log('✅ Cleared');
    }

    // Import in batches
    console.log('');
    console.log('📤 Importing messages...');

    let imported = 0;
    let errors = 0;
    const duplicates: string[] = [];

    for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
        const batch = toImport.slice(i, i + BATCH_SIZE);

        for (const msg of batch) {
            try {
                // Check for duplicate content
                const existing = await pb.collection('messages').getList(1, 1, {
                    filter: `content = "${msg.content.replace(/"/g, '\\"')}"`
                });

                if (existing.totalItems > 0) {
                    duplicates.push(msg.content.substring(0, 50) + '...');
                    continue;
                }

                await pb.collection('messages').create(msg);
                imported++;
            } catch (err) {
                errors++;
                console.error(`   ❌ Failed: ${msg.content.substring(0, 50)}...`);
                console.error(`      ${err}`);
            }
        }

        const progress = Math.min(100, Math.round(((i + batch.length) / toImport.length) * 100));
        console.log(`   Progress: ${progress}% (${imported} imported, ${errors} errors, ${duplicates.length} duplicates)`);

        if (i + BATCH_SIZE < toImport.length) {
            await sleep(DELAY_MS);
        }
    }

    console.log('');
    console.log('🎉 Migration Complete!');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped (duplicates): ${duplicates.length}`);
    console.log(`   ❌ Errors: ${errors}`);

    if (duplicates.length > 0 && duplicates.length <= 10) {
        console.log('');
        console.log('📋 Duplicate messages skipped:');
        for (const dup of duplicates) {
            console.log(`   - ${dup}`);
        }
    }
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
