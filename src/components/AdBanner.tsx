'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TIER } from '@/lib/types';
import { hasAdConsent } from './ConsentBanner';

// AdSense Publisher ID from environment
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  showUpgradePrompt?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  className = '',
  showUpgradePrompt = true,
}: AdBannerProps) {
  const { user } = useAuth();
  const { trackAd, trackAdClicked, trackUpgradeStart } = useAnalytics();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  const userTier = user?.tier ?? TIER.FREE;
  const isPaidUser = userTier >= TIER.HERO;

  // Don't show ads to paid users
  if (isPaidUser) {
    return null;
  }

  // Don't show if dismissed this session
  if (isDismissed) {
    return null;
  }

  // Check for ad consent
  const hasConsent = hasAdConsent();

  useEffect(() => {
    if (!hasConsent || !ADSENSE_CLIENT || !adSlot) {
      return;
    }

    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => setAdError(true);
      document.head.appendChild(script);
    }

    // Push ad after a brief delay
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);

        // Track impression (only once)
        if (!hasTrackedImpression.current) {
          trackAd(adSlot, 'banner', window.location.pathname);
          hasTrackedImpression.current = true;
        }
      } catch (err) {
        console.error('AdSense error:', err);
        setAdError(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasConsent, adSlot, trackAd]);

  // Handle click tracking
  const handleAdClick = () => {
    trackAdClicked(adSlot, 'banner');
  };

  // Upgrade prompt for going ad-free
  const UpgradePrompt = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center gap-2 text-xs text-base-content/50 mt-2"
    >
      <Sparkles className="w-3 h-3" />
      <button
        onClick={() => trackUpgradeStart(1, 'banner')}
        className="hover:text-primary transition-colors underline-offset-2 hover:underline"
      >
        Go ad-free with Hero
      </button>
    </motion.div>
  );

  // Fallback content if no consent or ad error
  if (!hasConsent || adError || !ADSENSE_CLIENT) {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-base-200/50 to-secondary/5 border border-base-content/5"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-radial from-primary/10 to-transparent blur-2xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-radial from-secondary/10 to-transparent blur-2xl" />
          </div>

          {/* Content */}
          <div className="relative p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base-content mb-1">
              Enjoying Luvora?
            </h3>
            <p className="text-sm text-base-content/60 mb-4 max-w-xs mx-auto">
              Upgrade to Hero for an ad-free experience and exclusive features
            </p>
            <button
              onClick={() => trackUpgradeStart(1, 'banner')}
              className="btn btn-primary btn-sm"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade to Hero
            </button>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Actual AdSense ad
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: adLoaded ? 1 : 0.5 }}
        className="relative"
      >
        {/* Ad container with subtle styling */}
        <div
          ref={adRef}
          onClick={handleAdClick}
          className="relative overflow-hidden rounded-xl border border-base-content/5 bg-base-200/30 min-h-[90px]"
        >
          {/* "Ad" label */}
          <div className="absolute top-1 left-1 z-10">
            <span className="text-[10px] text-base-content/40 bg-base-100/80 px-1.5 py-0.5 rounded">
              Ad
            </span>
          </div>

          {/* AdSense ins element */}
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              minHeight: '90px',
            }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
          />

          {/* Loading state */}
          {!adLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
              <div className="animate-pulse text-base-content/30 text-sm">
                Loading...
              </div>
            </div>
          )}
        </div>

        {/* Upgrade prompt */}
        {showUpgradePrompt && <UpgradePrompt />}
      </motion.div>
    </div>
  );
}

// Interstitial ad component (shown between pages, max once per session)
const INTERSTITIAL_SHOWN_KEY = 'luvora_interstitial_shown';

export function InterstitialAd({
  adSlot,
  onClose,
}: {
  adSlot: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  const userTier = user?.tier ?? TIER.FREE;
  const isPaidUser = userTier >= TIER.HERO;

  useEffect(() => {
    // Check if interstitial already shown this session
    if (sessionStorage.getItem(INTERSTITIAL_SHOWN_KEY)) {
      onClose();
      return;
    }

    // Mark as shown
    sessionStorage.setItem(INTERSTITIAL_SHOWN_KEY, 'true');

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  // Don't show to paid users
  if (isPaidUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-4">
            {/* Close button / countdown */}
            <div className="flex justify-end">
              {canClose ? (
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="badge badge-neutral badge-sm">
                  Close in {countdown}s
                </div>
              )}
            </div>

            {/* Ad content */}
            <AdBanner adSlot={adSlot} adFormat="rectangle" showUpgradePrompt={false} />

            {/* Upgrade CTA */}
            <div className="mt-4 text-center">
              <p className="text-xs text-base-content/50 mb-2">
                Want to skip ads forever?
              </p>
              <button className="btn btn-primary btn-sm">
                <Crown className="w-4 h-4" />
                Upgrade to Hero
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
