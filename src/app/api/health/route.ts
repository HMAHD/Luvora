import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
        database: {
            status: 'ok' | 'error';
            latency?: number;
            error?: string;
        };
        env: {
            status: 'ok' | 'error';
            missing?: string[];
        };
    };
    version?: string;
}

/**
 * Health Check Endpoint
 *
 * Returns system health status including:
 * - PocketBase database connectivity
 * - Environment variables
 * - System uptime
 *
 * Used by monitoring tools (Sentry, uptime monitors)
 */
export async function GET() {
    const result: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: { status: 'ok' },
            env: { status: 'ok' },
        },
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    };

    // Check PocketBase connectivity
    try {
        const dbStart = Date.now();

        // Try to fetch health endpoint or a simple collection query
        await pb.health.check();

        result.checks.database.latency = Date.now() - dbStart;
    } catch {
        result.checks.database.status = 'error';
        result.status = 'degraded';
    }

    // Check critical environment variables (don't expose names)
    const requiredEnvVars = [
        'NEXT_PUBLIC_POCKETBASE_URL',
        'TELEGRAM_BOT_TOKEN',
    ];

    const missingCount = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    ).length;

    if (missingCount > 0) {
        result.checks.env.status = 'error';
        result.status = 'unhealthy';
    }

    // Determine overall status
    if (result.checks.database.status === 'error') {
        result.status = 'unhealthy';
    }

    // Return appropriate HTTP status code
    const httpStatus = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 207 : 503;

    return NextResponse.json(result, {
        status: httpStatus,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
