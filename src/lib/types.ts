/**
 * PocketBase Types
 */

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
    is_premium?: boolean;
    tier?: 'free' | 'hero' | 'legend';
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
