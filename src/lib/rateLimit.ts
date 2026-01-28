import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export function rateLimit(options?: RateLimitOptions) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    });

    return {
        check: (limit: number, token: string) => {
            const tokenCount = (tokenCache.get(token) as number[]) || [0];
            if (tokenCount[0] === 0) {
                tokenCache.set(token, [1]);
            } else {
                tokenCount[0] += 1;
                tokenCache.set(token, tokenCount);
            }
            const currentUsage = tokenCount[0];
            const isRateLimited = currentUsage > limit;

            return {
                isRateLimited,
                currentUsage,
                remaining: isRateLimited ? 0 : limit - currentUsage,
            };
        },
    };
}

// Singleton instance for OTP limiting (3 requests per 15 mins)
export const otpLimiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 15 * 60 * 1000, // 15 minutes
});
