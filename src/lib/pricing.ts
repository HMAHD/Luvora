/**
 * Centralized Pricing Configuration
 *
 * This file contains the pricing configuration for all tiers.
 * Prices here should match the Lemon Squeezy product prices.
 *
 * IMPORTANT: When changing prices:
 * 1. Update values here
 * 2. Update Lemon Squeezy product prices manually at https://app.lemonsqueezy.com
 */

// Default pricing (can be overridden by PocketBase settings)
export const DEFAULT_PRICING = {
    hero: {
        price: 4.99,
        originalPrice: 9.99,
        perDay: '< 2¢',
        name: 'Hero',
        description: 'The Daily Romantic',
    },
    legend: {
        price: 19.99,
        originalPrice: 39.99,
        perDay: '< 6¢',
        name: 'Legend',
        description: 'The Soulmate Experience',
    },
} as const;

export type PricingTier = 'hero' | 'legend';

export interface TierPricing {
    price: number;
    originalPrice: number;
    perDay: string;
    name: string;
    description: string;
}

export interface PricingConfig {
    hero: TierPricing;
    legend: TierPricing;
    lastUpdated?: string;
}

// Storage key for local caching
const PRICING_STORAGE_KEY = 'luvora_pricing';

/**
 * Get cached pricing from localStorage
 */
export function getCachedPricing(): PricingConfig | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(PRICING_STORAGE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}

/**
 * Cache pricing to localStorage
 */
export function cachePricing(pricing: PricingConfig): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing));
    } catch {
        // Ignore storage errors
    }
}

/**
 * Calculate per-day cost string
 */
export function calculatePerDay(price: number, years: number = 1): string {
    const days = years * 365;
    const perDay = price / days;

    if (perDay < 0.01) {
        return '< 1¢';
    } else if (perDay < 0.10) {
        return `< ${Math.ceil(perDay * 100)}¢`;
    } else {
        return `$${perDay.toFixed(2)}`;
    }
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(original: number, current: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
}

/**
 * Get the pricing config - returns default or cached
 */
export function getPricing(): PricingConfig {
    const cached = getCachedPricing();
    return cached || DEFAULT_PRICING;
}
