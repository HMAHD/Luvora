'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { TIER, TIER_NAMES, type TierLevel } from '@/lib/types';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

/** Verify the caller is an authenticated admin user */
async function verifyAdmin(): Promise<string> {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('pb_auth');
    if (!authCookie?.value) throw new Error('Not authenticated');

    let cookieData;
    try {
        cookieData = JSON.parse(authCookie.value);
    } catch {
        cookieData = JSON.parse(decodeURIComponent(authCookie.value));
    }

    const pb = new PocketBase(PB_URL);
    pb.authStore.save(cookieData.token, cookieData.model);

    if (!pb.authStore.isValid || !pb.authStore.record) {
        throw new Error('Invalid session');
    }

    const email = pb.authStore.record.email;
    const isAdmin = pb.authStore.record.is_admin || ADMIN_EMAILS.includes(email);
    if (!isAdmin) throw new Error('Admin access required');

    return pb.authStore.record.id;
}

/** Sanitize a value for use in PocketBase filter strings */
function sanitizeFilterValue(value: string): string {
    return value.replace(/["\\\n\r]/g, '');
}

export interface UserSearchResult {
    id: string;
    email: string;
    name: string;
    tier: TierLevel;
}

/**
 * Search for a user by email (admin only).
 */
export async function searchUserByEmail(email: string): Promise<UserSearchResult | null> {
    try {
        await verifyAdmin();

        const adminPb = new PocketBase(PB_URL);
        await adminPb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        const sanitizedEmail = sanitizeFilterValue(email.trim());
        const user = await adminPb.collection('users').getFirstListItem(`email="${sanitizedEmail}"`);

        return {
            id: user.id,
            email: user.email,
            name: user.partner_name || user.name || 'Unknown',
            tier: (user.tier ?? TIER.FREE) as TierLevel,
        };
    } catch {
        return null;
    }
}

export type TierChangeReason =
    | 'purchase'
    | 'refund'
    | 'dispute'
    | 'admin_upgrade'
    | 'admin_downgrade'
    | 'sync_script'
    | 'promo_code'
    | 'gift'
    | 'system';

export interface TierAuditLog {
    id: string;
    user_id: string;
    previous_tier: TierLevel;
    new_tier: TierLevel;
    reason: TierChangeReason;
    changed_by: string;
    metadata?: string;
    created: string;
}

interface ChangeTierResult {
    success: boolean;
    error?: string;
    previousTier?: TierLevel;
    newTier?: TierLevel;
}

/**
 * Change a user's tier with audit logging.
 * Admin-only action.
 */
export async function changeUserTier(
    userId: string,
    newTier: TierLevel,
    reason: TierChangeReason,
    _adminId: string,
    metadata?: Record<string, unknown>
): Promise<ChangeTierResult> {
    try {
        const callerAdminId = await verifyAdmin();

        const adminPb = new PocketBase(PB_URL);
        await adminPb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        // Get current user state
        const user = await adminPb.collection('users').getOne(userId);
        const previousTier = (user.tier ?? TIER.FREE) as TierLevel;

        // Don't update if same tier
        if (previousTier === newTier) {
            return {
                success: true,
                previousTier,
                newTier,
            };
        }

        // Update user tier
        await adminPb.collection('users').update(userId, {
            tier: newTier,
        });

        // Create audit log
        try {
            await adminPb.collection('tier_audit_logs').create({
                user_id: userId,
                previous_tier: previousTier,
                new_tier: newTier,
                reason,
                changed_by: callerAdminId,
                metadata: metadata ? JSON.stringify(metadata) : null,
            });
        } catch (auditError) {
            // Log but don't fail - audit collection might not exist
            console.warn('Failed to create audit log:', auditError);
        }

        console.log(
            `[Tier Change] User ${userId}: ${TIER_NAMES[previousTier]} → ${TIER_NAMES[newTier]} (${reason} by ${adminId})`
        );

        return {
            success: true,
            previousTier,
            newTier,
        };
    } catch (error) {
        console.error('Failed to change user tier:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get tier audit logs for a user.
 */
export async function getUserTierHistory(userId: string): Promise<TierAuditLog[]> {
    try {
        await verifyAdmin();

        const adminPb = new PocketBase(PB_URL);
        await adminPb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        const sanitizedUserId = sanitizeFilterValue(userId);
        const logs = await adminPb.collection('tier_audit_logs').getFullList({
            filter: `user_id = "${sanitizedUserId}"`,
            sort: '-created',
        });

        return logs as unknown as TierAuditLog[];
    } catch {
        // Collection might not exist
        return [];
    }
}

/**
 * Get recent tier changes (for admin dashboard).
 */
export async function getRecentTierChanges(limit = 50): Promise<TierAuditLog[]> {
    try {
        await verifyAdmin();

        const adminPb = new PocketBase(PB_URL);
        await adminPb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        const logs = await adminPb.collection('tier_audit_logs').getList(1, limit, {
            sort: '-created',
        });

        return logs.items as unknown as TierAuditLog[];
    } catch {
        return [];
    }
}

/**
 * Batch upgrade users by email (e.g., for promo codes).
 */
export async function batchUpgradeUsers(
    emails: string[],
    targetTier: TierLevel,
    reason: TierChangeReason,
    _adminId: string
): Promise<{ upgraded: number; notFound: number; errors: string[] }> {
    await verifyAdmin();

    const adminPb = new PocketBase(PB_URL);
    await adminPb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || '',
        process.env.POCKETBASE_ADMIN_PASSWORD || ''
    );

    let upgraded = 0;
    let notFound = 0;
    const errors: string[] = [];

    for (const email of emails) {
        try {
            const sanitizedEmail = sanitizeFilterValue(email);
            const user = await adminPb.collection('users').getFirstListItem(`email="${sanitizedEmail}"`);
            const result = await changeUserTier(user.id, targetTier, reason, adminId);

            if (result.success) {
                upgraded++;
            } else {
                errors.push(`${email}: ${result.error}`);
            }
        } catch {
            notFound++;
        }
    }

    return { upgraded, notFound, errors };
}
