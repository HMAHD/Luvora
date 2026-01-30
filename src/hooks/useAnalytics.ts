'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  trackSparkCopied,
  trackSparkShared,
  trackSparkViewed,
  trackUpgradeStarted,
  trackUpgradeModalOpened,
  trackAutomationEnabled,
  trackAutomationDisabled,
  trackFeatureUsed,
  trackArchiveViewed,
  trackFavoriteAdded,
  trackAdImpression,
  trackAdClick,
  setUserProperties,
} from '@/lib/analytics';

/**
 * Custom hook for analytics tracking with user context
 */
export function useAnalytics() {
  const { user } = useAuth();
  const userTier = user?.tier ?? 0;
  const hasSetProperties = useRef(false);

  // Set user properties when user changes
  useEffect(() => {
    if (user && !hasSetProperties.current) {
      setUserProperties({
        userId: user.id,
        userTier: user.tier ?? 0,
        hasAutomation: !!(user.messaging_platform && user.messaging_id),
        loveLanguage: user.love_language,
        preferredTone: user.preferred_tone,
      });
      hasSetProperties.current = true;
    }
  }, [user]);

  // Reset properties ref when user changes
  useEffect(() => {
    hasSetProperties.current = false;
  }, [user?.id]);

  // Spark events
  const trackCopy = useCallback((sparkType: 'morning' | 'night', tone?: string, rarity?: string) => {
    trackSparkCopied({ sparkType, tone, rarity, userTier });
  }, [userTier]);

  const trackShare = useCallback((shareMethod: 'card' | 'direct' | 'social', platform?: string) => {
    trackSparkShared({ shareMethod, platform, userTier });
  }, [userTier]);

  const trackView = useCallback((sparkType: 'morning' | 'night', isFirstView: boolean = false) => {
    trackSparkViewed({ sparkType, userTier, isFirstView });
  }, [userTier]);

  // Upgrade events
  const trackUpgradeStart = useCallback((toTier: number, source: 'banner' | 'modal' | 'pricing_page' | 'feature_gate') => {
    trackUpgradeStarted({ fromTier: userTier, toTier, source });
  }, [userTier]);

  const trackUpgradeModal = useCallback((trigger: string) => {
    trackUpgradeModalOpened({ userTier, trigger });
  }, [userTier]);

  // Automation events
  const trackAutomationOn = useCallback((platform: 'telegram' | 'whatsapp') => {
    trackAutomationEnabled({ platform, userTier });
  }, [userTier]);

  const trackAutomationOff = useCallback((platform: 'telegram' | 'whatsapp') => {
    trackAutomationDisabled({ platform, userTier });
  }, [userTier]);

  // Feature events
  const trackFeature = useCallback((featureName: string, details?: Record<string, unknown>) => {
    trackFeatureUsed({ featureName, userTier, details });
  }, [userTier]);

  const trackArchive = useCallback((daysShown: number) => {
    trackArchiveViewed({ daysShown, userTier });
  }, [userTier]);

  const trackFavorite = useCallback((sparkDate: string) => {
    trackFavoriteAdded({ sparkDate, userTier });
  }, [userTier]);

  // Ad events
  const trackAd = useCallback((adUnit: string, adPosition: 'banner' | 'interstitial' | 'sidebar', pageLocation: string) => {
    trackAdImpression({ adUnit, adPosition, pageLocation });
  }, []);

  const trackAdClicked = useCallback((adUnit: string, adPosition: 'banner' | 'interstitial' | 'sidebar') => {
    trackAdClick({ adUnit, adPosition });
  }, []);

  return {
    userTier,
    // Spark tracking
    trackCopy,
    trackShare,
    trackView,
    // Upgrade tracking
    trackUpgradeStart,
    trackUpgradeModal,
    // Automation tracking
    trackAutomationOn,
    trackAutomationOff,
    // Feature tracking
    trackFeature,
    trackArchive,
    trackFavorite,
    // Ad tracking
    trackAd,
    trackAdClicked,
  };
}
