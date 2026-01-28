'use server';

/**
 * Creates a Lemon Squeezy Checkout Session.
 * Documentation: https://docs.lemonsqueezy.com/api/checkouts#create-a-checkout
 *
 * Supports tier-specific checkout:
 * - 'hero': Hero tier ($4.99 one-time)
 * - 'legend': Legend tier ($14.99 one-time)
 */
export async function createCheckoutSession(
    userId: string,
    userEmail: string,
    tier: 'hero' | 'legend' = 'hero'
) {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    // Get the correct variant ID based on tier
    const variantId = tier === 'legend'
        ? process.env.LEMONSQUEEZY_LEGEND_VARIANT_ID || process.env.LEMONSQUEEZY_VARIANT_ID
        : process.env.LEMONSQUEEZY_HERO_VARIANT_ID || process.env.LEMONSQUEEZY_VARIANT_ID;

    if (!storeId || !variantId || !apiKey) {
        console.error("Missing Lemon Squeezy env variables");
        return null;
    }

    try {
        const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            email: userEmail,
                            custom: {
                                user_id: userId,
                                tier: tier // Pass tier to webhook for proper upgrade
                            }
                        }
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: storeId
                            }
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: variantId
                            }
                        }
                    }
                }
            })
        });

        const data = await res.json();
        console.log(`Lemon Checkout Response (${tier}):`, data);
        return data?.data?.attributes?.url || null;

    } catch (error) {
        console.error("Failed to create checkout:", error);
        return null;
    }
}
