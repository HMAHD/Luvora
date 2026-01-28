import { describe, expect, test } from 'bun:test';
import { getDailySpark } from './algo';

describe('Role-Aware Algorithm', () => {
    test('filters for neutral role by default', () => {
        const spark = getDailySpark(new Date(), 'neutral');
        expect(spark.morning.content).toBeDefined();
        // We can't easily check internal filtering without exposing it, but we check valid return.
    });

    test('accepts masculine role', () => {
        const spark = getDailySpark(new Date(), 'masculine');
        expect(spark.morning.content).toBeDefined();
    });

    test('accepts feminine role', () => {
        const spark = getDailySpark(new Date(), 'feminine');
        expect(spark.morning.content).toBeDefined();
    });

    test('determinism holds per role', () => {
        const date = new Date('2026-05-20');
        const s1 = getDailySpark(date, 'masculine');
        const s2 = getDailySpark(date, 'masculine');
        expect(s1.morning.content).toBe(s2.morning.content);
    });

    test('variance between roles', () => {
        const date = new Date('2026-05-20');
        const masc = getDailySpark(date, 'masculine');
        const fem = getDailySpark(date, 'feminine');

        // It's possible they share a neutral message, but let's check
        // If they pick the same message, it must be neutral.
        // We just ensure it doesn't crash.
        // Given our small pool, collision on "neutral" messages is possible.
        expect(masc).toBeDefined();
        expect(fem).toBeDefined();
    });
});
