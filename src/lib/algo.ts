import pool from './data/pool.json';

type Vibe = 'poetic' | 'playful' | 'minimal';
type Role = 'masculine' | 'feminine' | 'neutral';
type MessageObj = { content: string; target: string };
type Message = { content: string; vibe: Vibe };

export type DailySpark = {
    date: string;
    nickname: string;
    morning: Message;
    night: Message;
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
 * Selects a deterministic vibe based on the seed.
 */
function selectVibe(seed: string): Vibe {
    const vibes: Vibe[] = ['poetic', 'playful', 'minimal'];
    const index = selectIndex(vibes.length, seed);
    return vibes[index];
}

/**
 * Filters the message pool based on the user's selected role.
 * Includes neutral messages + role-specific messages.
 */
function filterPool(messages: MessageObj[], role: Role): MessageObj[] {
    return messages.filter(m => m.target === 'neutral' || m.target === role);
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

    // 2. Select Vibes
    const morningVibe = selectVibe(`${dateStr}-morning-vibe`);
    const nightVibe = selectVibe(`${dateStr}-night-vibe`);

    // 3. Filter & Select Messages
    // Safety: If the filtered pool is empty (unlikely with neutral), we'd need a fallback. 
    // Given our data, neutral always exists.

    const rawMorning = pool.messages.morning[morningVibe as keyof typeof pool.messages.morning] as MessageObj[];
    const rawNight = pool.messages.night[nightVibe as keyof typeof pool.messages.night] as MessageObj[];

    const morningFiltered = filterPool(rawMorning, role);
    const nightFiltered = filterPool(rawNight, role);

    const morningIndex = selectIndex(morningFiltered.length, `${dateStr}-morning-msg`);
    const nightIndex = selectIndex(nightFiltered.length, `${dateStr}-night-msg`);

    return {
        date: dateStr,
        nickname,
        morning: { content: morningFiltered[morningIndex].content, vibe: morningVibe },
        night: { content: nightFiltered[nightIndex].content, vibe: nightVibe },
    };
}

/**
 * Generates a Premium Unique Spark.
 * Seed = UserID + Date.
 * Uses SHA-256 for high entropy distribution.
 */
export async function getPremiumSpark(date: Date, userId: string, role: Role): Promise<DailySpark> {
    const dateStr = date.toISOString().split('T')[0];
    const seed = `${userId}-${dateStr}`;

    // Check environment for crypto
    let spin = 0;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(seed);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // Take first 4 bytes as integer
        spin = (hashArray[0] << 24) | (hashArray[1] << 16) | (hashArray[2] << 8) | hashArray[3];
    } else {
        // Fallback or Node env (though Bun supports subtle)
        // Simple string hash fallback if async is annoying, but we made this async.
        spin = fnv1a(seed);
    }

    // Abs for index
    const safeSpin = Math.abs(spin);

    // 1. Nickname (Standard pool, unique spin)
    const nickname = pool.nicknames[safeSpin % pool.nicknames.length];

    // 2. Vibes (Standard)
    const morningVibe = selectVibe(`${seed}-mV`);
    const nightVibe = selectVibe(`${seed}-nV`);

    // 3. Premium Filter
    // Try to get from Premium pool first
    let premiumMsgs = (pool.messages as any).premium as MessageObj[] || [];
    let targetedPremium = filterPool(premiumMsgs, role);

    let morningContent = "";
    let nightContent = "";

    // Fallback Logic: If premium pool empty/exhausted for role, use standard pool with UNIQUE seed
    if (targetedPremium.length > 0) {
        morningContent = targetedPremium[safeSpin % targetedPremium.length].content;
        // Shift spin for night
        nightContent = targetedPremium[(safeSpin + 1) % targetedPremium.length].content;
    } else {
        // Fallback to standard but unique index
        const rawMorning = pool.messages.morning[morningVibe as keyof typeof pool.messages.morning] as MessageObj[];
        const rawNight = pool.messages.night[nightVibe as keyof typeof pool.messages.night] as MessageObj[];

        const mFiltered = filterPool(rawMorning, role);
        const nFiltered = filterPool(rawNight, role);

        morningContent = mFiltered[safeSpin % mFiltered.length].content;
        nightContent = nFiltered[(safeSpin + 1) % nFiltered.length].content;
    }

    return {
        date: dateStr,
        nickname,
        morning: { content: morningContent, vibe: morningVibe },
        night: { content: nightContent, vibe: nightVibe }
    };
}
