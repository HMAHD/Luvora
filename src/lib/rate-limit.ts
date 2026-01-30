/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for API endpoints.
 * For serverless/distributed deployments, consider using @upstash/ratelimit with Redis.
 *
 * Usage:
 *   const limiter = createRateLimiter({ interval: 60000, maxRequests: 10 });
 *   const result = await limiter.check(identifier);
 *   if (!result.success) return new Response('Too Many Requests', { status: 429 });
 */

interface RateLimitConfig {
    /** Time window in milliseconds */
    interval: number;
    /** Maximum requests allowed in the interval */
    maxRequests: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (note: resets on serverless cold starts)
const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Creates a rate limiter with the specified configuration.
 */
export function createRateLimiter(config: RateLimitConfig) {
    const storeKey = `${config.interval}-${config.maxRequests}`;

    if (!stores.has(storeKey)) {
        stores.set(storeKey, new Map());
    }

    const store = stores.get(storeKey)!;

    // Cleanup old entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt < now) {
                store.delete(key);
            }
        }
    }, config.interval);

    return {
        /**
         * Check if the identifier is within rate limits.
         * @param identifier - Unique identifier (e.g., IP address, user ID)
         */
        check(identifier: string): RateLimitResult {
            const now = Date.now();
            const entry = store.get(identifier);

            if (!entry || entry.resetAt < now) {
                // New window
                store.set(identifier, {
                    count: 1,
                    resetAt: now + config.interval,
                });
                return {
                    success: true,
                    remaining: config.maxRequests - 1,
                    resetAt: now + config.interval,
                };
            }

            if (entry.count >= config.maxRequests) {
                // Rate limited
                return {
                    success: false,
                    remaining: 0,
                    resetAt: entry.resetAt,
                };
            }

            // Increment counter
            entry.count++;
            return {
                success: true,
                remaining: config.maxRequests - entry.count,
                resetAt: entry.resetAt,
            };
        },

        /**
         * Reset the rate limit for an identifier.
         */
        reset(identifier: string): void {
            store.delete(identifier);
        },
    };
}

// Pre-configured limiters for common use cases

/** General API rate limiter: 100 requests per minute */
export const apiLimiter = createRateLimiter({
    interval: 60 * 1000,
    maxRequests: 100,
});

/** Auth rate limiter: 5 attempts per 15 minutes */
export const authLimiter = createRateLimiter({
    interval: 15 * 60 * 1000,
    maxRequests: 5,
});

/** OTP rate limiter: 3 requests per 15 minutes */
export const otpLimiter = createRateLimiter({
    interval: 15 * 60 * 1000,
    maxRequests: 3,
});

/** Webhook rate limiter: 1000 requests per minute (high volume) */
export const webhookLimiter = createRateLimiter({
    interval: 60 * 1000,
    maxRequests: 1000,
});

/**
 * Helper to get client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIP(request: Request): string {
    const headers = request.headers;

    // Vercel
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    // Cloudflare
    const cfConnectingIP = headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    // Standard
    const realIP = headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback
    return 'unknown';
}

/**
 * Rate limit middleware helper for API routes.
 * Returns a Response if rate limited, or null if allowed.
 */
export function checkRateLimit(
    request: Request,
    limiter = apiLimiter
): Response | null {
    const ip = getClientIP(request);
    const result = limiter.check(ip);

    if (!result.success) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

        return new Response(
            JSON.stringify({
                error: 'Too Many Requests',
                retryAfter,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': result.resetAt.toString(),
                },
            }
        );
    }

    return null;
}
