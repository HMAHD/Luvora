'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/PremiumGuard';
import { HeroGate, LegendGate } from '@/components/guards/TierGate';
import { TierBadge } from '@/components/TierBadge';
import { LoveLanguageQuiz } from '@/components/LoveLanguageQuiz';
import { ToneSelector } from '@/components/ToneSelector';
import { CountdownWidget, CountdownWidgetMini } from '@/components/CountdownWidget';
import { SparkArchive } from '@/components/SparkArchive';
import { PartnerLink } from '@/components/PartnerLink';
import { DeveloperIntegrations } from '@/components/DeveloperIntegrations';
import { TIER, TIER_NAMES, LOVE_LANGUAGE_NAMES, type LoveLanguage } from '@/lib/types';
import {
  User,
  Clock,
  Heart,
  Flame,
  Calendar,
  Settings,
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  MessageCircle,
  Cake,
  Gift,
  MessageCircleHeart,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { getDailySpark } from '@/lib/algo';

type Role = 'neutral' | 'masculine' | 'feminine';

// Inline Automation Tab Component
function AutomationTabContent({
  user,
  userTier,
  pb
}: {
  user: ReturnType<typeof useAuth>['user'];
  userTier: number;
  pb: ReturnType<typeof useAuth>['pb'];
}) {
  const [morningEnabled, setMorningEnabled] = useState(user?.morning_enabled ?? false);
  const [morningTime, setMorningTime] = useState(user?.morning_time || '08:00');
  const [eveningEnabled, setEveningEnabled] = useState(user?.evening_enabled ?? false);
  const [eveningTime, setEveningTime] = useState(user?.evening_time || '20:00');
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>(user?.messaging_platform || 'telegram');
  const [msgId, setMsgId] = useState(user?.messaging_id || '');
  const [loveLanguage, setLoveLanguage] = useState(user?.love_language || '');
  const [preferredTone, setPreferredTone] = useState(user?.preferred_tone || '');
  const [specialOccasionsEnabled, setSpecialOccasionsEnabled] = useState(user?.special_occasions_enabled ?? true);
  const [anniversaryDate, setAnniversaryDate] = useState(user?.anniversary_date || '');
  const [partnerBirthday, setPartnerBirthday] = useState(user?.partner_birthday || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLegend = userTier >= TIER.LEGEND;

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const updateData: Record<string, unknown> = {
        messaging_platform: platform,
        messaging_id: msgId,
        timezone,
        morning_enabled: morningEnabled,
        morning_time: morningTime,
        evening_enabled: eveningEnabled,
        evening_time: eveningTime,
      };

      if (isLegend) {
        updateData.love_language = loveLanguage || null;
        updateData.preferred_tone = preferredTone || null;
        updateData.special_occasions_enabled = specialOccasionsEnabled;
        updateData.anniversary_date = anniversaryDate || null;
        updateData.partner_birthday = partnerBirthday || null;
      }

      await pb.collection('users').update(user.id, updateData);
      await pb.collection('users').authRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save automation:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Channel Card */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5">
        <div className="card-body">
          <h2 className="card-title text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Delivery Channel
          </h2>
          <p className="text-sm text-base-content/60 mb-4">
            Choose how you want to receive your daily sparks
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPlatform('telegram')}
                className={`btn flex-1 gap-2 ${platform === 'telegram' ? 'btn-primary' : 'btn-outline'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Telegram
              </button>
              <button
                onClick={() => setPlatform('whatsapp')}
                className={`btn flex-1 gap-2 ${platform === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {platform === 'whatsapp' ? 'Phone Number (with country code)' : 'Telegram Chat ID'}
                </span>
              </label>
              <input
                type="text"
                placeholder={platform === 'whatsapp' ? '+1234567890' : '12345678'}
                className="input input-bordered w-full font-mono"
                value={msgId}
                onChange={(e) => setMsgId(e.target.value)}
              />
              {platform === 'telegram' && (
                <label className="label">
                  <a href="https://t.me/userinfobot" target="_blank" className="label-text-alt link link-primary">
                    Get your Chat ID from @userinfobot →
                  </a>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Schedule Card */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5">
        <div className="card-body">
          <h2 className="card-title text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Delivery Schedule
          </h2>
          <p className="text-sm text-base-content/60 mb-4">
            Choose when to receive your sparks • Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Morning Spark */}
            <div className={`card p-4 transition-all ${morningEnabled ? 'bg-warning/10 border-2 border-warning/40' : 'bg-base-200/50 border border-base-content/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className={`w-5 h-5 ${morningEnabled ? 'text-warning' : 'text-base-content/40'}`} />
                  <span className="font-medium">Morning Spark</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-warning"
                  checked={morningEnabled}
                  onChange={(e) => setMorningEnabled(e.target.checked)}
                />
              </div>
              {morningEnabled && (
                <input
                  type="time"
                  className="input input-bordered input-sm w-full"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                />
              )}
              <p className="text-xs text-base-content/50 mt-2">
                {morningEnabled ? 'Start your day with love' : 'Enable to receive morning sparks'}
              </p>
            </div>

            {/* Evening Spark */}
            <div className={`card p-4 transition-all ${eveningEnabled ? 'bg-info/10 border-2 border-info/40' : 'bg-base-200/50 border border-base-content/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className={`w-5 h-5 ${eveningEnabled ? 'text-info' : 'text-base-content/40'}`} />
                  <span className="font-medium">Night Spark</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-info"
                  checked={eveningEnabled}
                  onChange={(e) => setEveningEnabled(e.target.checked)}
                />
              </div>
              {eveningEnabled && (
                <input
                  type="time"
                  className="input input-bordered input-sm w-full"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                />
              )}
              <p className="text-xs text-base-content/50 mt-2">
                {eveningEnabled ? 'End your day with warmth' : 'Enable to receive evening sparks'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Features Card */}
      {isLegend ? (
        <div className="card bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-warning" />
              <h2 className="card-title text-lg">Legend Features</h2>
            </div>

            <div className="space-y-5">
              {/* Love Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" /> Love Language
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={loveLanguage}
                  onChange={(e) => setLoveLanguage(e.target.value)}
                >
                  <option value="">Auto (Varied messages)</option>
                  {Object.entries(LOVE_LANGUAGE_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <label className="label py-1">
                  <span className="label-text-alt text-base-content/50">Messages tailored to how your partner feels love</span>
                </label>
              </div>

              {/* Emotional Tone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" /> Emotional Tone
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={preferredTone}
                  onChange={(e) => setPreferredTone(e.target.value)}
                >
                  <option value="">Auto (Varied tones)</option>
                  <option value="poetic">Poetic</option>
                  <option value="playful">Playful</option>
                  <option value="romantic">Romantic</option>
                  <option value="passionate">Passionate</option>
                  <option value="sweet">Sweet</option>
                  <option value="supportive">Supportive</option>
                </select>
              </div>

              {/* Special Occasions */}
              <div className={`card p-4 transition-all ${specialOccasionsEnabled ? 'bg-base-100 border border-warning/30' : 'bg-base-200/30 border border-base-content/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-warning" />
                    <span className="font-medium">Special Occasion Sparks</span>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={specialOccasionsEnabled}
                    onChange={(e) => setSpecialOccasionsEnabled(e.target.checked)}
                  />
                </div>

                {specialOccasionsEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400" /> Anniversary
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full"
                        value={anniversaryDate}
                        onChange={(e) => setAnniversaryDate(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs flex items-center gap-1">
                          <Cake className="w-3 h-3 text-amber-400" /> Partner Birthday
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full"
                        value={partnerBirthday}
                        onChange={(e) => setPartnerBirthday(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-base-content/50 mt-2">
                  Get extra special messages on important dates
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-warning/5 border border-warning/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-warning" />
              <div className="flex-1">
                <h3 className="font-bold text-warning">Unlock Legend Features</h3>
                <p className="text-sm text-base-content/60">
                  Love Language, Emotional Tones, Anniversary Intelligence & more
                </p>
              </div>
              <Link href="/pricing" className="btn btn-warning btn-sm">
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || saved || !msgId}
        className={`btn btn-block btn-lg ${saved ? 'btn-success' : 'btn-primary'}`}
      >
        {saving ? (
          <span className="loading loading-spinner" />
        ) : saved ? (
          <>
            <Check className="w-5 h-5" /> Saved!
          </>
        ) : (
          'Save Automation Settings'
        )}
      </button>

      {!msgId && (
        <p className="text-sm text-center text-warning">
          Please enter your {platform === 'telegram' ? 'Telegram Chat ID' : 'WhatsApp number'} to enable automation
        </p>
      )}
    </div>
  );
}

function DashboardContent() {
  const { user, pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'automation' | 'history'>('profile');

  // Form states - Initialize from user object (PocketBase), NOT localStorage
  const [formPartnerName, setFormPartnerName] = useState('');
  const [formRole, setFormRole] = useState<Role>('neutral');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Phase 8: Legend tier fields
  const [showLoveLanguageQuiz, setShowLoveLanguageQuiz] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');

  // User tier (default to FREE)
  const userTier = user?.tier ?? TIER.FREE;

  // Load user data from PocketBase on mount/user change
  useEffect(() => {
    if (user) {
      setFormPartnerName(user.partner_name || '');
      setFormRole(user.recipient_role || 'neutral');
      // Phase 8 fields
      setAnniversaryDate(user.anniversary_date || '');
      setPartnerBirthday(user.partner_birthday || '');
      setRelationshipStart(user.relationship_start || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      // Save to PocketBase (user-specific data)
      await pb.collection('users').update(user.id, {
        partner_name: formPartnerName,
        recipient_role: formRole,
      });

      // Also update localStorage for SparkCard (synced)
      localStorage.setItem('partner_name', JSON.stringify(formPartnerName));
      localStorage.setItem('recipient_role', JSON.stringify(formRole));

      // Update auth store to trigger realtime updates
      const currentRecord = pb.authStore.record;
      if (currentRecord) {
        pb.authStore.save(pb.authStore.token!, {
          ...currentRecord,
          partner_name: formPartnerName,
          recipient_role: formRole,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDates = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await pb.collection('users').update(user.id, {
        anniversary_date: anniversaryDate || null,
        partner_birthday: partnerBirthday || null,
        relationship_start: relationshipStart || null,
      });

      const currentRecord = pb.authStore.record;
      if (currentRecord) {
        pb.authStore.save(pb.authStore.token!, {
          ...currentRecord,
          anniversary_date: anniversaryDate || null,
          partner_birthday: partnerBirthday || null,
          relationship_start: relationshipStart || null,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save dates:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-content/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-ghost btn-circle btn-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-base-content">Command Center</h1>
              <p className="text-sm text-base-content/60">Manage your sparks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown Mini Widget */}
            {userTier >= TIER.LEGEND && (
              <CountdownWidgetMini
                anniversaryDate={user?.anniversary_date}
                partnerBirthday={user?.partner_birthday}
              />
            )}
            <TierBadge tier={userTier} size="md" />
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-base-100 border-b border-base-content/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="tabs tabs-bordered">
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab tab-lg gap-2 ${activeTab === 'profile' ? 'tab-active' : ''}`}
            >
              <Heart className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`tab tab-lg gap-2 ${activeTab === 'preferences' ? 'tab-active' : ''}`}
            >
              <Crown className="w-4 h-4" />
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`tab tab-lg gap-2 ${activeTab === 'automation' ? 'tab-active' : ''}`}
            >
              <Clock className="w-4 h-4" />
              Automation
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab tab-lg gap-2 ${activeTab === 'history' ? 'tab-active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-primary">
                  <Flame className="w-8 h-8" />
                </div>
                <div className="stat-title text-xs">Streak</div>
                <div className="stat-value text-primary">{user?.streak || 0}</div>
                <div className="stat-desc">days</div>
              </div>
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-secondary">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="stat-title text-xs">Partner</div>
                <div className="stat-value text-lg truncate">{user?.partner_name || 'Not set'}</div>
              </div>
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-info">
                  {userTier === TIER.LEGEND ? <Crown className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                </div>
                <div className="stat-title text-xs">Tier</div>
                <div className="stat-value text-lg">{TIER_NAMES[userTier]}</div>
                <div className="stat-desc">{userTier === TIER.FREE ? <Link href="/pricing" className="link link-primary">Upgrade</Link> : 'Active'}</div>
              </div>
              {/* Love Language Stat (Legend only) */}
              {userTier >= TIER.LEGEND && (
                <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                  <div className="stat-figure text-pink-400">
                    <MessageCircleHeart className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-xs">Love Language</div>
                  <div className="stat-value text-sm truncate">
                    {user?.love_language ? LOVE_LANGUAGE_NAMES[user.love_language as LoveLanguage] : 'Not set'}
                  </div>
                  <div className="stat-desc">
                    <button onClick={() => setShowLoveLanguageQuiz(true)} className="link link-primary text-xs">
                      {user?.love_language ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Relationship Profile */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Relationship Profile
                </h2>
                <p className="text-sm text-base-content/60 mb-4">
                  Personalize your sparks for your special someone
                </p>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Partner&apos;s Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter their name or nickname"
                      className="input input-bordered w-full"
                      value={formPartnerName}
                      onChange={(e) => setFormPartnerName(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Recipient Role</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['neutral', 'feminine', 'masculine'] as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setFormRole(r)}
                          className={`btn ${formRole === r ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {r === 'neutral' ? 'Partner' : r === 'feminine' ? 'Her' : 'Him'}
                        </button>
                      ))}
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">
                        Messages will be tailored for {formRole === 'neutral' ? 'your partner' : formRole === 'feminine' ? 'her' : 'him'}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className={`btn w-full ${saved ? 'btn-success' : 'btn-primary'}`}
                  >
                    {saving ? (
                      <span className="loading loading-spinner" />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved!
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <LegendGate blur>
              {/* Love Language & Tone Preferences */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body gap-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Legend Preferences</h2>
                      <p className="text-xs text-base-content/50">Personalized sparks just for you</p>
                    </div>
                  </div>

                  <div className="divider my-0"></div>

                  {/* Love Language Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircleHeart className="w-4 h-4 text-pink-400" />
                      <span className="font-medium text-sm">Love Language</span>
                    </div>

                    {user?.love_language ? (
                      <div className="flex items-center justify-between bg-base-200/50 rounded-xl p-4 border border-base-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-400/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-base-content">
                              {LOVE_LANGUAGE_NAMES[user.love_language as LoveLanguage]}
                            </p>
                            <p className="text-xs text-base-content/50">Your primary love language</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowLoveLanguageQuiz(true)}
                          className="btn btn-ghost btn-sm"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLoveLanguageQuiz(true)}
                        className="w-full btn btn-outline btn-primary gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Discover Your Love Language
                      </button>
                    )}
                    <p className="text-xs text-base-content/40 pl-1">
                      Get sparks that speak directly to how you experience love
                    </p>
                  </div>

                  <div className="divider my-0"></div>

                  {/* Emotional Tone */}
                  <ToneSelector />
                </div>
              </div>

              {/* Important Dates */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5 mt-6">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Important Dates
                  </h2>
                  <p className="text-sm text-base-content/60 mb-4">
                    Get special sparks on your most cherished days
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-400" />
                          Anniversary
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={anniversaryDate}
                        onChange={(e) => setAnniversaryDate(e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Cake className="w-4 h-4 text-amber-400" />
                          Partner&apos;s Birthday
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={partnerBirthday}
                        onChange={(e) => setPartnerBirthday(e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-400" />
                          Started Dating
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={relationshipStart}
                        onChange={(e) => setRelationshipStart(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveDates}
                    disabled={saving}
                    className={`btn w-full mt-4 ${saved ? 'btn-success' : 'btn-primary'}`}
                  >
                    {saving ? (
                      <span className="loading loading-spinner" />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved!
                      </>
                    ) : (
                      'Save Important Dates'
                    )}
                  </button>

                  {/* Countdown Widget */}
                  {(anniversaryDate || partnerBirthday || relationshipStart) && (
                    <div className="mt-6 pt-6 border-t border-base-content/10">
                      <CountdownWidget
                        anniversaryDate={anniversaryDate}
                        partnerBirthday={partnerBirthday}
                        relationshipStart={relationshipStart}
                        partnerName={formPartnerName || 'Partner'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Link Section */}
              <div className="mt-6">
                <PartnerLink />
              </div>

              {/* Developer Integrations */}
              <div className="mt-6">
                <DeveloperIntegrations />
              </div>
            </LegendGate>
          </motion.div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <HeroGate blur>
              <AutomationTabContent
                user={user}
                userTier={userTier}
                pb={pb}
              />
            </HeroGate>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SparkArchive userTier={userTier} role={formRole} />
          </motion.div>
        )}
      </main>

      {/* Love Language Quiz Modal */}
      <LoveLanguageQuiz
        isOpen={showLoveLanguageQuiz}
        onClose={() => setShowLoveLanguageQuiz(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
