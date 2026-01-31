'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, Share2, Zap, Crown } from 'lucide-react';
import { getDailySpark, getPremiumSpark, type DailySpark } from '@/lib/algo';
import { SpecialnessCounter } from './SpecialnessCounter';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { UpgradeModal } from './UpgradeModal';
import { ShareCard } from './ShareCard';
import { AutomationSettings } from './AutomationSettings';
import { RoleSelector } from './RoleSelector';
import { incrementGlobalStats } from '@/actions/stats';
import { trackUserActivity } from '@/actions/engagement';
import { TIER } from '@/lib/types';
import { trackEvent } from '@/lib/metrics';

type Role = 'neutral' | 'masculine' | 'feminine';

// SVG Filter for Electric Effect
function ElectricFilter() {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
      <defs>
        <filter id="electric-turbulence" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="1" result="noise1">
            <animate attributeName="seed" values="1;100;1" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feOffset result="noise1-offset">
            <animate attributeName="dy" values="0;200;0" dur="6s" repeatCount="indefinite" />
          </feOffset>
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="2" result="noise2">
            <animate attributeName="seed" values="2;50;2" dur="3s" repeatCount="indefinite" />
          </feTurbulence>
          <feOffset in="noise2" result="noise2-offset">
            <animate attributeName="dx" values="0;150;0" dur="5s" repeatCount="indefinite" />
          </feOffset>
          <feComposite in="noise1-offset" in2="noise2-offset" operator="arithmetic" k1="0.5" k2="0.5" k3="0" k4="0" result="combined-noise" />
          <feDisplacementMap in="SourceGraphic" in2="combined-noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

// Default fallback spark while loading
const FALLBACK_SPARK: DailySpark = {
  date: new Date().toISOString().split('T')[0],
  nickname: 'love',
  morning: { content: 'Every moment with you is a gift I never knew I needed.', tone: 'romantic' },
  night: { content: 'Sleep well, knowing you are deeply loved.', tone: 'sweet' },
};

export function SparkCard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { trackCopy, trackShare, trackUpgradeModal } = useAnalytics();

  // Per-user data from PocketBase (fixes data isolation bug)
  const partnerName = user?.partner_name || '';
  const role = (user?.recipient_role as Role) || 'neutral';

  // User tier (default to FREE)
  const userTier = user?.tier ?? TIER.FREE;
  const isHeroPlus = userTier >= TIER.HERO;
  const isLegend = userTier === TIER.LEGEND;

  // State for Spark (now async from PocketBase)
  const [spark, setSpark] = useState<DailySpark>(FALLBACK_SPARK);
  const [sparkLoading, setSparkLoading] = useState(true);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAutoSettingsOpen, setIsAutoSettingsOpen] = useState(false);

  // Track tier changes for "Level Up" glow effect
  const prevTierRef = useRef(userTier);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Detect tier upgrade and trigger level-up animation
  useEffect(() => {
    if (userTier > prevTierRef.current) {
      setShowLevelUp(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50, 100, 150]);
      }
      const timer = setTimeout(() => setShowLevelUp(false), 1000);
      return () => clearTimeout(timer);
    }
    prevTierRef.current = userTier;
  }, [userTier]);

  // Effect to handle Spark generation based on tier (now fully async)
  useEffect(() => {
    async function loadSpark() {
      setSparkLoading(true);
      try {
        if (isLegend && user?.id) {
          const premiumSpark = await getPremiumSpark(new Date(), user.id, role);
          setSpark(premiumSpark);
        } else {
          const dailySpark = await getDailySpark(new Date(), role);
          setSpark(dailySpark);
        }
      } catch (error) {
        console.error('Failed to load spark:', error);
        // Keep fallback spark on error
      } finally {
        setSparkLoading(false);
      }
    }
    loadSpark();
  }, [user?.id, user?.recipient_role, user?.tier, isLegend, role]);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isNight = new Date().getHours() >= 18;
  const message = isNight ? spark.night : spark.morning;
  const displayNickname = partnerName || spark.nickname;

  const handleCopy = async () => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 50, 15, 30, 80]);
    }
    const textToCopy = `${message.content}\n\n— For ${displayNickname}`;

    // Clipboard API with fallback for HTTP/older browsers
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback: create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }

    try {
      await incrementGlobalStats();
      // Track analytics event
      trackCopy(isNight ? 'night' : 'morning', message.tone, message.rarity);
      // Track user engagement for streaks
      if (user?.id) {
        await trackUserActivity(user.id, 'copy');
        trackEvent.dailyActiveUser(user.id, isLegend ? 'legend' : isHeroPlus ? 'hero' : 'free');
      }
      // Track Sentry metrics
      trackEvent.sparkCopied(
        isLegend ? 'legend' : isHeroPlus ? 'hero' : 'free',
        isNight ? 'night' : 'morning'
      );
    } catch (err) {
      console.error("Failed to increment stats", err);
    }
  };

  const handleShareClick = async () => {
    trackShare('card');
    // Track user engagement for shares
    if (user?.id) {
      try {
        await trackUserActivity(user.id, 'share');
      } catch (err) {
        console.error("Failed to track share", err);
      }
    }
    // Track Sentry metrics
    trackEvent.streakShared(
      isLegend ? 'legend' : isHeroPlus ? 'hero' : 'free',
      'card'
    );
    setIsShareOpen(true);
  };

  const handleUpgradeClick = () => {
    trackUpgradeModal('spark_card');
    // Track Sentry metrics
    trackEvent.upgradeStarted(
      userTier === TIER.FREE ? 'free' : 'hero',
      userTier === TIER.FREE ? 'hero' : 'legend'
    );
    setIsUpgradeOpen(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.3 } },
  };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  if (!mounted) {
    return (
      <div className="card w-full max-w-md bg-base-100 shadow-xl opacity-50 animate-pulse h-96 mx-auto"></div>
    );
  }

  // Card content (shared across all tiers)
  const cardContent = (
    <div className="card-body items-center text-center p-8 sm:p-10 relative">
      <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${
        isLegend ? 'from-yellow-400/20' : isHeroPlus ? 'from-primary/15' : 'from-primary/10'
      } to-transparent pointer-events-none`} />

      <div className="mb-6 z-20">
        <RoleSelector />
      </div>

      <motion.div
        key={message.content}
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-8 min-h-[120px] flex items-center justify-center"
      >
        {sparkLoading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="text-sm text-base-content/60">Generating your spark...</span>
          </div>
        ) : (
          <div className="text-center">
            {message.content.split(" ").map((word, i) => (
              <motion.span key={i} variants={item} className="inline-block mr-1 text-2xl sm:text-3xl font-serif leading-tight text-base-content">
                {word}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm font-medium text-base-content mb-8 inline-block px-2">
        For {displayNickname || 'favorite human'}
      </motion.p>

      <button
        onClick={handleShareClick}
        className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200"
        title="Share Streak"
      >
        <Share2 size={20} strokeWidth={2} />
      </button>

      <div className="card-actions w-full justify-center flex-col items-center gap-3">
        <button
          onClick={handleCopy}
          className={`btn btn-lg w-full sm:w-auto shadow-lg group relative overflow-hidden transition-all duration-200 ${
            isLegend
              ? 'gradient-gold text-base-100 animate-pulse-gold-glow hover:scale-[1.02]'
              : 'btn-primary animate-pulse-glow hover:scale-[1.02]'
          } ${copied ? '!shadow-none !animate-none' : ''}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {copied ? <Heart size={24} strokeWidth={2} className="fill-current animate-float" /> : <Copy size={24} strokeWidth={2} />}
            {copied ? "Sent to Heart!" : "Copy Spark"}
          </span>
          {!copied && (
            <span className="absolute inset-0 overflow-hidden rounded-btn">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </span>
          )}
        </button>

        {userTier === TIER.FREE && (
          <button
            onClick={handleUpgradeClick}
            className="premium-cta-wrapper group mt-2"
          >
            <div className="premium-cta-glow" />
            <div className="premium-cta-content">
              <span className="premium-cta-subtitle">
                Want to be the only one?
              </span>
              <span className="premium-cta-main">
                Get a One-of-a-Kind Spark
              </span>
            </div>
          </button>
        )}

        {userTier === TIER.HERO && (
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setIsAutoSettingsOpen(true)} className="btn btn-ghost btn-xs opacity-60 hover:opacity-100">
              <Zap className="w-3 h-3 mr-1" /> Configure Automation
            </button>
            <button onClick={handleUpgradeClick} className="btn btn-ghost btn-xs text-warning/70 hover:text-warning">
              <Crown className="w-3 h-3 mr-1" /> Unlock 1-of-1 Exclusivity
            </button>
          </div>
        )}

        {isLegend && (
          <button onClick={() => setIsAutoSettingsOpen(true)} className="btn btn-ghost btn-xs opacity-50 hover:opacity-100 mt-2">
            <Zap className="w-3 h-3 mr-1" /> Configure Automation
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full px-4 relative">
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      {isShareOpen && <ShareCard onClose={() => setIsShareOpen(false)} userTier={userTier} />}
      {isAutoSettingsOpen && <AutomationSettings onClose={() => setIsAutoSettingsOpen(false)} />}

      {/* SVG Filter for Legend Electric Effect */}
      {isLegend && <ElectricFilter />}

      {/* TIER-BASED CARD WRAPPER */}
      <div className="relative w-full max-w-md">
        {/* Legend: Electric Border with SVG Turbulence */}
        {isLegend && (
          <>
            {/* Background glow */}
            <div className="legend-bg-glow" />
            {/* Outer glow layer */}
            <div className="legend-glow-outer" />
            {/* Inner glow layer */}
            <div className="legend-glow-inner" />
            {/* Electric border with filter */}
            <div className="legend-electric-border" />
          </>
        )}

        {/* Border wrapper for Hero tier */}
        <div className={`relative transition-all duration-500 ${
          isLegend
            ? `legend-card-wrapper ${showLevelUp ? 'animate-level-up' : ''}`
            : isHeroPlus
              ? `hero-border-wrapper ${showLevelUp ? 'animate-level-up' : ''}`
              : ''
        }`}>
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`card w-full bg-base-100 shadow-2xl overflow-hidden ${
              isLegend
                ? 'rounded-[22px] relative z-10'
                : isHeroPlus
                  ? 'rounded-[calc(1.5rem-2px)]'
                  : 'rounded-3xl border border-base-content/10'
            }`}
          >
            {cardContent}
          </motion.div>
        </div>
      </div>

      <SpecialnessCounter />

      {copied && (
        <div className="toast toast-bottom toast-center z-50 safe-area-inset-bottom">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="alert alert-success shadow-xl border border-success/20"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-medium">Spark ready for {displayNickname}!</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
