/**
 * PocketBase Types
 */

export interface User {
    id: string;
    email: string;
    partner_name?: string;
    recipient_role?: 'masculine' | 'feminine' | 'neutral';
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
