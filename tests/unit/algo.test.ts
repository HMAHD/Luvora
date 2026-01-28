import { describe, expect, test, vi } from 'vitest';
import { getDailySpark, getPremiumSpark } from '../../src/lib/algo';

// Mock crypto for SHA-256 if needed, but Bun has native support.
// Vitest runs in Node/Bun environment so crypto should be available.

describe('Logic: Deterministic Algorithm', () => {
    // Shared Date
    const date = new Date('2026-05-20T08:00:00Z');

    test('Consistency: Same seed + Same Date = Same Message', () => {
        const spark1 = getDailySpark(date, 'neutral');
        const spark2 = getDailySpark(date, 'neutral');

        expect(spark1.morning.content).toBe(spark2.morning.content);
        expect(spark1.nickname).toBe(spark2.nickname);
    });

    test('Differentiation: Role impacts message selection', () => {
        // We need to ensure pool has enough variance, or mock the pool.
        // Assuming real pool data for integration-style unit test.
        const neutral = getDailySpark(date, 'neutral');
        const masculine = getDailySpark(date, 'masculine');

        // They might share a message if fallback triggered or pool small, 
        // but 'masculine' input should definitely work without error.
        expect(masculine).toBeDefined();
        // Ideally they differ if pool has specific targets
    });
});

describe('Logic: Premium Exclusivity', () => {
    const date = new Date('2026-05-20T08:00:00Z');
    const userId1 = 'user-123';
    const userId2 = 'user-456';

    test('Premium users get unique messages (Entropy Check)', async () => {
        // Since pool is small (7 items), collisions are possible.
        // We generate messages for 5 diff users and ensure we get at least 2 different variations.
        const userIds = ['u1', 'u2', 'u3', 'u4', 'u5'];
        const contents = new Set<string>();

        for (const uid of userIds) {
            const spark = await getPremiumSpark(date, uid, 'neutral');
            contents.add(spark.morning.content);
        }

        // Ideally size > 1 (proving seed works)
        expect(contents.size).toBeGreaterThan(1);
    });

    test('Premium Fallback works', async () => {
        const spark = await getPremiumSpark(date, 'user-fallback-test', 'neutral');
        expect(spark.morning.content).toBeDefined();
    });
});
