import { NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/messaging-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Messaging Metrics Endpoint
 *
 * Returns detailed metrics for all messaging platforms:
 * - Messages sent/failed per platform
 * - Success rates
 * - Average latency
 * - Active channels
 * - Top errors
 * - Service uptime
 *
 * Used by monitoring dashboards and analytics
 *
 * @returns Metrics data with HTTP 200
 */
export async function GET() {
    try {
        const metrics = messagingService.getMetrics();

        return NextResponse.json(
            {
                timestamp: new Date().toISOString(),
                ...metrics
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );

    } catch (error) {
        console.error('[API /api/health/messaging/metrics] Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to retrieve messaging metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
