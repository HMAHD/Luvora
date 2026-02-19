/**
 * Health Check Endpoint Tests
 * Tests for /api/health endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock PocketBase
vi.mock('@/lib/pocketbase', () => ({
    pb: {
        health: {
            check: vi.fn(),
        },
    },
}));

describe('/api/health endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset environment variables
        process.env.NEXT_PUBLIC_POCKETBASE_URL = 'https://api.luvora.love';
        process.env.TELEGRAM_BOT_TOKEN = 'test_token';
    });

    describe('Healthy State', () => {
        it('should return 200 and healthy status when all checks pass', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe('healthy');
            expect(data.checks.database.status).toBe('ok');
            expect(data.checks.env.status).toBe('ok');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('uptime');
            expect(data).toHaveProperty('version');
        });

        it('should include database latency when healthy', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(data.checks.database.latency).toBeGreaterThanOrEqual(0);
        });

        it('should have proper cache-control headers', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();

            expect(response.headers.get('Cache-Control')).toBe(
                'no-cache, no-store, must-revalidate'
            );
            expect(response.headers.get('Pragma')).toBe('no-cache');
            expect(response.headers.get('Expires')).toBe('0');
        });
    });

    describe('Degraded State', () => {
        it('should return 503 when database is unreachable', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockRejectedValue(
                new Error('Connection failed')
            );

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.status).toBe('unhealthy');
            expect(data.checks.database.status).toBe('error');
            // error details are intentionally omitted from the response for security
        });
    });

    describe('Unhealthy State', () => {
        it('should return 503 when critical env vars are missing', async () => {
            // Remove critical env vars
            delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
            delete process.env.TELEGRAM_BOT_TOKEN;

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.status).toBe('unhealthy');
            expect(data.checks.env.status).toBe('error');
            // missing env var names are intentionally omitted from the response for security
        });

        it('should return 503 when database error occurs', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockRejectedValue(
                new Error('Database error')
            );

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(503);
            expect(data.status).toBe('unhealthy');
        });
    });

    describe('Version Information', () => {
        it('should return version from env var if set', async () => {
            process.env.NEXT_PUBLIC_APP_VERSION = '1.2.3';

            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(data.version).toBe('1.2.3');
        });

        it('should return default version if env var not set', async () => {
            delete process.env.NEXT_PUBLIC_APP_VERSION;

            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(data.version).toBe('1.0.0');
        });
    });

    describe('Response Format', () => {
        it('should include all required fields in response', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('uptime');
            expect(data).toHaveProperty('version');
            expect(data).toHaveProperty('checks');
            expect(data.checks).toHaveProperty('database');
            expect(data.checks).toHaveProperty('env');
        });

        it('should have valid ISO timestamp', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.health.check as any).mockResolvedValue(undefined as any);

            const { GET } = await import('@/app/api/health/route');
            const response = await GET();
            const data = await response.json();

            const timestamp = new Date(data.timestamp);
            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.getTime()).not.toBeNaN();
        });
    });
});
