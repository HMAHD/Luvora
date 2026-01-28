'use server';

/**
 * Creates a Lemon Squeezy Checkout Session.
 * Documentation: https://docs.lemonsqueezy.com/api/checkouts#create-a-checkout
 */
export async function createCheckoutSession(userId: string, userEmail: string) {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

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
                                user_id: userId // CRITICAL: Mapping back to PB User
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
        console.log("Lemon Checkout Response:", data);
        return data?.data?.attributes?.url || null;

    } catch (error) {
        console.error("Failed to create checkout:", error);
        return null;
    }
}
