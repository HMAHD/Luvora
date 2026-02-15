/**
 * Simple rate limiter using token bucket algorithm
 *
 * Prevents hitting API rate limits for messaging platforms:
 * - Telegram: 30 messages/second per bot
 * - WhatsApp: ~1 message/second (conservative)
 * - Discord: 5 messages/5 seconds per channel
 */

interface RateLimiterConfig {
    /**
     * Maximum number of operations per window
     */
    maxOperations: number;

    /**
     * Time window in milliseconds
     */
    windowMs: number;

    /**
     * Platform name for logging
     */
    platform: string;
}

export class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillRate: number; // tokens per millisecond
    private readonly platform: string;
    private queue: Array<{
        resolve: () => void;
        reject: (error: Error) => void;
        addedAt: number;
    }> = [];
    private processing = false;

    constructor(config: RateLimiterConfig) {
        this.maxTokens = config.maxOperations;
        this.tokens = config.maxOperations;
        this.lastRefill = Date.now();
        this.refillRate = config.maxOperations / config.windowMs;
        this.platform = config.platform;
    }

    /**
     * Refill tokens based on elapsed time
     */
    private refillTokens(): void {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = elapsed * this.refillRate;

        this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    /**
     * Process queued operations
     */
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            this.refillTokens();

            if (this.tokens >= 1) {
                const item = this.queue.shift();
                if (item) {
                    this.tokens -= 1;
                    item.resolve();
                }
            } else {
                // Wait for tokens to refill
                const waitTime = (1 - this.tokens) / this.refillRate;
                await new Promise(resolve => setTimeout(resolve, Math.ceil(waitTime)));
            }
        }

        this.processing = false;
    }

    /**
     * Wait for rate limit clearance before proceeding
     *
     * @returns Promise that resolves when operation is allowed
     */
    async acquire(): Promise<void> {
        this.refillTokens();

        // If we have tokens available, proceed immediately
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return;
        }

        // Otherwise, queue and wait
        return new Promise((resolve, reject) => {
            this.queue.push({
                resolve,
                reject,
                addedAt: Date.now()
            });

            // Start processing queue
            this.processQueue();
        });
    }

    /**
     * Execute an operation with rate limiting
     *
     * @param operation The async operation to execute
     * @returns Result of the operation
     */
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        await this.acquire();
        return operation();
    }

    /**
     * Get current rate limiter status
     */
    getStatus(): {
        platform: string;
        availableTokens: number;
        maxTokens: number;
        queueLength: number;
        utilizationPercent: number;
    } {
        this.refillTokens();

        return {
            platform: this.platform,
            availableTokens: Math.floor(this.tokens),
            maxTokens: this.maxTokens,
            queueLength: this.queue.length,
            utilizationPercent: Math.round(((this.maxTokens - this.tokens) / this.maxTokens) * 100)
        };
    }

    /**
     * Clear the queue (useful for shutdown)
     */
    clearQueue(): void {
        const error = new Error(`Rate limiter for ${this.platform} is shutting down`);
        this.queue.forEach(item => item.reject(error));
        this.queue = [];
    }
}

/**
 * Pre-configured rate limiters for each platform
 */
export const createPlatformRateLimiters = () => ({
    telegram: new RateLimiter({
        maxOperations: 30,
        windowMs: 1000, // 30 messages per second
        platform: 'telegram'
    }),
    whatsapp: new RateLimiter({
        maxOperations: 1,
        windowMs: 1000, // 1 message per second (conservative)
        platform: 'whatsapp'
    }),
    discord: new RateLimiter({
        maxOperations: 5,
        windowMs: 5000, // 5 messages per 5 seconds
        platform: 'discord'
    })
});
