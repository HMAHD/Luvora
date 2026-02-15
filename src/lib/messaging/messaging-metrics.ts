/**
 * Messaging Metrics Tracker
 *
 * Tracks key metrics for messaging service:
 * - Messages sent/failed per platform
 * - Active channels per platform
 * - Message delivery latency
 * - Error rates
 *
 * Metrics are stored in memory and can be exported for analytics/monitoring
 */

import type { MessagingPlatform } from './types';

interface PlatformMetrics {
    messagesSent: number;
    messagesFailed: number;
    channelsActive: number;
    channelsTotal: number;
    totalLatencyMs: number;
    messageCount: number; // For average latency calculation
    errors: Map<string, number>; // error type -> count
}

interface MetricsSummary {
    platform: MessagingPlatform;
    messagesSent: number;
    messagesFailed: number;
    successRate: number;
    channelsActive: number;
    channelsTotal: number;
    averageLatencyMs: number;
    topErrors: Array<{ error: string; count: number }>;
}

export class MessagingMetrics {
    private metrics: Map<MessagingPlatform, PlatformMetrics> = new Map();
    private startTime: number = Date.now();

    constructor() {
        // Initialize metrics for all platforms
        const platforms: MessagingPlatform[] = ['telegram', 'whatsapp', 'discord'];
        platforms.forEach(platform => {
            this.metrics.set(platform, {
                messagesSent: 0,
                messagesFailed: 0,
                channelsActive: 0,
                channelsTotal: 0,
                totalLatencyMs: 0,
                messageCount: 0,
                errors: new Map()
            });
        });
    }

    /**
     * Track a successful message send
     */
    trackMessageSent(platform: MessagingPlatform, latencyMs?: number): void {
        const metrics = this.getOrCreateMetrics(platform);
        metrics.messagesSent++;

        if (latencyMs !== undefined) {
            metrics.totalLatencyMs += latencyMs;
            metrics.messageCount++;
        }
    }

    /**
     * Track a failed message send
     */
    trackMessageFailed(platform: MessagingPlatform, errorType: string): void {
        const metrics = this.getOrCreateMetrics(platform);
        metrics.messagesFailed++;

        // Track error types
        const currentCount = metrics.errors.get(errorType) || 0;
        metrics.errors.set(errorType, currentCount + 1);
    }

    /**
     * Update channel counts
     */
    updateChannelCounts(platform: MessagingPlatform, active: number, total: number): void {
        const metrics = this.getOrCreateMetrics(platform);
        metrics.channelsActive = active;
        metrics.channelsTotal = total;
    }

    /**
     * Get metrics for a specific platform
     */
    getPlatformMetrics(platform: MessagingPlatform): MetricsSummary {
        const metrics = this.getOrCreateMetrics(platform);
        const totalMessages = metrics.messagesSent + metrics.messagesFailed;
        const successRate = totalMessages > 0
            ? (metrics.messagesSent / totalMessages) * 100
            : 100;

        const averageLatencyMs = metrics.messageCount > 0
            ? metrics.totalLatencyMs / metrics.messageCount
            : 0;

        // Get top 5 errors
        const topErrors = Array.from(metrics.errors.entries())
            .map(([error, count]) => ({ error, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            platform,
            messagesSent: metrics.messagesSent,
            messagesFailed: metrics.messagesFailed,
            successRate: Math.round(successRate * 100) / 100,
            channelsActive: metrics.channelsActive,
            channelsTotal: metrics.channelsTotal,
            averageLatencyMs: Math.round(averageLatencyMs * 100) / 100,
            topErrors
        };
    }

    /**
     * Get metrics for all platforms
     */
    getAllMetrics(): {
        summary: {
            totalMessagesSent: number;
            totalMessagesFailed: number;
            overallSuccessRate: number;
            totalChannelsActive: number;
            uptimeSeconds: number;
        };
        platforms: Record<MessagingPlatform, MetricsSummary>;
    } {
        const platforms: MessagingPlatform[] = ['telegram', 'whatsapp', 'discord'];
        const platformMetrics: Record<MessagingPlatform, MetricsSummary> = {} as any;

        let totalSent = 0;
        let totalFailed = 0;
        let totalActive = 0;

        platforms.forEach(platform => {
            const metrics = this.getPlatformMetrics(platform);
            platformMetrics[platform] = metrics;
            totalSent += metrics.messagesSent;
            totalFailed += metrics.messagesFailed;
            totalActive += metrics.channelsActive;
        });

        const totalMessages = totalSent + totalFailed;
        const overallSuccessRate = totalMessages > 0
            ? (totalSent / totalMessages) * 100
            : 100;

        return {
            summary: {
                totalMessagesSent: totalSent,
                totalMessagesFailed: totalFailed,
                overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
                totalChannelsActive: totalActive,
                uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
            },
            platforms: platformMetrics
        };
    }

    /**
     * Reset all metrics (useful for testing or periodic resets)
     */
    reset(): void {
        this.metrics.clear();
        this.startTime = Date.now();

        const platforms: MessagingPlatform[] = ['telegram', 'whatsapp', 'discord'];
        platforms.forEach(platform => {
            this.metrics.set(platform, {
                messagesSent: 0,
                messagesFailed: 0,
                channelsActive: 0,
                channelsTotal: 0,
                totalLatencyMs: 0,
                messageCount: 0,
                errors: new Map()
            });
        });
    }

    /**
     * Get or create metrics for a platform
     */
    private getOrCreateMetrics(platform: MessagingPlatform): PlatformMetrics {
        let metrics = this.metrics.get(platform);
        if (!metrics) {
            metrics = {
                messagesSent: 0,
                messagesFailed: 0,
                channelsActive: 0,
                channelsTotal: 0,
                totalLatencyMs: 0,
                messageCount: 0,
                errors: new Map()
            };
            this.metrics.set(platform, metrics);
        }
        return metrics;
    }
}
