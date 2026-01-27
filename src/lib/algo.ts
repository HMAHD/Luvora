import pool from './data/pool.json';

type Vibe = 'poetic' | 'playful' | 'minimal';
type Message = { content: string; vibe: Vibe };

export type DailySpark = {
    date: string;
    nickname: string;
    morning: Message;
    night: Message;
};

/**
 * FNV-1a Hash implementation (32-bit)
 * Returns a deterministic integer from a string input.
 */
function fnv1a(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
}

/**
 * Deterministically selects an item from an array based on a seed.
 */
function selectIndex(count: number, seed: string): number {
    const hash = fnv1a(seed);
    return hash % count;
}

/**
 * Selects a deterministic vibe based on the seed.
 */
function selectVibe(seed: string): Vibe {
    const vibes: Vibe[] = ['poetic', 'playful', 'minimal'];
    const index = selectIndex(vibes.length, seed);
    return vibes[index];
}

/**
 * Generates the deterministic Daily Spark for a given date.
 * @param date Optional date object (defaults to today).
 */
export function getDailySpark(date: Date = new Date()): DailySpark {
    // ISO Date string YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];

    // 1. Select Nickname
    const nickIndex = selectIndex(pool.nicknames.length, `${dateStr}-nick`);
    const nickname = pool.nicknames[nickIndex];

    // 2. Select Vibes (Morning & Night) - Hashed on date + phase
    const morningVibe = selectVibe(`${dateStr}-morning-vibe`);
    const nightVibe = selectVibe(`${dateStr}-night-vibe`);

    // 3. Select Messages - Hashed on date + phase + vibe
    const morningPool = pool.messages.morning[morningVibe];
    const nightPool = pool.messages.night[nightVibe];

    const morningIndex = selectIndex(morningPool.length, `${dateStr}-morning-msg`);
    const nightIndex = selectIndex(nightPool.length, `${dateStr}-night-msg`);

    return {
        date: dateStr,
        nickname,
        morning: { content: morningPool[morningIndex], vibe: morningVibe },
        night: { content: nightPool[nightIndex], vibe: nightVibe },
    };
}
