'use client';

import { TIER, TIER_NAMES, type TierLevel } from '@/lib/types';
import { Crown, Sparkles } from 'lucide-react';

interface TierBadgeProps {
  tier: TierLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TierBadge({ tier, size = 'md', showLabel = true }: TierBadgeProps) {
  // Free users don't show badge
  if (tier === TIER.FREE) return null;

  const isLegend = tier === TIER.LEGEND;

  const sizeClasses = {
    sm: 'h-6 text-[10px] gap-1 px-2',
    md: 'h-7 text-xs gap-1.5 px-2.5',
    lg: 'h-8 text-sm gap-2 px-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isLegend) {
    return (
      <div className="legend-badge-wrapper">
        <div className={`legend-badge ${sizeClasses[size]}`}>
          <Crown className={`${iconSizes[size]} legend-badge-icon`} />
          {showLabel && (
            <span className="legend-badge-text">{TIER_NAMES[tier]}</span>
          )}
        </div>
      </div>
    );
  }

  // Hero badge
  return (
    <div className="hero-badge-wrapper">
      <div className={`hero-badge ${sizeClasses[size]}`}>
        <Sparkles className={`${iconSizes[size]} hero-badge-icon`} />
        {showLabel && (
          <span className="hero-badge-text">{TIER_NAMES[tier]}</span>
        )}
      </div>
    </div>
  );
}
