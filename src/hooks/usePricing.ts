'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import {
    DEFAULT_PRICING,
    getCachedPricing,
    cachePricing,
    type PricingConfig,
} from '@/lib/pricing';

/**
 * Hook to fetch and use centralized pricing configuration
 */
export function usePricing() {
    const [pricing, setPricing] = useState<PricingConfig>(() => {
        // Try to get cached pricing first for immediate display
        return getCachedPricing() || DEFAULT_PRICING;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                // Try to fetch from PocketBase settings
                const settings = await pb.collection('settings').getFirstListItem('key = "pricing"');
                if (settings?.value) {
                    const pricingData = typeof settings.value === 'string'
                        ? JSON.parse(settings.value)
                        : settings.value;
                    setPricing(pricingData);
                    cachePricing(pricingData);
                }
            } catch {
                // Settings collection or pricing not found - use defaults/cached
                console.log('Using default/cached pricing');
            } finally {
                setLoading(false);
            }
        };

        fetchPricing();
    }, []);

    return { pricing, loading };
}
