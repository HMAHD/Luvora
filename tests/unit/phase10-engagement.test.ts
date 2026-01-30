import { describe, expect, test, vi } from 'vitest';

/**
 * Phase 10: Engagement Metrics Tests
 *
 * Tests for:
 * - Engagement tracking types and interfaces
 * - Streak calculation logic
 * - At-risk user identification
 */

// Type definitions matching the engagement system
interface EngagementStats {
    activeUsers: number;
    averageStreak: number;
    atRiskCount: number;
    topStreak: number;
}

interface UserEngagement {
    userId: string;
    lastActivity: string;
    totalCopies: number;
    totalShares: number;
    currentStreak: number;
    longestStreak: number;
    engagementScore: number;
}

// Helper functions for testing (mirroring server actions)
function calculateStreak(activityDates: string[]): number {
    if (activityDates.length === 0) return 0;

    const sorted = [...activityDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = today;

    for (const dateStr of sorted) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0 || diffDays === 1) {
            streak++;
            currentDate = date;
        } else {
            break;
        }
    }

    return streak;
}

function calculateEngagementScore(user: { copies: number; shares: number; streak: number; daysActive: number }): number {
    // Score formula: copies*1 + shares*3 + streak*5 + daysActive*0.5
    return user.copies * 1 + user.shares * 3 + user.streak * 5 + user.daysActive * 0.5;
}

function isAtRisk(lastActivityDate: string, thresholdDays: number = 7): boolean {
    const lastActivity = new Date(lastActivityDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= thresholdDays;
}

describe('Phase 10: Streak Calculation', () => {
    test('calculateStreak returns 0 for empty activity', () => {
        const streak = calculateStreak([]);
        expect(streak).toBe(0);
    });

    test('calculateStreak returns 1 for single activity today', () => {
        const today = new Date().toISOString().split('T')[0];
        const streak = calculateStreak([today]);
        expect(streak).toBe(1);
    });

    test('calculateStreak counts consecutive days correctly', () => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        const streak = calculateStreak(dates);
        expect(streak).toBe(5);
    });

    test('calculateStreak breaks on gap', () => {
        const today = new Date();
        const dates = [];

        // Add today and yesterday
        dates.push(today.toISOString().split('T')[0]);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dates.push(yesterday.toISOString().split('T')[0]);

        // Skip a day, then add more
        const fourDaysAgo = new Date(today);
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
        dates.push(fourDaysAgo.toISOString().split('T')[0]);

        const streak = calculateStreak(dates);
        expect(streak).toBe(2); // Only today and yesterday count
    });
});

describe('Phase 10: Engagement Score', () => {
    test('calculateEngagementScore with minimal activity', () => {
        const score = calculateEngagementScore({
            copies: 1,
            shares: 0,
            streak: 1,
            daysActive: 1,
        });
        // 1*1 + 0*3 + 1*5 + 1*0.5 = 6.5
        expect(score).toBe(6.5);
    });

    test('calculateEngagementScore weights shares higher than copies', () => {
        const copyOnlyScore = calculateEngagementScore({
            copies: 10,
            shares: 0,
            streak: 0,
            daysActive: 1,
        });

        const shareOnlyScore = calculateEngagementScore({
            copies: 0,
            shares: 10,
            streak: 0,
            daysActive: 1,
        });

        // Shares should be worth 3x copies
        expect(shareOnlyScore).toBeGreaterThan(copyOnlyScore);
        expect(shareOnlyScore).toBe(30.5); // 0 + 30 + 0 + 0.5
        expect(copyOnlyScore).toBe(10.5); // 10 + 0 + 0 + 0.5
    });

    test('calculateEngagementScore rewards long streaks', () => {
        const noStreakScore = calculateEngagementScore({
            copies: 5,
            shares: 2,
            streak: 0,
            daysActive: 10,
        });

        const highStreakScore = calculateEngagementScore({
            copies: 5,
            shares: 2,
            streak: 30,
            daysActive: 10,
        });

        // 30-day streak adds 150 points
        expect(highStreakScore - noStreakScore).toBe(150);
    });
});

describe('Phase 10: At-Risk User Detection', () => {
    test('isAtRisk returns false for recent activity', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const result = isAtRisk(yesterday.toISOString());
        expect(result).toBe(false);
    });

    test('isAtRisk returns true for 7+ days inactive', () => {
        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
        const result = isAtRisk(eightDaysAgo.toISOString());
        expect(result).toBe(true);
    });

    test('isAtRisk uses custom threshold', () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Default 7-day threshold: not at risk
        expect(isAtRisk(threeDaysAgo.toISOString())).toBe(false);

        // Custom 3-day threshold: at risk
        expect(isAtRisk(threeDaysAgo.toISOString(), 3)).toBe(true);
    });

    test('isAtRisk boundary case (exactly 7 days)', () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const result = isAtRisk(sevenDaysAgo.toISOString());
        expect(result).toBe(true);
    });
});

describe('Phase 10: Engagement Stats Interface', () => {
    test('EngagementStats interface structure', () => {
        const stats: EngagementStats = {
            activeUsers: 150,
            averageStreak: 4.5,
            atRiskCount: 23,
            topStreak: 45,
        };

        expect(stats.activeUsers).toBe(150);
        expect(stats.averageStreak).toBe(4.5);
        expect(stats.atRiskCount).toBe(23);
        expect(stats.topStreak).toBe(45);
    });

    test('UserEngagement interface structure', () => {
        const user: UserEngagement = {
            userId: 'user-123',
            lastActivity: '2026-01-30',
            totalCopies: 42,
            totalShares: 12,
            currentStreak: 7,
            longestStreak: 21,
            engagementScore: 95.5,
        };

        expect(user.userId).toBe('user-123');
        expect(user.totalCopies).toBe(42);
        expect(user.currentStreak).toBe(7);
        expect(user.engagementScore).toBe(95.5);
    });
});

describe('Phase 10: Ad Tier Gating Logic', () => {
    const TIER = {
        FREE: 0,
        HERO: 1,
        LEGEND: 2,
    };

    function shouldShowAds(userTier: number): boolean {
        return userTier === TIER.FREE;
    }

    test('shouldShowAds returns true for FREE tier', () => {
        expect(shouldShowAds(TIER.FREE)).toBe(true);
    });

    test('shouldShowAds returns false for HERO tier', () => {
        expect(shouldShowAds(TIER.HERO)).toBe(false);
    });

    test('shouldShowAds returns false for LEGEND tier', () => {
        expect(shouldShowAds(TIER.LEGEND)).toBe(false);
    });
});

describe('Phase 10: Consent Logic', () => {
    interface ConsentState {
        analytics: boolean;
        personalization: boolean;
        advertising: boolean;
        version: string;
        timestamp: number;
    }

    function hasAdConsent(consent: ConsentState | null): boolean {
        if (!consent) return false;
        return consent.advertising === true;
    }

    test('hasAdConsent returns false for null consent', () => {
        expect(hasAdConsent(null)).toBe(false);
    });

    test('hasAdConsent returns true when advertising enabled', () => {
        const consent: ConsentState = {
            analytics: true,
            personalization: true,
            advertising: true,
            version: '1.0',
            timestamp: Date.now(),
        };
        expect(hasAdConsent(consent)).toBe(true);
    });

    test('hasAdConsent returns false when advertising disabled', () => {
        const consent: ConsentState = {
            analytics: true,
            personalization: true,
            advertising: false,
            version: '1.0',
            timestamp: Date.now(),
        };
        expect(hasAdConsent(consent)).toBe(false);
    });
});
