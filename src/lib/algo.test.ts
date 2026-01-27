import { describe, expect, test } from 'bun:test';
import { getDailySpark } from './algo';

describe('Deterministic Algorithm', () => {
    test('returns consistent results for the same date', () => {
        const d1 = new Date('2026-01-27T10:00:00Z');
        const d2 = new Date('2026-01-27T22:00:00Z'); // Different time, same day

        const spark1 = getDailySpark(d1);
        const spark2 = getDailySpark(d2);

        expect(spark1.date).toBe('2026-01-27');
        expect(spark2.date).toBe('2026-01-27');
        expect(spark1.nickname).toBe(spark2.nickname);
        expect(spark1.morning.content).toBe(spark2.morning.content);
        expect(spark1.night.content).toBe(spark2.night.content);
    });

    test('returns different results for different dates', () => {
        const d1 = new Date('2026-01-27T10:00:00Z');
        const d2 = new Date('2026-01-28T10:00:00Z');

        const spark1 = getDailySpark(d1);
        const spark2 = getDailySpark(d2);

        // It's technically possible but statistically unlikely they are IDENTICAL across all fields
        // We check at least one field differs or the date string differs
        expect(spark1.date).not.toBe(spark2.date);

        // Check reasonable variance (not strict inequality for random fields due to pigeonhole, but practically different)
        const isIdentical =
            spark1.nickname === spark2.nickname &&
            spark1.morning.content === spark2.morning.content &&
            spark1.night.content === spark2.night.content;

        expect(isIdentical).toBe(false);
    });

    test('structure contains correct vibes', () => {
        const spark = getDailySpark();
        expect(['poetic', 'playful', 'minimal']).toContain(spark.morning.vibe);
        expect(['poetic', 'playful', 'minimal']).toContain(spark.night.vibe);
    });
});
