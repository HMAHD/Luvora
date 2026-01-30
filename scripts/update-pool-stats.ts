#!/usr/bin/env bun
/**
 * Pool Stats Generator
 * Automatically counts messages in pool.json and updates POOL_STATS.md
 *
 * Usage: bun run scripts/update-pool-stats.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const POOL_PATH = join(__dirname, '../src/lib/data/pool.json');
const STATS_PATH = join(__dirname, '../src/lib/data/POOL_STATS.md');

interface MessageObj {
    content: string;
    target?: string;
    tier?: number;
    rarity?: string;
    love_language?: string;
}

interface PoolData {
    nicknames: string[];
    messages: {
        morning: Record<string, MessageObj[]>;
        night: Record<string, MessageObj[]>;
        premium: MessageObj[];
        special_occasions: Record<string, MessageObj[]>;
        love_language_specific: Record<string, MessageObj[]>;
        quick_replies: Record<string, MessageObj[]>;
        midday: Record<string, MessageObj[]>;
    };
}

function countMessages(arr: MessageObj[] | undefined): number {
    return arr?.length || 0;
}

function countByTier(messages: MessageObj[], tier: number): number {
    return messages.filter(m => (m.tier ?? 0) === tier).length;
}

function countByTarget(messages: MessageObj[], target: string): number {
    return messages.filter(m => m.target === target).length;
}

function countByRarity(messages: MessageObj[], rarity: string): number {
    return messages.filter(m => (m.rarity || 'common') === rarity).length;
}

function getStatus(current: number, target: number): string {
    const percent = Math.round((current / target) * 100);
    if (percent >= 100) return `✅ ${percent}%`;
    if (percent >= 70) return `🟡 ${percent}%`;
    return `🔴 ${percent}%`;
}

function generateStats(): void {
    console.log('Reading pool.json...');
    const poolRaw = readFileSync(POOL_PATH, 'utf-8');
    const pool: PoolData = JSON.parse(poolRaw);

    // Collect all messages for aggregate stats
    const allMessages: MessageObj[] = [];

    // Count morning messages
    const morningCounts: Record<string, number> = {};
    let morningTotal = 0;
    for (const [tone, messages] of Object.entries(pool.messages.morning || {})) {
        morningCounts[tone] = messages.length;
        morningTotal += messages.length;
        allMessages.push(...messages);
    }

    // Count night messages
    const nightCounts: Record<string, number> = {};
    let nightTotal = 0;
    for (const [tone, messages] of Object.entries(pool.messages.night || {})) {
        nightCounts[tone] = messages.length;
        nightTotal += messages.length;
        allMessages.push(...messages);
    }

    // Count midday messages
    const middayCounts: Record<string, number> = {};
    let middayTotal = 0;
    for (const [type, messages] of Object.entries(pool.messages.midday || {})) {
        middayCounts[type] = messages.length;
        middayTotal += messages.length;
        allMessages.push(...messages);
    }

    // Count premium
    const premiumCount = countMessages(pool.messages.premium);
    allMessages.push(...(pool.messages.premium || []));

    // Count special occasions
    const occasionCounts: Record<string, number> = {};
    let occasionTotal = 0;
    for (const [occasion, messages] of Object.entries(pool.messages.special_occasions || {})) {
        occasionCounts[occasion] = messages.length;
        occasionTotal += messages.length;
        allMessages.push(...messages);
    }

    // Count love language
    const loveLangCounts: Record<string, number> = {};
    let loveLangTotal = 0;
    for (const [lang, messages] of Object.entries(pool.messages.love_language_specific || {})) {
        loveLangCounts[lang] = messages.length;
        loveLangTotal += messages.length;
        allMessages.push(...messages);
    }

    // Count quick replies
    const quickReplyCounts: Record<string, number> = {};
    let quickReplyTotal = 0;
    for (const [type, messages] of Object.entries(pool.messages.quick_replies || {})) {
        quickReplyCounts[type] = messages.length;
        quickReplyTotal += messages.length;
        allMessages.push(...messages);
    }

    // Aggregate stats
    const totalMessages = allMessages.length;
    const nicknameCount = pool.nicknames.length;

    // Tier counts
    const tier0 = countByTier(allMessages, 0);
    const tier1 = countByTier(allMessages, 1);
    const tier2 = countByTier(allMessages, 2);

    // Target counts
    const neutralCount = countByTarget(allMessages, 'neutral');
    const feminineCount = countByTarget(allMessages, 'feminine');
    const masculineCount = countByTarget(allMessages, 'masculine');

    // Rarity counts
    const commonCount = countByRarity(allMessages, 'common');
    const rareCount = countByRarity(allMessages, 'rare');
    const epicCount = countByRarity(allMessages, 'epic');
    const legendaryCount = countByRarity(allMessages, 'legendary');

    const today = new Date().toISOString().split('T')[0];

    // Generate markdown
    const markdown = `# Message Pool Statistics

> Auto-generated stats for content tracking. Run \`bun run scripts/update-pool-stats.ts\` to update.

**Last Updated:** ${today}

---

## Overall Summary

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Total Messages** | ${totalMessages} | 1,500+ | ${getStatus(totalMessages, 1500)} |
| **Nicknames** | ${nicknameCount} | 100+ | ${getStatus(nicknameCount, 100)} |

---

## By Time Period

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Morning - Poetic | ${morningCounts['poetic'] || 0} | 50+ | ${getStatus(morningCounts['poetic'] || 0, 50)} |
| Morning - Playful | ${morningCounts['playful'] || 0} | 50+ | ${getStatus(morningCounts['playful'] || 0, 50)} |
| Morning - Romantic | ${morningCounts['romantic'] || 0} | 50+ | ${getStatus(morningCounts['romantic'] || 0, 50)} |
| Morning - Passionate | ${morningCounts['passionate'] || 0} | 50+ | ${getStatus(morningCounts['passionate'] || 0, 50)} |
| Morning - Sweet | ${morningCounts['sweet'] || 0} | 50+ | ${getStatus(morningCounts['sweet'] || 0, 50)} |
| Morning - Supportive | ${morningCounts['supportive'] || 0} | 50+ | ${getStatus(morningCounts['supportive'] || 0, 50)} |
| **Morning Total** | **${morningTotal}** | **300+** | ${getStatus(morningTotal, 300)} |
| Night - Poetic | ${nightCounts['poetic'] || 0} | 50+ | ${getStatus(nightCounts['poetic'] || 0, 50)} |
| Night - Playful | ${nightCounts['playful'] || 0} | 50+ | ${getStatus(nightCounts['playful'] || 0, 50)} |
| Night - Romantic | ${nightCounts['romantic'] || 0} | 50+ | ${getStatus(nightCounts['romantic'] || 0, 50)} |
| Night - Passionate | ${nightCounts['passionate'] || 0} | 50+ | ${getStatus(nightCounts['passionate'] || 0, 50)} |
| Night - Sweet | ${nightCounts['sweet'] || 0} | 50+ | ${getStatus(nightCounts['sweet'] || 0, 50)} |
| Night - Supportive | ${nightCounts['supportive'] || 0} | 50+ | ${getStatus(nightCounts['supportive'] || 0, 50)} |
| **Night Total** | **${nightTotal}** | **300+** | ${getStatus(nightTotal, 300)} |
| Midday - Check-in | ${middayCounts['check_in'] || 0} | 50+ | ${getStatus(middayCounts['check_in'] || 0, 50)} |
| Midday - Encouragement | ${middayCounts['encouragement'] || 0} | 50+ | ${getStatus(middayCounts['encouragement'] || 0, 50)} |
| **Midday Total** | **${middayTotal}** | **100+** | ${getStatus(middayTotal, 100)} |

---

## By Tier

| Tier | Current | Target | Status |
|------|---------|--------|--------|
| Free (tier: 0) | ${tier0} | 200+ | ${getStatus(tier0, 200)} |
| Hero (tier: 1) | ${tier1} | 300+ | ${getStatus(tier1, 300)} |
| Legend (tier: 2) | ${tier2} | 200+ | ${getStatus(tier2, 200)} |
| Premium Pool | ${premiumCount} | 100+ | ${getStatus(premiumCount, 100)} |

---

## Special Occasions

| Occasion | Current | Target | Status |
|----------|---------|--------|--------|
| Anniversary | ${occasionCounts['anniversary'] || 0} | 100+ | ${getStatus(occasionCounts['anniversary'] || 0, 100)} |
| Birthday | ${occasionCounts['birthday'] || 0} | 100+ | ${getStatus(occasionCounts['birthday'] || 0, 100)} |
| Valentine's | ${occasionCounts['valentines'] || 0} | 50+ | ${getStatus(occasionCounts['valentines'] || 0, 50)} |
| Holiday | ${occasionCounts['holiday'] || 0} | 50+ | ${getStatus(occasionCounts['holiday'] || 0, 50)} |
| **Total** | **${occasionTotal}** | **300+** | ${getStatus(occasionTotal, 300)} |

---

## Love Language Specific

| Love Language | Current | Target | Status |
|---------------|---------|--------|--------|
| Words of Affirmation | ${loveLangCounts['words_of_affirmation'] || 0} | 100+ | ${getStatus(loveLangCounts['words_of_affirmation'] || 0, 100)} |
| Acts of Service | ${loveLangCounts['acts_of_service'] || 0} | 100+ | ${getStatus(loveLangCounts['acts_of_service'] || 0, 100)} |
| Receiving Gifts | ${loveLangCounts['receiving_gifts'] || 0} | 100+ | ${getStatus(loveLangCounts['receiving_gifts'] || 0, 100)} |
| Quality Time | ${loveLangCounts['quality_time'] || 0} | 100+ | ${getStatus(loveLangCounts['quality_time'] || 0, 100)} |
| Physical Touch | ${loveLangCounts['physical_touch'] || 0} | 100+ | ${getStatus(loveLangCounts['physical_touch'] || 0, 100)} |
| **Total** | **${loveLangTotal}** | **500+** | ${getStatus(loveLangTotal, 500)} |

---

## Quick Replies

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Flirty | ${quickReplyCounts['flirty'] || 0} | 50+ | ${getStatus(quickReplyCounts['flirty'] || 0, 50)} |
| Grateful | ${quickReplyCounts['grateful'] || 0} | 50+ | ${getStatus(quickReplyCounts['grateful'] || 0, 50)} |
| Loving | ${quickReplyCounts['loving'] || 0} | 50+ | ${getStatus(quickReplyCounts['loving'] || 0, 50)} |
| Supportive | ${quickReplyCounts['supportive'] || 0} | 50+ | ${getStatus(quickReplyCounts['supportive'] || 0, 50)} |
| Playful | ${quickReplyCounts['playful'] || 0} | 50+ | ${getStatus(quickReplyCounts['playful'] || 0, 50)} |
| **Total** | **${quickReplyTotal}** | **250+** | ${getStatus(quickReplyTotal, 250)} |

---

## By Target (Recipient)

| Target | Current | Target | Status |
|--------|---------|--------|--------|
| Neutral | ${neutralCount} | 500+ | ${getStatus(neutralCount, 500)} |
| Feminine (Her) | ${feminineCount} | 300+ | ${getStatus(feminineCount, 300)} |
| Masculine (Him) | ${masculineCount} | 300+ | ${getStatus(masculineCount, 300)} |

---

## By Rarity Distribution

| Rarity | Count | Percentage | Ideal % |
|--------|-------|------------|---------|
| Common | ${commonCount} | ${Math.round((commonCount / totalMessages) * 100)}% | ~50% |
| Rare | ${rareCount} | ${Math.round((rareCount / totalMessages) * 100)}% | ~30% |
| Epic | ${epicCount} | ${Math.round((epicCount / totalMessages) * 100)}% | ~15% |
| Legendary | ${legendaryCount} | ${Math.round((legendaryCount / totalMessages) * 100)}% | ~5% |

---

## Priority Actions

${totalMessages < 1500 ? `1. 🔴 **Total Messages** - Need ${1500 - totalMessages} more messages` : ''}
${occasionTotal < 300 ? `2. 🔴 **Special Occasions** - Need ${300 - occasionTotal} more (anniversary, birthday, holidays)` : ''}
${loveLangTotal < 500 ? `3. 🔴 **Love Language** - Need ${500 - loveLangTotal} more (all 5 languages)` : ''}
${nightTotal < 300 ? `4. 🔴 **Night Messages** - Need ${300 - nightTotal} more across all tones` : ''}
${quickReplyTotal < 250 ? `5. 🔴 **Quick Replies** - Need ${250 - quickReplyTotal} more responses` : ''}
${feminineCount < 300 || masculineCount < 300 ? `6. 🟡 **Gender Variations** - Need more feminine (${300 - feminineCount}) and masculine (${300 - masculineCount}) messages` : ''}

---

## File Size Warning

- **Current pool.json size:** ${(poolRaw.length / 1024).toFixed(1)} KB
- **Recommended max:** 500 KB
- **Status:** ${poolRaw.length > 500 * 1024 ? '🔴 Consider migrating to PocketBase' : '✅ OK'}

> **Note:** For 1,500+ messages, consider migrating to PocketBase database for better performance. See \`docs/MIGRATION_GUIDE.md\`
`;

    writeFileSync(STATS_PATH, markdown);
    console.log(`✅ Stats updated: ${STATS_PATH}`);
    console.log(`📊 Total messages: ${totalMessages}`);
    console.log(`📁 File size: ${(poolRaw.length / 1024).toFixed(1)} KB`);
}

generateStats();
