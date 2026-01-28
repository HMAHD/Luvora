import { NextResponse } from 'next/server';
import crypto from 'crypto';
import PocketBase from 'pocketbase';

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
        const customData = payload.data.attributes.first_order_item?.order_item_name ?
            payload.meta.custom_data : // Webhook structure varies, relies on meta usually
            payload.meta.custom_data || payload.data.attributes.checkout_data?.custom;

        // Lemon Squeezy Webhook Payload Structure: 
        // meta: { event_name: 'order_created', custom_data: { user_id: '...' } }

        // Verify event type
        if (eventName === 'order_created' || eventName === 'order_paid') {
            const userId = payload.meta.custom_data?.user_id;

            if (userId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
                await adminPb.admins.authWithPassword(
                    process.env.POCKETBASE_ADMIN_EMAIL || '',
                    process.env.POCKETBASE_ADMIN_PASSWORD || ''
                );

                // 5. Idempotency Check
                try {
                    const user = await adminPb.collection('users').getOne(userId);

                    if (user.is_premium) {
                        console.log(`User ${userId} already premium. Skipping.`);
                        return NextResponse.json({ message: 'Idempotent success' });
                    }

                    // 6. Update
                    await adminPb.collection('users').update(userId, {
                        is_premium: true,
                        tier: 'hero'
                    });
                    console.log(`User ${userId} upgraded to Premium.`);

                } catch (err: unknown) { // Changed 'any' to 'unknown'
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
