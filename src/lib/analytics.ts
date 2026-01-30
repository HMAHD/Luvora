/**
 * Google Analytics 4 Event Tracking
 * Centralized analytics functions for Luvora
 */

// GA4 Measurement ID - set via environment variable
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Type definitions for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Check if analytics is available
export const isAnalyticsEnabled = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof window.gtag === 'function' &&
         !!GA_MEASUREMENT_ID;
};

/**
 * Core event tracking function
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', eventName, {
    ...parameters,
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// SPARK EVENTS
// ============================================

export const trackSparkCopied = (params: {
  sparkType: 'morning' | 'night';
  tone?: string;
  rarity?: string;
  userTier: number;
}): void => {
  trackEvent('spark_copied', {
    spark_type: params.sparkType,
    tone: params.tone || 'unknown',
    rarity: params.rarity || 'common',
    user_tier: params.userTier,
    event_category: 'engagement',
  });
};

export const trackSparkShared = (params: {
  shareMethod: 'card' | 'direct' | 'social';
  platform?: string;
  userTier: number;
}): void => {
  trackEvent('spark_shared', {
    share_method: params.shareMethod,
    platform: params.platform || 'unknown',
    user_tier: params.userTier,
    event_category: 'engagement',
  });
};

export const trackSparkViewed = (params: {
  sparkType: 'morning' | 'night';
  userTier: number;
  isFirstView: boolean;
}): void => {
  trackEvent('spark_viewed', {
    spark_type: params.sparkType,
    user_tier: params.userTier,
    is_first_view: params.isFirstView,
    event_category: 'engagement',
  });
};

// ============================================
// UPGRADE & CONVERSION EVENTS
// ============================================

export const trackUpgradeStarted = (params: {
  fromTier: number;
  toTier: number;
  source: 'banner' | 'modal' | 'pricing_page' | 'feature_gate';
}): void => {
  trackEvent('upgrade_started', {
    from_tier: params.fromTier,
    to_tier: params.toTier,
    source: params.source,
    event_category: 'conversion',
  });
};

export const trackUpgradeCompleted = (params: {
  fromTier: number;
  toTier: number;
  planType: 'hero' | 'legend';
  value?: number;
}): void => {
  trackEvent('upgrade_completed', {
    from_tier: params.fromTier,
    to_tier: params.toTier,
    plan_type: params.planType,
    value: params.value,
    currency: 'USD',
    event_category: 'conversion',
  });

  // Also track as a conversion goal
  trackEvent('purchase', {
    transaction_id: `upgrade_${Date.now()}`,
    value: params.value,
    currency: 'USD',
    items: [{
      item_name: params.planType === 'hero' ? 'Hero Plan' : 'Legend Plan',
      price: params.value,
    }],
  });
};

export const trackUpgradeModalOpened = (params: {
  userTier: number;
  trigger: string;
}): void => {
  trackEvent('upgrade_modal_opened', {
    user_tier: params.userTier,
    trigger: params.trigger,
    event_category: 'conversion',
  });
};

// ============================================
// AUTOMATION EVENTS
// ============================================

export const trackAutomationEnabled = (params: {
  platform: 'telegram' | 'whatsapp';
  userTier: number;
}): void => {
  trackEvent('automation_enabled', {
    platform: params.platform,
    user_tier: params.userTier,
    event_category: 'feature',
  });
};

export const trackAutomationDisabled = (params: {
  platform: 'telegram' | 'whatsapp';
  userTier: number;
}): void => {
  trackEvent('automation_disabled', {
    platform: params.platform,
    user_tier: params.userTier,
    event_category: 'feature',
  });
};

export const trackAutomationDelivered = (params: {
  platform: 'telegram' | 'whatsapp';
  status: 'success' | 'failed';
}): void => {
  trackEvent('automation_delivered', {
    platform: params.platform,
    status: params.status,
    event_category: 'feature',
  });
};

// ============================================
// USER ENGAGEMENT EVENTS
// ============================================

export const trackPageView = (params: {
  pagePath: string;
  pageTitle: string;
  userTier?: number;
}): void => {
  trackEvent('page_view', {
    page_path: params.pagePath,
    page_title: params.pageTitle,
    user_tier: params.userTier ?? 0,
    event_category: 'navigation',
  });
};

export const trackFeatureUsed = (params: {
  featureName: string;
  userTier: number;
  details?: Record<string, unknown>;
}): void => {
  trackEvent('feature_used', {
    feature_name: params.featureName,
    user_tier: params.userTier,
    ...params.details,
    event_category: 'engagement',
  });
};

export const trackArchiveViewed = (params: {
  daysShown: number;
  userTier: number;
}): void => {
  trackEvent('archive_viewed', {
    days_shown: params.daysShown,
    user_tier: params.userTier,
    event_category: 'engagement',
  });
};

export const trackFavoriteAdded = (params: {
  sparkDate: string;
  userTier: number;
}): void => {
  trackEvent('favorite_added', {
    spark_date: params.sparkDate,
    user_tier: params.userTier,
    event_category: 'engagement',
  });
};

// ============================================
// AD EVENTS
// ============================================

export const trackAdImpression = (params: {
  adUnit: string;
  adPosition: 'banner' | 'interstitial' | 'sidebar';
  pageLocation: string;
}): void => {
  trackEvent('ad_impression', {
    ad_unit: params.adUnit,
    ad_position: params.adPosition,
    page_location: params.pageLocation,
    event_category: 'monetization',
  });
};

export const trackAdClick = (params: {
  adUnit: string;
  adPosition: 'banner' | 'interstitial' | 'sidebar';
}): void => {
  trackEvent('ad_click', {
    ad_unit: params.adUnit,
    ad_position: params.adPosition,
    event_category: 'monetization',
  });
};

// ============================================
// AUTHENTICATION EVENTS
// ============================================

export const trackSignUp = (params: {
  method: 'email' | 'google' | 'github';
}): void => {
  trackEvent('sign_up', {
    method: params.method,
    event_category: 'authentication',
  });
};

export const trackLogin = (params: {
  method: 'email' | 'google' | 'github';
}): void => {
  trackEvent('login', {
    method: params.method,
    event_category: 'authentication',
  });
};

// ============================================
// USER PROPERTIES
// ============================================

export const setUserProperties = (params: {
  userId?: string;
  userTier: number;
  hasAutomation: boolean;
  loveLanguage?: string;
  preferredTone?: string;
}): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag('set', 'user_properties', {
    user_tier: params.userTier,
    tier_name: params.userTier === 0 ? 'free' : params.userTier === 1 ? 'hero' : 'legend',
    has_automation: params.hasAutomation,
    love_language: params.loveLanguage || 'not_set',
    preferred_tone: params.preferredTone || 'not_set',
  });

  if (params.userId) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: params.userId,
    });
  }
};

// ============================================
// ECOMMERCE TRACKING
// ============================================

export const trackViewItem = (params: {
  itemId: string;
  itemName: string;
  price: number;
}): void => {
  trackEvent('view_item', {
    currency: 'USD',
    value: params.price,
    items: [{
      item_id: params.itemId,
      item_name: params.itemName,
      price: params.price,
    }],
  });
};

export const trackBeginCheckout = (params: {
  planType: 'hero' | 'legend';
  value: number;
}): void => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: params.value,
    items: [{
      item_id: params.planType,
      item_name: params.planType === 'hero' ? 'Hero Plan' : 'Legend Plan',
      price: params.value,
    }],
  });
};
