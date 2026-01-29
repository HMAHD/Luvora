import pool from './data/pool.json';
import type { LoveLanguage, EmotionalTone, MessageRarity } from './types';

type Role = 'masculine' | 'feminine' | 'neutral';

// Extended message type with Phase 8 fields
type MessageObj = {
    content: string;
    target: string;
    love_language?: string;
    rarity?: string;
};

type Message = {
    content: string;
    tone: EmotionalTone;
    love_language?: LoveLanguage;
    rarity?: MessageRarity;
};

export type DailySpark = {
    date: string;
    nickname: string;
    morning: Message;
    night: Message;
    isSpecialOccasion?: 'anniversary' | 'birthday' | 'milestone';
};

// Rarity weights - higher rarity = lower chance of appearing
const RARITY_WEIGHTS: Record<string, number> = {
    common: 100,
    rare: 30,
    epic: 10,
    legendary: 3,
};

/**
 * FNV-1a Hash implementation (32-bit)
 */
function fnv1a(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

/**
 * Deterministically selects an item from an array based on a seed.
 */
function selectIndex(count: number, seed: string): number {
    if (count === 0) return 0;
    const hash = fnv1a(seed);
    return hash % count;
}

/**
 * Available emotional tones
 */
const TONES: EmotionalTone[] = ['poetic', 'playful', 'romantic', 'passionate', 'sweet', 'supportive'];

/**
 * Selects a deterministic tone based on the seed and optional preferred tone.
 */
function selectTone(seed: string, preferredTone?: EmotionalTone): EmotionalTone {
    // If user has a preferred tone, use it 70% of the time
    if (preferredTone) {
        const hash = fnv1a(seed + '-prefer');
        if (hash % 100 < 70) {
            return preferredTone;
        }
    }
    const index = selectIndex(TONES.length, seed);
    return TONES[index];
}

/**
 * Filters the message pool based on the user's selected role.
 * Includes neutral messages + role-specific messages.
 */
function filterByRole(messages: MessageObj[], role: Role): MessageObj[] {
    return messages.filter(m => m.target === 'neutral' || m.target === role);
}

/**
 * Filters messages by love language preference.
 * If no preference, returns all messages.
 * If preference set, prioritizes matching messages but includes others for variety.
 */
function filterByLoveLanguage(messages: MessageObj[], loveLanguage?: LoveLanguage, seed?: string): MessageObj[] {
    if (!loveLanguage) return messages;

    const matching = messages.filter(m => m.love_language === loveLanguage);
    const others = messages.filter(m => m.love_language !== loveLanguage);

    // 80% chance to get love language specific message if available
    if (matching.length > 0 && seed) {
        const hash = fnv1a(seed + '-ll');
        if (hash % 100 < 80) {
            return matching;
        }
    }

    return matching.length > 0 ? [...matching, ...others] : messages;
}

/**
 * Applies rarity weighting to message selection.
 * Creates a weighted pool where common messages appear more frequently.
 */
function applyRarityWeighting(messages: MessageObj[], seed: string): MessageObj {
    if (messages.length === 0) {
        return { content: 'You are loved.', target: 'neutral' };
    }

    // Build weighted pool
    const weightedPool: MessageObj[] = [];
    for (const msg of messages) {
        const weight = RARITY_WEIGHTS[msg.rarity || 'common'] || RARITY_WEIGHTS.common;
        for (let i = 0; i < weight; i++) {
            weightedPool.push(msg);
        }
    }

    const index = selectIndex(weightedPool.length, seed);
    return weightedPool[index];
}

/**
 * Checks if a date is a special occasion for the user.
 */
function checkSpecialOccasion(
    date: Date,
    anniversaryDate?: string,
    partnerBirthday?: string
): 'anniversary' | 'birthday' | undefined {
    const dateStr = date.toISOString().split('T')[0];
    const monthDay = dateStr.slice(5); // MM-DD

    if (anniversaryDate) {
        const annivMonthDay = anniversaryDate.slice(5);
        if (monthDay === annivMonthDay) return 'anniversary';
    }

    if (partnerBirthday) {
        const bdayMonthDay = partnerBirthday.slice(5);
        if (monthDay === bdayMonthDay) return 'birthday';
    }

    return undefined;
}

/**
 * Gets special occasion messages from the pool.
 */
function getSpecialOccasionMessages(occasion: 'anniversary' | 'birthday' | 'milestone'): MessageObj[] {
    const specialPool = (pool.messages as Record<string, unknown>).special_occasions as Record<string, MessageObj[]> | undefined;
    if (!specialPool || !specialPool[occasion]) return [];
    return specialPool[occasion];
}

/**
 * Gets love language specific messages from the pool.
 */
function getLoveLanguageMessages(loveLanguage: LoveLanguage): MessageObj[] {
    const llPool = (pool.messages as Record<string, unknown>).love_language_specific as Record<string, MessageObj[]> | undefined;
    if (!llPool || !llPool[loveLanguage]) return [];
    return llPool[loveLanguage];
}

/**
 * Generates the deterministic Daily Spark for a given date.
 * @param date Optional date object.
 * @param role The recipient's role (defaults to 'neutral').
 */
export function getDailySpark(date: Date = new Date(), role: Role = 'neutral'): DailySpark {
    const dateStr = date.toISOString().split('T')[0];

    // 1. Select Nickname
    const nickIndex = selectIndex(pool.nicknames.length, `${dateStr}-nick`);
    const nickname = pool.nicknames[nickIndex];

    // 2. Select Tones (using TONES instead of old vibes)
    const morningTone = selectTone(`${dateStr}-morning-tone`);
    const nightTone = selectTone(`${dateStr}-night-tone`);

    // 3. Filter & Select Messages
    const morningPool = pool.messages.morning as Record<string, MessageObj[]>;
    const nightPool = pool.messages.night as Record<string, MessageObj[]>;

    // Get messages for selected tone, fallback to 'poetic' if tone doesn't exist
    const rawMorning = morningPool[morningTone] || morningPool['poetic'] || [];
    const rawNight = nightPool[nightTone] || nightPool['poetic'] || [];

    const morningFiltered = filterByRole(rawMorning, role);
    const nightFiltered = filterByRole(rawNight, role);

    // Apply rarity weighting
    const morningMsg = applyRarityWeighting(morningFiltered, `${dateStr}-${role}-morning-msg`);
    const nightMsg = applyRarityWeighting(nightFiltered, `${dateStr}-${role}-night-msg`);

    return {
        date: dateStr,
        nickname,
        morning: {
            content: morningMsg.content,
            tone: morningTone,
            love_language: morningMsg.love_language as LoveLanguage | undefined,
            rarity: morningMsg.rarity as MessageRarity | undefined,
        },
        night: {
            content: nightMsg.content,
            tone: nightTone,
            love_language: nightMsg.love_language as LoveLanguage | undefined,
            rarity: nightMsg.rarity as MessageRarity | undefined,
        },
    };
}

export type LegendSparkOptions = {
    userId: string;
    role: Role;
    loveLanguage?: LoveLanguage;
    preferredTone?: EmotionalTone;
    anniversaryDate?: string;
    partnerBirthday?: string;
};

/**
 * Generates a Legend Tier Premium Unique Spark.
 * Features:
 * - Love language personalization
 * - Preferred emotional tone
 * - Special occasion detection (anniversary/birthday)
 * - Rarity-weighted selection
 * - SHA-256 for high entropy distribution
 */
export async function getLegendSpark(date: Date, options: LegendSparkOptions): Promise<DailySpark> {
    const dateStr = date.toISOString().split('T')[0];
    const { userId, role, loveLanguage, preferredTone, anniversaryDate, partnerBirthday } = options;
    const seed = `${userId}-${dateStr}-${role}`;

    // Check for special occasions
    const specialOccasion = checkSpecialOccasion(date, anniversaryDate, partnerBirthday);

    // Calculate spin using SHA-256
    let spin = 0;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(seed);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        spin = (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
    } else {
        spin = fnv1a(seed);
    }

    const safeSpin = Math.abs(spin);

    // 1. Nickname (Standard pool, unique spin)
    const nickname = pool.nicknames[safeSpin % pool.nicknames.length];

    // 2. Tones (with preference)
    const morningTone = selectTone(`${seed}-mT`, preferredTone);
    const nightTone = selectTone(`${seed}-nT`, preferredTone);

    let morningContent: MessageObj;
    let nightContent: MessageObj;

    // 3. Special Occasion Override
    if (specialOccasion) {
        const specialMessages = getSpecialOccasionMessages(specialOccasion);
        const filtered = filterByRole(specialMessages, role);

        if (filtered.length > 0) {
            morningContent = filtered[safeSpin % filtered.length];
            nightContent = filtered[(safeSpin + 1) % filtered.length];

            return {
                date: dateStr,
                nickname,
                morning: {
                    content: morningContent.content,
                    tone: morningTone,
                    love_language: morningContent.love_language as LoveLanguage | undefined,
                    rarity: morningContent.rarity as MessageRarity | undefined,
                },
                night: {
                    content: nightContent.content,
                    tone: nightTone,
                    love_language: nightContent.love_language as LoveLanguage | undefined,
                    rarity: nightContent.rarity as MessageRarity | undefined,
                },
                isSpecialOccasion: specialOccasion,
            };
        }
    }

    // 4. Love Language Specific Messages (25% chance if love language set)
    if (loveLanguage && fnv1a(`${seed}-ll-check`) % 100 < 25) {
        const llMessages = getLoveLanguageMessages(loveLanguage);
        const filtered = filterByRole(llMessages, role);

        if (filtered.length >= 2) {
            morningContent = applyRarityWeighting(filtered, `${seed}-ll-morning`);
            nightContent = applyRarityWeighting(filtered, `${seed}-ll-night`);

            return {
                date: dateStr,
                nickname,
                morning: {
                    content: morningContent.content,
                    tone: morningTone,
                    love_language: loveLanguage,
                    rarity: morningContent.rarity as MessageRarity | undefined,
                },
                night: {
                    content: nightContent.content,
                    tone: nightTone,
                    love_language: loveLanguage,
                    rarity: nightContent.rarity as MessageRarity | undefined,
                },
            };
        }
    }

    // 5. Premium Pool with Love Language and Tone Filtering
    const premiumMsgs = (pool.messages as Record<string, unknown>).premium as MessageObj[] || [];
    let morningPool = filterByRole(premiumMsgs, role);
    let nightPool = [...morningPool];

    // Apply love language filtering
    morningPool = filterByLoveLanguage(morningPool, loveLanguage, `${seed}-morning`);
    nightPool = filterByLoveLanguage(nightPool, loveLanguage, `${seed}-night`);

    if (morningPool.length > 0 && nightPool.length > 0) {
        morningContent = applyRarityWeighting(morningPool, `${seed}-m-msg`);
        nightContent = applyRarityWeighting(nightPool, `${seed}-n-msg`);
    } else {
        // Fallback to standard tone-based pool
        const morningTonePool = (pool.messages.morning as Record<string, MessageObj[]>)[morningTone] || [];
        const nightTonePool = (pool.messages.night as Record<string, MessageObj[]>)[nightTone] || [];

        let mFiltered = filterByRole(morningTonePool, role);
        let nFiltered = filterByRole(nightTonePool, role);

        mFiltered = filterByLoveLanguage(mFiltered, loveLanguage, `${seed}-fb-morning`);
        nFiltered = filterByLoveLanguage(nFiltered, loveLanguage, `${seed}-fb-night`);

        morningContent = applyRarityWeighting(mFiltered, `${seed}-fb-m`);
        nightContent = applyRarityWeighting(nFiltered, `${seed}-fb-n`);
    }

    return {
        date: dateStr,
        nickname,
        morning: {
            content: morningContent.content,
            tone: morningTone,
            love_language: morningContent.love_language as LoveLanguage | undefined,
            rarity: morningContent.rarity as MessageRarity | undefined,
        },
        night: {
            content: nightContent.content,
            tone: nightTone,
            love_language: nightContent.love_language as LoveLanguage | undefined,
            rarity: nightContent.rarity as MessageRarity | undefined,
        },
    };
}

/**
 * Legacy Premium Spark function for backward compatibility.
 * Wraps getLegendSpark with minimal options.
 */
export async function getPremiumSpark(date: Date, userId: string, role: Role): Promise<DailySpark> {
    return getLegendSpark(date, { userId, role });
}

/**
 * Counts days until a special occasion.
 */
export function getDaysUntilOccasion(targetDate: string, fromDate: Date = new Date()): number {
    const [year, month, day] = targetDate.split('-').map(Number);
    const currentYear = fromDate.getFullYear();

    // Try this year first
    let target = new Date(currentYear, month - 1, day);

    // If the date has passed this year, use next year
    if (target < fromDate) {
        target = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = target.getTime() - fromDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets the rarity display info (color, label).
 */
export function getRarityInfo(rarity?: MessageRarity): { color: string; label: string; glow: string } {
    switch (rarity) {
        case 'legendary':
            return { color: 'text-amber-400', label: 'Legendary', glow: 'shadow-amber-400/50' };
        case 'epic':
            return { color: 'text-purple-400', label: 'Epic', glow: 'shadow-purple-400/50' };
        case 'rare':
            return { color: 'text-blue-400', label: 'Rare', glow: 'shadow-blue-400/50' };
        default:
            return { color: 'text-gray-400', label: 'Common', glow: '' };
    }
}
