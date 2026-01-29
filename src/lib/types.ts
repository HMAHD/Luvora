/**
 * PocketBase Types
 */

// Tier Constants
export const TIER = {
    FREE: 0,      // "The Voyager"
    HERO: 1,      // "The Daily Romantic"
    LEGEND: 2,    // "The Soulmate"
} as const;

export type TierLevel = typeof TIER[keyof typeof TIER];

// Tier display names
export const TIER_NAMES: Record<TierLevel, string> = {
    [TIER.FREE]: 'Voyager',
    [TIER.HERO]: 'Hero',
    [TIER.LEGEND]: 'Legend',
};

// Love Language Types (Phase 8)
export const LOVE_LANGUAGES = {
    WORDS: 'words_of_affirmation',
    ACTS: 'acts_of_service',
    GIFTS: 'receiving_gifts',
    TIME: 'quality_time',
    TOUCH: 'physical_touch',
} as const;

export type LoveLanguage = typeof LOVE_LANGUAGES[keyof typeof LOVE_LANGUAGES];

export const LOVE_LANGUAGE_NAMES: Record<LoveLanguage, string> = {
    [LOVE_LANGUAGES.WORDS]: 'Words of Affirmation',
    [LOVE_LANGUAGES.ACTS]: 'Acts of Service',
    [LOVE_LANGUAGES.GIFTS]: 'Receiving Gifts',
    [LOVE_LANGUAGES.TIME]: 'Quality Time',
    [LOVE_LANGUAGES.TOUCH]: 'Physical Touch',
};

// Emotional Tone Types (Phase 8)
export const EMOTIONAL_TONES = {
    POETIC: 'poetic',
    PLAYFUL: 'playful',
    ROMANTIC: 'romantic',
    PASSIONATE: 'passionate',
    SWEET: 'sweet',
    SUPPORTIVE: 'supportive',
} as const;

export type EmotionalTone = typeof EMOTIONAL_TONES[keyof typeof EMOTIONAL_TONES];

export const EMOTIONAL_TONE_NAMES: Record<EmotionalTone, string> = {
    [EMOTIONAL_TONES.POETIC]: 'Poetic',
    [EMOTIONAL_TONES.PLAYFUL]: 'Playful',
    [EMOTIONAL_TONES.ROMANTIC]: 'Romantic',
    [EMOTIONAL_TONES.PASSIONATE]: 'Passionate',
    [EMOTIONAL_TONES.SWEET]: 'Sweet',
    [EMOTIONAL_TONES.SUPPORTIVE]: 'Supportive',
};

// Message Rarity Types (Phase 8)
export const MESSAGE_RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
} as const;

export type MessageRarity = typeof MESSAGE_RARITY[keyof typeof MESSAGE_RARITY];

export interface User {
    id: string;
    email: string;
    partner_name?: string;
    recipient_role?: 'masculine' | 'feminine' | 'neutral';
    // Automation Fields
    timezone?: string;
    morning_time?: string; // "08:00"
    messaging_platform?: 'whatsapp' | 'telegram';
    messaging_id?: string;
    streak?: number;
    last_sent_date?: string; // YYYY-MM-DD
    // Tier System (0=Free, 1=Hero, 2=Legend)
    tier: TierLevel;

    // Phase 8: Legend Tier Enhancements
    love_language?: LoveLanguage;
    preferred_tone?: EmotionalTone;
    anniversary_date?: string; // YYYY-MM-DD
    partner_birthday?: string; // YYYY-MM-DD
    relationship_start?: string; // YYYY-MM-DD
    linked_partner_id?: string; // Partner's user ID for two-way mode

    created: string;
    updated: string;
}

export interface MessageStats {
    id: string;
    date: string;
    copy_count: number;
    share_count: number;
    updated: string;
}
