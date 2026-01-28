'use client';

import { useAuth } from '@/hooks/useAuth';
import { TIER, type TierLevel, TIER_NAMES } from '@/lib/types';
import { Lock, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';

interface TierGateProps {
  children: React.ReactNode;
  minTier: TierLevel;
  fallback?: React.ReactNode;
  blur?: boolean; // Show blurred preview instead of lock
}

/**
 * TierGate - Conditional rendering based on user tier
 * Wraps content that should only be accessible to specific tier levels
 */
export function TierGate({ children, minTier, fallback, blur = false }: TierGateProps) {
  const { user } = useAuth();

  // Default tier to FREE if not set
  const userTier = user?.tier ?? TIER.FREE;

  if (userTier >= minTier) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Blurred preview mode
  if (blur) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-base-100/50 backdrop-blur-[2px] rounded-2xl">
          <Link href="/pricing" className="btn btn-primary btn-sm gap-2">
            {minTier === TIER.LEGEND ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            Upgrade to {TIER_NAMES[minTier]}
          </Link>
        </div>
      </div>
    );
  }

  // Default lock UI
  const tierIcon = minTier === TIER.LEGEND ? (
    <Crown className="w-8 h-8 text-warning" />
  ) : (
    <Sparkles className="w-8 h-8 text-primary" />
  );

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-base-200 rounded-2xl border border-base-content/10">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        minTier === TIER.LEGEND ? 'bg-warning/10' : 'bg-primary/10'
      }`}>
        {tierIcon}
      </div>
      <h3 className="text-xl font-bold text-base-content mb-2">
        {TIER_NAMES[minTier]} Feature
      </h3>
      <p className="text-base-content/60 mb-6 max-w-sm">
        {minTier === TIER.LEGEND
          ? 'This exclusive feature is available for Legend members only.'
          : 'Upgrade to Hero to unlock this feature and more.'}
      </p>
      <Link href="/pricing" className="btn btn-primary gap-2">
        <Sparkles className="w-4 h-4" />
        View Plans
      </Link>
    </div>
  );
}

/**
 * Quick tier check helpers
 */
export function HeroGate({ children, fallback, blur }: Omit<TierGateProps, 'minTier'>) {
  return <TierGate minTier={TIER.HERO} fallback={fallback} blur={blur}>{children}</TierGate>;
}

export function LegendGate({ children, fallback, blur }: Omit<TierGateProps, 'minTier'>) {
  return <TierGate minTier={TIER.LEGEND} fallback={fallback} blur={blur}>{children}</TierGate>;
}
