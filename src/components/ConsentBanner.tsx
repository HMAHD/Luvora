'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, Check } from 'lucide-react';

const CONSENT_KEY = 'luvora_ad_consent';
const CONSENT_VERSION = '1.0';

interface ConsentState {
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
  version: string;
  timestamp: number;
}

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    analytics: true,
    personalization: true,
    advertising: true,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  });

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState;
        // Show banner again if version changed
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      // First visit - show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (fullConsent: boolean) => {
    const consentState: ConsentState = fullConsent
      ? { ...consent, timestamp: Date.now() }
      : {
          analytics: consent.analytics,
          personalization: consent.personalization,
          advertising: consent.advertising,
          version: CONSENT_VERSION,
          timestamp: Date.now(),
        };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentState));

    // Update Google consent mode if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consentState.analytics ? 'granted' : 'denied',
        ad_storage: consentState.advertising ? 'granted' : 'denied',
        ad_personalization: consentState.personalization ? 'granted' : 'denied',
        ad_user_data: consentState.advertising ? 'granted' : 'denied',
      });
    }

    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    setConsent({
      analytics: true,
      personalization: true,
      advertising: true,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    });
    saveConsent(true);
  };

  const handleDeclineAll = () => {
    setConsent({
      analytics: false,
      personalization: false,
      advertising: false,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    });
    saveConsent(false);
  };

  const handleSavePreferences = () => {
    saveConsent(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-inset-bottom"
      >
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-2xl border border-base-content/10">
            <div className="card-body p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">Privacy & Cookies</h3>
                    <p className="text-xs text-base-content/60">We respect your privacy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-base-content/70 mt-3">
                We use cookies to enhance your experience, show personalized ads to free users,
                and analyze site traffic. You can customize your preferences below.
              </p>

              {/* Expandable Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 mt-4 pt-4 border-t border-base-content/10">
                      {/* Analytics */}
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-success" />
                          <div>
                            <span className="text-sm font-medium">Analytics</span>
                            <p className="text-xs text-base-content/50">Help us improve Luvora</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={consent.analytics}
                          onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                        />
                      </label>

                      {/* Personalization */}
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-info" />
                          <div>
                            <span className="text-sm font-medium">Personalization</span>
                            <p className="text-xs text-base-content/50">Tailor content to your preferences</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={consent.personalization}
                          onChange={(e) => setConsent({ ...consent, personalization: e.target.checked })}
                        />
                      </label>

                      {/* Advertising */}
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-warning" />
                          <div>
                            <span className="text-sm font-medium">Advertising</span>
                            <p className="text-xs text-base-content/50">Show relevant ads (free tier only)</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={consent.advertising}
                          onChange={(e) => setConsent({ ...consent, advertising: e.target.checked })}
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="btn btn-ghost btn-sm"
                >
                  {showDetails ? 'Hide Details' : 'Customize'}
                </button>
                <div className="flex-1" />
                {showDetails ? (
                  <button
                    onClick={handleSavePreferences}
                    className="btn btn-primary btn-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save Preferences
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDeclineAll}
                      className="btn btn-ghost btn-sm"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="btn btn-primary btn-sm"
                    >
                      Accept All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Utility function to check consent status
export function hasAdConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;

    const consent = JSON.parse(stored) as ConsentState;
    return consent.advertising === true;
  } catch {
    return false;
  }
}
