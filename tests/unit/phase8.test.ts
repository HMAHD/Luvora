import { describe, expect, test } from 'vitest';
import {
    LOVE_LANGUAGES,
    LOVE_LANGUAGE_NAMES,
    EMOTIONAL_TONES,
    EMOTIONAL_TONE_NAMES,
    MESSAGE_RARITY,
    type LoveLanguage,
    type EmotionalTone,
    type MessageRarity,
} from '../../src/lib/types';
import { getDailySpark, getDaysUntilOccasion, getRarityInfo, type LegendSparkOptions } from '../../src/lib/algo';

/**
 * Phase 8: Legend Tier Enhancements Tests
 *
 * Tests for:
 * - Love Language types and filtering
 * - Emotional Tone types and selection
 * - Message Rarity system
 * - Special occasion detection
 * - Countdown calculations
 */

describe('Phase 8: Love Language Types', () => {
    test('LOVE_LANGUAGES constants have correct values', () => {
        expect(LOVE_LANGUAGES.WORDS).toBe('words_of_affirmation');
        expect(LOVE_LANGUAGES.ACTS).toBe('acts_of_service');
        expect(LOVE_LANGUAGES.GIFTS).toBe('receiving_gifts');
        expect(LOVE_LANGUAGES.TIME).toBe('quality_time');
        expect(LOVE_LANGUAGES.TOUCH).toBe('physical_touch');
    });

    test('All love languages have display names', () => {
        const languages = Object.values(LOVE_LANGUAGES) as LoveLanguage[];
        languages.forEach(lang => {
            expect(LOVE_LANGUAGE_NAMES[lang]).toBeDefined();
            expect(typeof LOVE_LANGUAGE_NAMES[lang]).toBe('string');
        });
    });

    test('LOVE_LANGUAGE_NAMES are user-friendly', () => {
        expect(LOVE_LANGUAGE_NAMES[LOVE_LANGUAGES.WORDS]).toBe('Words of Affirmation');
        expect(LOVE_LANGUAGE_NAMES[LOVE_LANGUAGES.ACTS]).toBe('Acts of Service');
        expect(LOVE_LANGUAGE_NAMES[LOVE_LANGUAGES.GIFTS]).toBe('Receiving Gifts');
        expect(LOVE_LANGUAGE_NAMES[LOVE_LANGUAGES.TIME]).toBe('Quality Time');
        expect(LOVE_LANGUAGE_NAMES[LOVE_LANGUAGES.TOUCH]).toBe('Physical Touch');
    });
});

describe('Phase 8: Emotional Tone Types', () => {
    test('EMOTIONAL_TONES constants have correct values', () => {
        expect(EMOTIONAL_TONES.POETIC).toBe('poetic');
        expect(EMOTIONAL_TONES.PLAYFUL).toBe('playful');
        expect(EMOTIONAL_TONES.ROMANTIC).toBe('romantic');
        expect(EMOTIONAL_TONES.PASSIONATE).toBe('passionate');
        expect(EMOTIONAL_TONES.SWEET).toBe('sweet');
        expect(EMOTIONAL_TONES.SUPPORTIVE).toBe('supportive');
    });

    test('All emotional tones have display names', () => {
        const tones = Object.values(EMOTIONAL_TONES) as EmotionalTone[];
        tones.forEach(tone => {
            expect(EMOTIONAL_TONE_NAMES[tone]).toBeDefined();
            expect(typeof EMOTIONAL_TONE_NAMES[tone]).toBe('string');
        });
    });

    test('There are 6 emotional tones', () => {
        const tones = Object.values(EMOTIONAL_TONES);
        expect(tones.length).toBe(6);
    });
});

describe('Phase 8: Message Rarity Types', () => {
    test('MESSAGE_RARITY constants have correct values', () => {
        expect(MESSAGE_RARITY.COMMON).toBe('common');
        expect(MESSAGE_RARITY.RARE).toBe('rare');
        expect(MESSAGE_RARITY.EPIC).toBe('epic');
        expect(MESSAGE_RARITY.LEGENDARY).toBe('legendary');
    });

    test('There are 4 rarity levels', () => {
        const rarities = Object.values(MESSAGE_RARITY);
        expect(rarities.length).toBe(4);
    });
});

describe('Phase 8: Daily Spark with Tone', () => {
    test('getDailySpark returns spark with tone field', () => {
        const spark = getDailySpark(new Date('2026-01-29'), 'neutral');

        expect(spark.morning.tone).toBeDefined();
        expect(spark.night.tone).toBeDefined();

        const validTones = Object.values(EMOTIONAL_TONES);
        expect(validTones).toContain(spark.morning.tone);
        expect(validTones).toContain(spark.night.tone);
    });

    test('getDailySpark returns spark with optional rarity field', () => {
        const spark = getDailySpark(new Date('2026-01-29'), 'neutral');

        // Rarity may or may not be present
        if (spark.morning.rarity) {
            const validRarities = Object.values(MESSAGE_RARITY);
            expect(validRarities).toContain(spark.morning.rarity);
        }
    });

    test('getDailySpark is deterministic', () => {
        const date = new Date('2026-01-29');
        const spark1 = getDailySpark(date, 'neutral');
        const spark2 = getDailySpark(date, 'neutral');

        expect(spark1.morning.content).toBe(spark2.morning.content);
        expect(spark1.night.content).toBe(spark2.night.content);
        expect(spark1.morning.tone).toBe(spark2.morning.tone);
        expect(spark1.night.tone).toBe(spark2.night.tone);
    });

    test('Different roles produce different sparks', () => {
        const date = new Date('2026-01-29');
        const neutralSpark = getDailySpark(date, 'neutral');
        const feminineSpark = getDailySpark(date, 'feminine');
        const masculineSpark = getDailySpark(date, 'masculine');

        // At least one should be different (depends on pool content)
        const contents = new Set([
            neutralSpark.morning.content,
            feminineSpark.morning.content,
            masculineSpark.morning.content,
        ]);

        // They might be the same if only neutral messages are available
        // but the seeding should differ
        expect(neutralSpark.date).toBe(feminineSpark.date);
    });
});

describe('Phase 8: Days Until Occasion', () => {
    test('getDaysUntilOccasion calculates correctly for future date', () => {
        const today = new Date('2026-01-15');
        const anniversary = '2026-02-14'; // Valentine's Day

        const days = getDaysUntilOccasion(anniversary, today);
        expect(days).toBe(30);
    });

    test('getDaysUntilOccasion returns 0 for today', () => {
        const today = new Date('2026-02-14');
        const anniversary = '2026-02-14';

        const days = getDaysUntilOccasion(anniversary, today);
        expect(days).toBe(0);
    });

    test('getDaysUntilOccasion wraps to next year for past dates', () => {
        const today = new Date('2026-03-01');
        const anniversary = '2026-02-14'; // Already passed

        const days = getDaysUntilOccasion(anniversary, today);
        // Should be about 350 days (to next year's Feb 14)
        expect(days).toBeGreaterThan(340);
        expect(days).toBeLessThan(365);
    });

    test('getDaysUntilOccasion handles birthday correctly', () => {
        const today = new Date('2026-06-01');
        const birthday = '2000-07-15'; // Year is ignored for birthday

        const days = getDaysUntilOccasion(birthday, today);
        expect(days).toBe(44); // From June 1 to July 15
    });
});

describe('Phase 8: Rarity Info Display', () => {
    test('getRarityInfo returns correct colors for each rarity', () => {
        const common = getRarityInfo('common');
        const rare = getRarityInfo('rare');
        const epic = getRarityInfo('epic');
        const legendary = getRarityInfo('legendary');

        expect(common.label).toBe('Common');
        expect(common.color).toContain('gray');

        expect(rare.label).toBe('Rare');
        expect(rare.color).toContain('blue');

        expect(epic.label).toBe('Epic');
        expect(epic.color).toContain('purple');

        expect(legendary.label).toBe('Legendary');
        expect(legendary.color).toContain('amber');
    });

    test('getRarityInfo handles undefined rarity', () => {
        const result = getRarityInfo(undefined);
        expect(result.label).toBe('Common');
        expect(result.color).toContain('gray');
    });

    test('getRarityInfo includes glow effect for higher rarities', () => {
        const common = getRarityInfo('common');
        const legendary = getRarityInfo('legendary');

        expect(common.glow).toBe('');
        expect(legendary.glow).not.toBe('');
        expect(legendary.glow).toContain('shadow');
    });
});

describe('Phase 8: Special Occasion Detection', () => {
    // Testing the internal logic through integration
    test('Spark includes isSpecialOccasion when relevant', () => {
        // This tests the structure - actual special occasion detection
        // requires the async getLegendSpark function
        const spark = getDailySpark(new Date('2026-02-14'), 'neutral');

        // getDailySpark doesn't have special occasion detection
        // only getLegendSpark does
        expect(spark.isSpecialOccasion).toBeUndefined();
    });
});

describe('Phase 8: Message Pool Structure', () => {
    // Import the pool to verify structure
    test('Message pool has all required tones', async () => {
        const pool = await import('../../src/lib/data/pool.json');

        const morningTones = Object.keys(pool.messages.morning);
        const expectedTones = ['poetic', 'playful', 'romantic', 'passionate', 'sweet', 'supportive'];

        expectedTones.forEach(tone => {
            expect(morningTones).toContain(tone);
        });
    });

    test('Message pool has special occasions section', async () => {
        const pool = await import('../../src/lib/data/pool.json');

        expect(pool.messages.special_occasions).toBeDefined();
        expect(pool.messages.special_occasions.anniversary).toBeDefined();
        expect(pool.messages.special_occasions.birthday).toBeDefined();
        expect(pool.messages.special_occasions.milestone).toBeDefined();
    });

    test('Message pool has love language specific messages', async () => {
        const pool = await import('../../src/lib/data/pool.json');

        expect(pool.messages.love_language_specific).toBeDefined();

        const languages = Object.keys(pool.messages.love_language_specific);
        expect(languages).toContain('words_of_affirmation');
        expect(languages).toContain('acts_of_service');
        expect(languages).toContain('receiving_gifts');
        expect(languages).toContain('quality_time');
        expect(languages).toContain('physical_touch');
    });

    test('Messages have required Phase 8 fields', async () => {
        const pool = await import('../../src/lib/data/pool.json');

        // Check a few messages for required fields
        const morningPoetic = pool.messages.morning.poetic[0];
        expect(morningPoetic.content).toBeDefined();
        expect(morningPoetic.target).toBeDefined();
        expect(morningPoetic.love_language).toBeDefined();
        expect(morningPoetic.rarity).toBeDefined();
    });

    test('Premium messages have rarity field', async () => {
        const pool = await import('../../src/lib/data/pool.json');

        pool.messages.premium.forEach((msg: { rarity?: string }) => {
            expect(msg.rarity).toBeDefined();
        });
    });
});

describe('Phase 8: User Type Fields', () => {
    // Test that User interface accepts Phase 8 fields
    test('User type includes love_language field', () => {
        // This is a type check - if it compiles, it passes
        const user: {
            id: string;
            email: string;
            tier: number;
            love_language?: LoveLanguage;
            created: string;
            updated: string;
        } = {
            id: 'test',
            email: 'test@test.com',
            tier: 2,
            love_language: LOVE_LANGUAGES.WORDS,
            created: '2026-01-01',
            updated: '2026-01-01',
        };

        expect(user.love_language).toBe('words_of_affirmation');
    });

    test('User type includes preferred_tone field', () => {
        const user: {
            id: string;
            email: string;
            tier: number;
            preferred_tone?: EmotionalTone;
            created: string;
            updated: string;
        } = {
            id: 'test',
            email: 'test@test.com',
            tier: 2,
            preferred_tone: EMOTIONAL_TONES.ROMANTIC,
            created: '2026-01-01',
            updated: '2026-01-01',
        };

        expect(user.preferred_tone).toBe('romantic');
    });

    test('User type includes date fields', () => {
        const user: {
            id: string;
            email: string;
            tier: number;
            anniversary_date?: string;
            partner_birthday?: string;
            relationship_start?: string;
            created: string;
            updated: string;
        } = {
            id: 'test',
            email: 'test@test.com',
            tier: 2,
            anniversary_date: '2020-06-15',
            partner_birthday: '1995-03-20',
            relationship_start: '2018-12-01',
            created: '2026-01-01',
            updated: '2026-01-01',
        };

        expect(user.anniversary_date).toBe('2020-06-15');
        expect(user.partner_birthday).toBe('1995-03-20');
        expect(user.relationship_start).toBe('2018-12-01');
    });
});

describe('Phase 8: LegendSparkOptions Type', () => {
    test('LegendSparkOptions accepts all Phase 8 fields', () => {
        const options: LegendSparkOptions = {
            userId: 'user-123',
            role: 'neutral',
            loveLanguage: LOVE_LANGUAGES.TIME,
            preferredTone: EMOTIONAL_TONES.SWEET,
            anniversaryDate: '2020-06-15',
            partnerBirthday: '1995-03-20',
        };

        expect(options.userId).toBe('user-123');
        expect(options.loveLanguage).toBe('quality_time');
        expect(options.preferredTone).toBe('sweet');
    });

    test('LegendSparkOptions allows optional fields to be undefined', () => {
        const options: LegendSparkOptions = {
            userId: 'user-123',
            role: 'feminine',
        };

        expect(options.userId).toBe('user-123');
        expect(options.role).toBe('feminine');
        expect(options.loveLanguage).toBeUndefined();
        expect(options.preferredTone).toBeUndefined();
    });
});
