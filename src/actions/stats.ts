'use server';

import PocketBase from 'pocketbase';

/**
 * Atomically increments the copy count for the current date.
 * Uses a freshly instantiated Admin Client to bypass "update: locked" rules.
 */
export async function incrementGlobalStats() {
    const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

    // NOTE: Ideally, use an Admin email/pass or API Key from env. 
    // For sovereignty, we assume this runs in a trusted environment or we use a super-user/system account.
    // BUT: PocketBase JS SDK doesn't support "Admin API Key" direct usage as easily as Go.
    // We often need to auth as admin first.

    // If we can't auth as admin without creds, we might need to rely on the "Public Create" rule + Aggregation
    // OR the user logs in as a "System Bot" via env vars.

    // STARTUP SCRIPT PATTERN:
    // Since we don't have the admin password in the prompt context, I will create a
    // "System" client if possible, OR fallback to standard collection access if rules allow.
    // However, the prompt specifically asked for "updateRule locked".

    try {
        // Attempt Admin Auth (Mocked Structure - User needs to fill env)
        await adminPb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        const today = new Date().toISOString().split('T')[0];

        try {
            // 1. Try to find today's stats
            // We use a listing since getOne requires ID and we only have date
            const result = await adminPb.collection('message_stats').getFirstListItem(`date="${today}"`);

            // 2. Atomic Increment
            await adminPb.collection('message_stats').update(result.id, {
                "copy_count+": 1
            });

        } catch (e: unknown) {
            // 404 - Create new for today
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((e as any).status === 404) {
                await adminPb.collection('message_stats').create({
                    date: today,
                    copy_count: 1,
                    share_count: 0
                });
            } else {
                throw e;
            }
        }
    } catch (error) {
        console.error("Failed to increment stats:", error);
        // Fail silently to user, but log it.
    }
}
