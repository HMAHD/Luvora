
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

async function syncSubscriptions() {
    console.log('--- Starting Subscription Sync ---');

    if (!LS_API_KEY) {
        console.error('Missing LEMONSQUEEZY_API_KEY');
        return;
    }

    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || '',
        process.env.POCKETBASE_ADMIN_PASSWORD || ''
    );

    // Fetch active subscriptions from Lemon Squeezy
    // Docs: https://docs.lemonsqueezy.com/api/subscriptions#list-all-subscriptions
    try {
        let nextPageUrl = 'https://api.lemonsqueezy.com/v1/subscriptions?filter[status]=active';
        while (nextPageUrl) {
            const res = await fetch(nextPageUrl, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': `Bearer ${LS_API_KEY}`
                }
            });
            const body = await res.json();

            if (body.errors) {
                console.error('LS API Error:', body.errors);
                break;
            }

            for (const sub of body.data) {
                const customData = sub.attributes.urls.update_payment_method; // LS doesn't always expose custom_data in sub list easily without include
                // Better approach: filter by Order first or rely on email match if custom_data missing.
                const userEmail = sub.attributes.user_email;

                // Find User in PB by Email
                try {
                    const user = await pb.collection('users').getFirstListItem(`email="${userEmail}"`);
                    if (!user.is_premium) {
                        console.log(`Fixing drift for ${userEmail} -> Setting Premium`);
                        await pb.collection('users').update(user.id, {
                            is_premium: true,
                            tier: 'hero'
                        });
                    }
                } catch (e) {
                    console.log(`User ${userEmail} not found in DB.`);
                }
            }

            nextPageUrl = body.links?.next || null;
        }
        console.log('--- Sync Complete ---');

    } catch (err) {
        console.error('Sync failed:', err);
    }
}

syncSubscriptions();
