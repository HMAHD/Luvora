/**
 * Subscription Sync Script
 *
 * Syncs Lemon Squeezy subscriptions/orders with PocketBase users.
 * Run manually to fix tier drift after refunds, disputes, or webhook failures.
 *
 * Usage: bun run src/scripts/sync-subs.ts
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

// Tier constants matching types.ts
const TIER = {
    FREE: 0,
    HERO: 1,
    LEGEND: 2,
} as const;

// Product variant IDs from environment
const HERO_VARIANT_ID = process.env.LEMONSQUEEZY_HERO_VARIANT_ID;
const LEGEND_VARIANT_ID = process.env.LEMONSQUEEZY_LEGEND_VARIANT_ID;

interface LemonSqueezyOrder {
    id: string;
    attributes: {
        status: string;
        user_email: string;
        first_order_item: {
            variant_id: number;
        };
        created_at: string;
        refunded: boolean;
    };
}

async function syncSubscriptions() {
    console.log('═══════════════════════════════════════════════');
    console.log('  Luvora Subscription Sync Tool');
    console.log('═══════════════════════════════════════════════');
    console.log('');

    if (!LS_API_KEY) {
        console.error('❌ Missing LEMONSQUEEZY_API_KEY environment variable');
        process.exit(1);
    }

    const pb = new PocketBase(PB_URL);

    try {
        await pb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );
        console.log('✓ Connected to PocketBase');
    } catch (err) {
        console.error('❌ Failed to authenticate with PocketBase:', err);
        process.exit(1);
    }

    // Stats
    let totalOrders = 0;
    let fixedUsers = 0;
    let notFoundUsers = 0;
    let alreadyCorrect = 0;
    let refundedOrders = 0;

    try {
        // Fetch paid orders from Lemon Squeezy
        console.log('\n📥 Fetching orders from Lemon Squeezy...');

        let nextPageUrl: string | null = 'https://api.lemonsqueezy.com/v1/orders?filter[status]=paid';

        while (nextPageUrl) {
            const response = await fetch(nextPageUrl, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': `Bearer ${LS_API_KEY}`
                }
            });

            const body = await response.json() as {
                data?: LemonSqueezyOrder[];
                links?: { next?: string };
                errors?: unknown[];
            };

            if (body.errors) {
                console.error('❌ Lemon Squeezy API Error:', body.errors);
                break;
            }

            for (const order of (body.data || []) as LemonSqueezyOrder[]) {
                totalOrders++;
                const email = order.attributes.user_email;
                const variantId = order.attributes.first_order_item?.variant_id?.toString();
                const isRefunded = order.attributes.refunded;

                if (isRefunded) {
                    refundedOrders++;
                    console.log(`  ↩️  ${email} - Order refunded, skipping`);
                    continue;
                }

                // Determine tier from variant ID
                let targetTier: number = TIER.HERO; // Default to Hero
                if (variantId === LEGEND_VARIANT_ID) {
                    targetTier = TIER.LEGEND;
                } else if (variantId === HERO_VARIANT_ID) {
                    targetTier = TIER.HERO;
                }

                // Find user in PocketBase
                try {
                    const user = await pb.collection('users').getFirstListItem(`email="${email}"`);
                    const currentTier = user.tier ?? TIER.FREE;

                    if (currentTier < targetTier) {
                        // User's tier is lower than what they paid for - fix it
                        await pb.collection('users').update(user.id, {
                            tier: targetTier
                        });

                        // Log the audit
                        try {
                            await pb.collection('tier_audit_logs').create({
                                user_id: user.id,
                                previous_tier: currentTier,
                                new_tier: targetTier,
                                reason: 'sync_script',
                                changed_by: 'system',
                                metadata: JSON.stringify({
                                    order_id: order.id,
                                    variant_id: variantId
                                })
                            });
                        } catch {
                            // Audit collection might not exist yet
                        }

                        fixedUsers++;
                        console.log(`  ✅ ${email}: ${currentTier} → ${targetTier} (fixed)`);
                    } else {
                        alreadyCorrect++;
                        console.log(`  ✓  ${email}: tier ${currentTier} (correct)`);
                    }
                } catch {
                    notFoundUsers++;
                    console.log(`  ⚠️  ${email}: User not found in database`);
                }
            }

            nextPageUrl = body.links?.next || null;
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════');
        console.log('  Sync Complete');
        console.log('═══════════════════════════════════════════════');
        console.log(`  Total orders processed: ${totalOrders}`);
        console.log(`  Users fixed:            ${fixedUsers}`);
        console.log(`  Already correct:        ${alreadyCorrect}`);
        console.log(`  Refunded (skipped):     ${refundedOrders}`);
        console.log(`  Users not found:        ${notFoundUsers}`);
        console.log('');

    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

syncSubscriptions();
