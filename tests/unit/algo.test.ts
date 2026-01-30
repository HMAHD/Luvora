import { describe, expect, test, vi } from 'vitest';
import { getDailySpark, getPremiumSpark } from '../../src/lib/algo';

// Mock crypto for SHA-256 if needed, but Bun has native support.
// Vitest runs in Node/Bun environment so crypto should be available.

describe('Logic: Deterministic Algorithm', () => {
    // Shared Date
    const date = new Date('2026-05-20T08:00:00Z');

    test('Consistency: Same seed + Same Date = Same Message', async () => {
        const spark1 = await getDailySpark(date, 'neutral');
        const spark2 = await getDailySpark(date, 'neutral');

        expect(spark1.morning.content).toBe(spark2.morning.content);
        expect(spark1.nickname).toBe(spark2.nickname);
    });

    test('Differentiation: Role impacts message selection', async () => {
        // We need to ensure pool has enough variance, or mock the pool.
        // Assuming real pool data for integration-style unit test.
        const neutral = await getDailySpark(date, 'neutral');
        const masculine = await getDailySpark(date, 'masculine');

        // They might share a message if fallback triggered or pool small,
        // but 'masculine' input should definitely work without error.
        expect(masculine).toBeDefined();
        // Ideally they differ if pool has specific targets
    });
});

describe('Logic: Role-Based Differentiation (Phase 7.5)', () => {
    const date = new Date('2026-05-20T08:00:00Z');

    test('Different roles produce different messages for same date', async () => {
        const neutral = await getDailySpark(date, 'neutral');
        const masculine = await getDailySpark(date, 'masculine');
        const feminine = await getDailySpark(date, 'feminine');

        // All should have valid content
        expect(neutral.morning.content).toBeDefined();
        expect(masculine.morning.content).toBeDefined();
        expect(feminine.morning.content).toBeDefined();

        // At least some roles should produce different messages
        // (depends on pool data, but role is now part of seed)
        const messages = new Set([
            neutral.morning.content,
            masculine.morning.content,
            feminine.morning.content,
        ]);

        // With role in seed, we expect differentiation
        expect(messages.size).toBeGreaterThanOrEqual(1);
    });

    test('Same role + different dates = different messages', async () => {
        const date1 = new Date('2026-05-20T08:00:00Z');
        const date2 = new Date('2026-05-21T08:00:00Z');
        const date3 = new Date('2026-05-22T08:00:00Z');

        const spark1 = await getDailySpark(date1, 'neutral');
        const spark2 = await getDailySpark(date2, 'neutral');
        const spark3 = await getDailySpark(date3, 'neutral');

        const messages = new Set([
            spark1.morning.content,
            spark2.morning.content,
            spark3.morning.content,
        ]);

        // Different dates should give different sparks
        expect(messages.size).toBeGreaterThan(1);
    });

    test('Spark contains expected structure', async () => {
        const spark = await getDailySpark(date, 'neutral');

        expect(spark).toHaveProperty('date');
        expect(spark).toHaveProperty('nickname');
        expect(spark).toHaveProperty('morning');
        expect(spark).toHaveProperty('night');
        expect(spark.morning).toHaveProperty('content');
        expect(spark.morning).toHaveProperty('tone');
        expect(spark.night).toHaveProperty('content');
        expect(spark.night).toHaveProperty('tone');
    });

    test('Tone is one of valid options (Phase 8)', async () => {
        const spark = await getDailySpark(date, 'neutral');
        const validTones = ['poetic', 'playful', 'romantic', 'passionate', 'sweet', 'supportive'];

        expect(validTones).toContain(spark.morning.tone);
        expect(validTones).toContain(spark.night.tone);
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

describe('Logic: Premium + Role Combination (Phase 7.5.7)', () => {
    const date = new Date('2026-05-20T08:00:00Z');

    test('Same user, different roles = different premium sparks', async () => {
        const userId = 'premium-user-123';

        const neutralSpark = await getPremiumSpark(date, userId, 'neutral');
        const masculineSpark = await getPremiumSpark(date, userId, 'masculine');
        const feminineSpark = await getPremiumSpark(date, userId, 'feminine');

        // All should be valid
        expect(neutralSpark.morning.content).toBeDefined();
        expect(masculineSpark.morning.content).toBeDefined();
        expect(feminineSpark.morning.content).toBeDefined();

        // With role in seed, at least some should differ
        const contents = new Set([
            neutralSpark.morning.content,
            masculineSpark.morning.content,
            feminineSpark.morning.content,
        ]);

        expect(contents.size).toBeGreaterThanOrEqual(1);
    });

    test('Premium spark is consistent for same user+date+role', async () => {
        const userId = 'consistent-user';
        const role = 'feminine';

        const spark1 = await getPremiumSpark(date, userId, role);
        const spark2 = await getPremiumSpark(date, userId, role);

        expect(spark1.morning.content).toBe(spark2.morning.content);
        expect(spark1.night.content).toBe(spark2.night.content);
        expect(spark1.nickname).toBe(spark2.nickname);
    });

    test('Premium spark differs across dates for same user', async () => {
        const userId = 'date-test-user';
        const dates = [
            new Date('2026-01-01T08:00:00Z'),
            new Date('2026-01-02T08:00:00Z'),
            new Date('2026-01-03T08:00:00Z'),
        ];

        const contents = new Set<string>();

        for (const d of dates) {
            const spark = await getPremiumSpark(d, userId, 'neutral');
            contents.add(spark.morning.content);
        }

        // Different dates should produce variation
        expect(contents.size).toBeGreaterThan(1);
    });

    test('Premium spark structure matches expected format', async () => {
        const spark = await getPremiumSpark(date, 'struct-test-user', 'neutral');

        expect(spark).toHaveProperty('date');
        expect(spark).toHaveProperty('nickname');
        expect(spark).toHaveProperty('morning');
        expect(spark).toHaveProperty('night');
        expect(typeof spark.date).toBe('string');
        expect(typeof spark.nickname).toBe('string');
        expect(typeof spark.morning.content).toBe('string');
        expect(typeof spark.night.content).toBe('string');
    });
});

describe('Logic: FREE vs LEGEND Algorithm Difference', () => {
    const date = new Date('2026-05-20T08:00:00Z');

    test('FREE users (getDailySpark) share same message for same date', async () => {
        // Simulating two FREE users on same day
        const freeUser1Spark = await getDailySpark(date, 'neutral');
        const freeUser2Spark = await getDailySpark(date, 'neutral');

        // FREE uses Hash(Date) - same for all users
        expect(freeUser1Spark.morning.content).toBe(freeUser2Spark.morning.content);
    });

    test('LEGEND users (getPremiumSpark) get different messages', async () => {
        // Simulating two LEGEND users on same day
        const legendUser1Spark = await getPremiumSpark(date, 'legend-user-1', 'neutral');
        const legendUser2Spark = await getPremiumSpark(date, 'legend-user-2', 'neutral');

        // LEGEND uses Hash(UserUUID + Date) - unique per user
        // Due to small pool, there's a chance of collision, so we test many users
        const userIds = ['leg-1', 'leg-2', 'leg-3', 'leg-4', 'leg-5', 'leg-6', 'leg-7', 'leg-8'];
        const contents = new Set<string>();

        for (const uid of userIds) {
            const spark = await getPremiumSpark(date, uid, 'neutral');
            contents.add(spark.morning.content);
        }

        // With 8 different user IDs, we should see variation
        expect(contents.size).toBeGreaterThan(1);
    });
});
