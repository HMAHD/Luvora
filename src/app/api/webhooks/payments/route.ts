import { NextResponse } from 'next/server';
import crypto from 'crypto';
import PocketBase from 'pocketbase';

// Tier constants (0=Free, 1=Hero, 2=Legend)
const TIER = {
    FREE: 0,
    HERO: 1,
    LEGEND: 2,
} as const;

export async function POST(request: Request) {
    try {
        // 1. Raw Body Reading (Text) for Signature Verification
        const rawBody = await request.text();

        // 2. Signature Verification
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
        const signature = request.headers.get('X-Signature');

        if (!secret || !signature) {
            return NextResponse.json({ error: 'Missing secret/signature' }, { status: 400 });
        }

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. Parse JSON after verification
        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;

        // Lemon Squeezy Webhook Payload Structure:
        // meta: { event_name: 'order_created', custom_data: { user_id: '...', tier: 'hero' | 'legend' } }

        // Verify event type
        if (eventName === 'order_created' || eventName === 'order_paid') {
            const customData = payload.meta.custom_data ||
                payload.data.attributes.checkout_data?.custom || {};
            const userId = customData.user_id;
            const purchasedTier = customData.tier || 'hero'; // Default to hero if not specified

            if (userId) {
                const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
                await adminPb.admins.authWithPassword(
                    process.env.POCKETBASE_ADMIN_EMAIL || '',
                    process.env.POCKETBASE_ADMIN_PASSWORD || ''
                );

                // Map tier string to numeric value
                const newTier = purchasedTier === 'legend' ? TIER.LEGEND : TIER.HERO;

                try {
                    const user = await adminPb.collection('users').getOne(userId);
                    const currentTier = user.tier ?? TIER.FREE;

                    // Idempotency: Only upgrade if new tier is higher
                    if (currentTier >= newTier) {
                        console.log(`User ${userId} already has tier ${currentTier}. Skipping.`);
                        return NextResponse.json({ message: 'Idempotent success' });
                    }

                    // Update user tier
                    await adminPb.collection('users').update(userId, {
                        tier: newTier
                    });
                    console.log(`User ${userId} upgraded to tier ${newTier} (${purchasedTier}).`);

                } catch (err: unknown) {
                    console.error("User lookup failed:", err);
                    return NextResponse.json({ error: 'User not found' }, { status: 404 });
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: unknown) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
