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
} from 'lucide-react';
import Link from 'next/link';
import { getDailySpark } from '@/lib/algo';

type Role = 'neutral' | 'masculine' | 'feminine';

function DashboardContent() {
  const { user, pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'automation' | 'history'>('profile');

  // Form states - Initialize from user object (PocketBase), NOT localStorage
  const [formPartnerName, setFormPartnerName] = useState('');
  const [formRole, setFormRole] = useState<Role>('neutral');
  const [morningTime, setMorningTime] = useState('08:00');
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('telegram');
  const [msgId, setMsgId] = useState('');
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
      setMorningTime(user.morning_time || '08:00');
      setPlatform(user.messaging_platform || 'telegram');
      setMsgId(user.messaging_id || '');
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

  const handleSaveAutomation = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await pb.collection('users').update(user.id, {
        morning_time: morningTime,
        messaging_platform: platform,
        messaging_id: msgId,
        timezone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save automation:', err);
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
          >
            <HeroGate blur>
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Automation Hub
                  </h2>
                  <p className="text-sm text-base-content/60 mb-4">
                    Set up automatic spark delivery to your partner
                  </p>

                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Delivery Time
                        </span>
                      </label>
                      <input
                        type="time"
                        className="input input-bordered w-full"
                        value={morningTime}
                        onChange={(e) => setMorningTime(e.target.value)}
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/50">
                          Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" /> Messaging Platform
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPlatform('telegram')}
                          className={`btn flex-1 ${platform === 'telegram' ? 'btn-primary' : 'btn-outline'}`}
                        >
                          Telegram
                        </button>
                        <button
                          onClick={() => setPlatform('whatsapp')}
                          className={`btn flex-1 ${platform === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          {platform === 'whatsapp' ? 'Phone Number (Intl Format)' : 'Telegram Chat ID'}
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
                          <a
                            href="https://t.me/userinfobot"
                            target="_blank"
                            className="label-text-alt link link-hover text-primary"
                          >
                            Find your Chat ID via @userinfobot
                          </a>
                        </label>
                      )}
                    </div>

                    <button
                      onClick={handleSaveAutomation}
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
                        'Save Automation Settings'
                      )}
                    </button>
                  </div>
                </div>
              </div>
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
