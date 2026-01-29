import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { TIER } from '../../src/lib/types';
import React from 'react';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock user state
let mockUser: { id: string; email: string; tier: number } | null = null;

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockUser,
        pb: {},
    }),
}));

// Import components after mocks
import { TierGate, HeroGate, LegendGate } from '../../src/components/guards/TierGate';
import { PremiumGuard, AuthGuard, AdminGuard } from '../../src/components/guards/PremiumGuard';

describe('TierGate Component', () => {
    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test('renders children when user tier meets minimum requirement', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.HERO };

        render(
            <TierGate minTier={TIER.HERO}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        expect(screen.getByTestId('protected-content')).toBeTruthy();
    });

    test('renders children when user tier exceeds minimum requirement', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.LEGEND };

        render(
            <TierGate minTier={TIER.HERO}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        expect(screen.getByTestId('protected-content')).toBeTruthy();
    });

    test('renders lock UI when user tier is below minimum', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <TierGate minTier={TIER.HERO}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByText('Hero Feature')).toBeTruthy();
        expect(screen.getByText('View Plans')).toBeTruthy();
    });

    test('renders Legend lock UI for Legend-only features', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.HERO };

        render(
            <TierGate minTier={TIER.LEGEND}>
                <div data-testid="protected-content">Legend Content</div>
            </TierGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByText('Legend Feature')).toBeTruthy();
    });

    test('renders custom fallback when provided', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <TierGate minTier={TIER.HERO} fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByTestId('custom-fallback')).toBeTruthy();
    });

    test('renders blurred preview when blur prop is true', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <TierGate minTier={TIER.HERO} blur={true}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        // Content should be in DOM but blurred
        expect(screen.getByTestId('protected-content')).toBeTruthy();
        expect(screen.getByText(/Upgrade to Hero/)).toBeTruthy();
    });

    test('handles null user (not logged in) as FREE tier', () => {
        mockUser = null;

        render(
            <TierGate minTier={TIER.HERO}>
                <div data-testid="protected-content">Hero Content</div>
            </TierGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByText('Hero Feature')).toBeTruthy();
    });
});

describe('HeroGate Helper', () => {
    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    test('allows HERO tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.HERO };

        render(
            <HeroGate>
                <div data-testid="hero-content">Hero Only</div>
            </HeroGate>
        );

        expect(screen.getByTestId('hero-content')).toBeTruthy();
    });

    test('allows LEGEND tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.LEGEND };

        render(
            <HeroGate>
                <div data-testid="hero-content">Hero Only</div>
            </HeroGate>
        );

        expect(screen.getByTestId('hero-content')).toBeTruthy();
    });

    test('blocks FREE tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <HeroGate>
                <div data-testid="hero-content">Hero Only</div>
            </HeroGate>
        );

        expect(screen.queryByTestId('hero-content')).toBeNull();
    });
});

describe('LegendGate Helper', () => {
    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    test('allows LEGEND tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.LEGEND };

        render(
            <LegendGate>
                <div data-testid="legend-content">Legend Only</div>
            </LegendGate>
        );

        expect(screen.getByTestId('legend-content')).toBeTruthy();
    });

    test('blocks HERO tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.HERO };

        render(
            <LegendGate>
                <div data-testid="legend-content">Legend Only</div>
            </LegendGate>
        );

        expect(screen.queryByTestId('legend-content')).toBeNull();
    });

    test('blocks FREE tier users', () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <LegendGate>
                <div data-testid="legend-content">Legend Only</div>
            </LegendGate>
        );

        expect(screen.queryByTestId('legend-content')).toBeNull();
    });
});

describe('AuthGuard Component', () => {
    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    test('shows loading spinner initially when no user', () => {
        render(
            <AuthGuard>
                <div data-testid="protected-content">Protected</div>
            </AuthGuard>
        );

        // Should show loading initially (before client-side check)
        expect(screen.queryByTestId('protected-content')).toBeNull();
    });

    test('renders children when user is logged in', async () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <AuthGuard>
                <div data-testid="protected-content">Protected</div>
            </AuthGuard>
        );

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeTruthy();
        }, { timeout: 2000 });
    });
});

describe('AdminGuard Component', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
        process.env = { ...originalEnv };
    });

    test('shows access denied for non-admin users', async () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.LEGEND };
        process.env.NEXT_PUBLIC_ADMIN_UUIDS = 'admin-uuid-1,admin-uuid-2';
        process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'admin@test.com';

        render(
            <AdminGuard>
                <div data-testid="admin-content">Admin Only</div>
            </AdminGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Access Denied')).toBeTruthy();
        }, { timeout: 2000 });
    });

    test('renders children for admin user by ID', async () => {
        mockUser = { id: 'admin-uuid-1', email: 'test@test.com', tier: TIER.FREE };
        process.env.NEXT_PUBLIC_ADMIN_UUIDS = 'admin-uuid-1,admin-uuid-2';

        render(
            <AdminGuard>
                <div data-testid="admin-content">Admin Only</div>
            </AdminGuard>
        );

        await waitFor(() => {
            expect(screen.getByTestId('admin-content')).toBeTruthy();
        }, { timeout: 2000 });
    });

    test('renders children for admin user by email', async () => {
        mockUser = { id: 'user-1', email: 'admin@test.com', tier: TIER.FREE };
        process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'admin@test.com,admin2@test.com';

        render(
            <AdminGuard>
                <div data-testid="admin-content">Admin Only</div>
            </AdminGuard>
        );

        await waitFor(() => {
            expect(screen.getByTestId('admin-content')).toBeTruthy();
        }, { timeout: 2000 });
    });
});

describe('PremiumGuard Component', () => {
    beforeEach(() => {
        mockUser = null;
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    test('shows premium lock for free users', async () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <PremiumGuard>
                <div data-testid="premium-content">Premium Only</div>
            </PremiumGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Premium Feature')).toBeTruthy();
        }, { timeout: 2000 });
    });

    test('shows custom fallback when provided', async () => {
        mockUser = { id: 'user-1', email: 'test@test.com', tier: TIER.FREE };

        render(
            <PremiumGuard fallback={<div data-testid="custom-fallback">Upgrade Please</div>}>
                <div data-testid="premium-content">Premium Only</div>
            </PremiumGuard>
        );

        await waitFor(() => {
            expect(screen.getByTestId('custom-fallback')).toBeTruthy();
        }, { timeout: 2000 });
    });
});
