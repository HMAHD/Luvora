'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart3, DollarSign, Save, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface AnalyticsConfig {
  ga_measurement_id: string;
  ga_api_secret: string;
  adsense_client_id: string;
  adsense_slot_banner: string;
  adsense_slot_interstitial: string;
  ads_enabled: boolean;
}

export function AnalyticsSettings() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    ga_measurement_id: '',
    ga_api_secret: '',
    adsense_client_id: '',
    adsense_slot_banner: '',
    adsense_slot_interstitial: '',
    ads_enabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from environment variables (read-only display)
  useEffect(() => {
    setConfig({
      ga_measurement_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      ga_api_secret: process.env.GA_API_SECRET ? '••••••••' : '',
      adsense_client_id: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
      adsense_slot_banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || '',
      adsense_slot_interstitial: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL || '',
      ads_enabled: !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // In production, these would be saved to environment or a settings collection
    // For now, just show success
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isConfigured = (value: string) => value && value.length > 0 && value !== '••••••••';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-base-content">Analytics & Ads Settings</h2>
          <p className="text-sm text-base-content/60">Configure tracking and monetization</p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info">
        <AlertCircle className="w-5 h-5" />
        <div>
          <h3 className="font-bold">Environment Variables</h3>
          <p className="text-sm">These settings are configured via environment variables in your deployment. Update your <code className="bg-base-300 px-1 rounded">.env.local</code> file and redeploy to apply changes.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Google Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 border border-base-content/10"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base-content">Google Analytics 4</h3>
                <p className="text-xs text-base-content/60">Track user behavior and conversions</p>
              </div>
              {isConfigured(config.ga_measurement_id) && (
                <span className="badge badge-success badge-sm ml-auto gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Measurement ID</span>
                  <a
                    href="https://analytics.google.com/analytics/web/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-text-alt link link-primary flex items-center gap-1"
                  >
                    Get ID <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  className="input input-bordered input-sm"
                  value={config.ga_measurement_id}
                  onChange={(e) => setConfig({ ...config, ga_measurement_id: e.target.value })}
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Set via: NEXT_PUBLIC_GA_MEASUREMENT_ID
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">API Secret (Server-side)</span>
                </label>
                <input
                  type="password"
                  placeholder="Your GA4 API Secret"
                  className="input input-bordered input-sm"
                  value={config.ga_api_secret}
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Set via: GA_API_SECRET (server-side only)
                  </span>
                </label>
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="text-sm text-base-content/70">
              <p className="font-medium mb-2">Events Being Tracked:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Spark copied / shared</li>
                <li>Upgrade started / completed</li>
                <li>Automation enabled / disabled</li>
                <li>Page views and user properties</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Google AdSense Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-100 border border-base-content/10"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base-content">Google AdSense</h3>
                <p className="text-xs text-base-content/60">Monetize free tier users</p>
              </div>
              {isConfigured(config.adsense_client_id) && (
                <span className="badge badge-success badge-sm ml-auto gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Publisher ID</span>
                  <a
                    href="https://www.google.com/adsense/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-text-alt link link-primary flex items-center gap-1"
                  >
                    Get ID <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXX"
                  className="input input-bordered input-sm"
                  value={config.adsense_client_id}
                  onChange={(e) => setConfig({ ...config, adsense_client_id: e.target.value })}
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Set via: NEXT_PUBLIC_ADSENSE_CLIENT
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Banner Ad Slot</span>
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  className="input input-bordered input-sm"
                  value={config.adsense_slot_banner}
                  onChange={(e) => setConfig({ ...config, adsense_slot_banner: e.target.value })}
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Set via: NEXT_PUBLIC_ADSENSE_SLOT_BANNER
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Interstitial Ad Slot</span>
                </label>
                <input
                  type="text"
                  placeholder="0987654321"
                  className="input input-bordered input-sm"
                  value={config.adsense_slot_interstitial}
                  onChange={(e) => setConfig({ ...config, adsense_slot_interstitial: e.target.value })}
                  readOnly
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Set via: NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL
                  </span>
                </label>
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="text-sm text-base-content/70">
              <p className="font-medium mb-2">Ad Behavior:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Ads only shown to Free tier users</li>
                <li>Hero and Legend users see no ads</li>
                <li>Upgrade CTA shown if AdSense unavailable</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Environment Variables Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-200"
      >
        <div className="card-body">
          <h3 className="font-semibold text-base-content mb-3">Environment Variables Reference</h3>
          <div className="mockup-code text-xs">
            <pre data-prefix="1"><code># Google Analytics 4</code></pre>
            <pre data-prefix="2"><code>NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code></pre>
            <pre data-prefix="3"><code>GA_API_SECRET=your-api-secret</code></pre>
            <pre data-prefix="4"><code></code></pre>
            <pre data-prefix="5"><code># Google AdSense</code></pre>
            <pre data-prefix="6"><code>NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX</code></pre>
            <pre data-prefix="7"><code>NEXT_PUBLIC_ADSENSE_SLOT_BANNER=1234567890</code></pre>
            <pre data-prefix="8"><code>NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL=0987654321</code></pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
