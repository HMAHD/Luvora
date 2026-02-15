import { NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/messaging-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Messaging Health Check Endpoint
 *
 * Returns detailed health status of all messaging channels:
 * - Total channels and users
 * - Platform breakdown (Telegram, WhatsApp, Discord)
 * - Connection limits and availability
 * - List of issues/unhealthy channels
 *
 * Used by monitoring tools and admin dashboards
 *
 * @returns Health status with HTTP 200 (healthy), 207 (degraded), or 503 (unhealthy)
 */
export async function GET() {
    try {
        const health = messagingService.getHealthStatus();

        // Determine overall status
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        // If not initialized, system is unhealthy
        if (!health.initialized) {
            status = 'unhealthy';
        }
        // If there are issues, system is degraded
        else if (health.issues.length > 0) {
            status = 'degraded';
        }
        // If any platform is near connection limit (>90%), system is degraded
        else {
            for (const platform of ['telegram', 'whatsapp', 'discord'] as const) {
                const stats = health.connectionLimits[platform];
                const utilization = stats.current / stats.max;
                if (utilization > 0.9) {
                    status = 'degraded';
                    health.issues.push(
                        `${platform} connection pool at ${(utilization * 100).toFixed(0)}% capacity`
                    );
                }
            }
        }

        // Calculate HTTP status code
        const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503;

        return NextResponse.json(
            {
                status,
                timestamp: new Date().toISOString(),
                messaging: health
            },
            {
                status: httpStatus,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

    } catch (error) {
        console.error('[Health Check] Error getting messaging health:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Failed to check messaging health'
            },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );
    }
}
