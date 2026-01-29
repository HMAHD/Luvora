import { describe, expect, test } from 'vitest';
import { TIER, TIER_NAMES, type TierLevel, type User } from '../../src/lib/types';

describe('Tier System: Constants & Types', () => {
    test('TIER constants have correct values', () => {
        expect(TIER.FREE).toBe(0);
        expect(TIER.HERO).toBe(1);
        expect(TIER.LEGEND).toBe(2);
    });

    test('TIER values are ordered correctly (FREE < HERO < LEGEND)', () => {
        expect(TIER.FREE).toBeLessThan(TIER.HERO);
        expect(TIER.HERO).toBeLessThan(TIER.LEGEND);
        expect(TIER.FREE).toBeLessThan(TIER.LEGEND);
    });

    test('TIER_NAMES maps correctly to display names', () => {
        expect(TIER_NAMES[TIER.FREE]).toBe('Voyager');
        expect(TIER_NAMES[TIER.HERO]).toBe('Hero');
        expect(TIER_NAMES[TIER.LEGEND]).toBe('Legend');
    });

    test('All TIER levels have corresponding names', () => {
        const tierValues = Object.values(TIER) as TierLevel[];
        tierValues.forEach(tier => {
            expect(TIER_NAMES[tier]).toBeDefined();
            expect(typeof TIER_NAMES[tier]).toBe('string');
        });
    });
});

describe('Tier System: Access Control Logic', () => {
    // Helper to check tier access
    const hasAccess = (userTier: TierLevel, requiredTier: TierLevel): boolean => {
        return userTier >= requiredTier;
    };

    test('FREE user can access FREE features', () => {
        expect(hasAccess(TIER.FREE, TIER.FREE)).toBe(true);
    });

    test('FREE user cannot access HERO features', () => {
        expect(hasAccess(TIER.FREE, TIER.HERO)).toBe(false);
    });

    test('FREE user cannot access LEGEND features', () => {
        expect(hasAccess(TIER.FREE, TIER.LEGEND)).toBe(false);
    });

    test('HERO user can access FREE and HERO features', () => {
        expect(hasAccess(TIER.HERO, TIER.FREE)).toBe(true);
        expect(hasAccess(TIER.HERO, TIER.HERO)).toBe(true);
    });

    test('HERO user cannot access LEGEND features', () => {
        expect(hasAccess(TIER.HERO, TIER.LEGEND)).toBe(false);
    });

    test('LEGEND user can access all tier features', () => {
        expect(hasAccess(TIER.LEGEND, TIER.FREE)).toBe(true);
        expect(hasAccess(TIER.LEGEND, TIER.HERO)).toBe(true);
        expect(hasAccess(TIER.LEGEND, TIER.LEGEND)).toBe(true);
    });
});

describe('Tier System: User Type Validation', () => {
    test('User type accepts valid tier values', () => {
        const freeUser: User = {
            id: 'user-1',
            email: 'free@test.com',
            tier: TIER.FREE,
            created: '2025-01-01',
            updated: '2025-01-01',
        };

        const heroUser: User = {
            id: 'user-2',
            email: 'hero@test.com',
            tier: TIER.HERO,
            created: '2025-01-01',
            updated: '2025-01-01',
        };

        const legendUser: User = {
            id: 'user-3',
            email: 'legend@test.com',
            tier: TIER.LEGEND,
            created: '2025-01-01',
            updated: '2025-01-01',
        };

        expect(freeUser.tier).toBe(0);
        expect(heroUser.tier).toBe(1);
        expect(legendUser.tier).toBe(2);
    });

    test('User type accepts optional fields', () => {
        const userWithOptionals: User = {
            id: 'user-full',
            email: 'full@test.com',
            tier: TIER.HERO,
            partner_name: 'My Love',
            recipient_role: 'feminine',
            timezone: 'America/New_York',
            morning_time: '08:00',
            messaging_platform: 'whatsapp',
            messaging_id: '+1234567890',
            streak: 30,
            last_sent_date: '2025-01-28',
            created: '2025-01-01',
            updated: '2025-01-28',
        };

        expect(userWithOptionals.partner_name).toBe('My Love');
        expect(userWithOptionals.recipient_role).toBe('feminine');
        expect(userWithOptionals.streak).toBe(30);
    });

    test('recipient_role accepts valid values', () => {
        const roles: Array<User['recipient_role']> = ['masculine', 'feminine', 'neutral'];

        roles.forEach(role => {
            const user: User = {
                id: 'test',
                email: 'test@test.com',
                tier: TIER.FREE,
                recipient_role: role,
                created: '2025-01-01',
                updated: '2025-01-01',
            };
            expect(['masculine', 'feminine', 'neutral', undefined]).toContain(user.recipient_role);
        });
    });
});

describe('Tier System: Feature Matrix', () => {
    // Define feature access matrix
    const features = {
        dailySpark: { minTier: TIER.FREE },
        automation: { minTier: TIER.HERO },
        fullHistory: { minTier: TIER.HERO },
        exclusiveStyles: { minTier: TIER.LEGEND },
        uniqueSpark: { minTier: TIER.LEGEND },
    };

    const canAccessFeature = (userTier: TierLevel, featureMinTier: TierLevel) => {
        return userTier >= featureMinTier;
    };

    test('FREE users: Can access daily spark only', () => {
        expect(canAccessFeature(TIER.FREE, features.dailySpark.minTier)).toBe(true);
        expect(canAccessFeature(TIER.FREE, features.automation.minTier)).toBe(false);
        expect(canAccessFeature(TIER.FREE, features.fullHistory.minTier)).toBe(false);
        expect(canAccessFeature(TIER.FREE, features.exclusiveStyles.minTier)).toBe(false);
        expect(canAccessFeature(TIER.FREE, features.uniqueSpark.minTier)).toBe(false);
    });

    test('HERO users: Can access daily spark, automation, full history', () => {
        expect(canAccessFeature(TIER.HERO, features.dailySpark.minTier)).toBe(true);
        expect(canAccessFeature(TIER.HERO, features.automation.minTier)).toBe(true);
        expect(canAccessFeature(TIER.HERO, features.fullHistory.minTier)).toBe(true);
        expect(canAccessFeature(TIER.HERO, features.exclusiveStyles.minTier)).toBe(false);
        expect(canAccessFeature(TIER.HERO, features.uniqueSpark.minTier)).toBe(false);
    });

    test('LEGEND users: Can access all features', () => {
        expect(canAccessFeature(TIER.LEGEND, features.dailySpark.minTier)).toBe(true);
        expect(canAccessFeature(TIER.LEGEND, features.automation.minTier)).toBe(true);
        expect(canAccessFeature(TIER.LEGEND, features.fullHistory.minTier)).toBe(true);
        expect(canAccessFeature(TIER.LEGEND, features.exclusiveStyles.minTier)).toBe(true);
        expect(canAccessFeature(TIER.LEGEND, features.uniqueSpark.minTier)).toBe(true);
    });
});
