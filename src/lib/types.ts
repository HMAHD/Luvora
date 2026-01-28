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
