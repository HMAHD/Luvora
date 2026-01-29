'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/PremiumGuard';
import { HeroGate } from '@/components/guards/TierGate';
import { TierBadge } from '@/components/TierBadge';
import { TIER, TIER_NAMES } from '@/lib/types';
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
  Copy,
  Crown,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getDailySpark } from '@/lib/algo';

type Role = 'neutral' | 'masculine' | 'feminine';

function DashboardContent() {
  const { user, pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'automation' | 'history'>('profile');

  // Form states - Initialize from user object (PocketBase), NOT localStorage
  const [formPartnerName, setFormPartnerName] = useState('');
  const [formRole, setFormRole] = useState<Role>('neutral');
  const [morningTime, setMorningTime] = useState('08:00');
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('telegram');
  const [msgId, setMsgId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Streak history
  const [sparkHistory, setSparkHistory] = useState<Array<{ date: string; morning: string; night: string }>>([]);

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
    }
  }, [user]);

  // Generate spark history - Free users see 3 days, Hero+ see 7 days
  useEffect(() => {
    const daysToShow = userTier >= TIER.HERO ? 7 : 3;
    const history = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const spark = getDailySpark(date, formRole);
      history.push({
        date: date.toISOString().split('T')[0],
        morning: spark.morning.content,
        night: spark.night.content,
      });
    }
    setSparkHistory(history);
  }, [formRole, userTier]);

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

  const handleCopySpark = (content: string) => {
    navigator.clipboard.writeText(content);
    if (navigator.vibrate) {
      navigator.vibrate([15, 50, 15]);
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
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Spark History
              </h2>
              <span className="text-sm text-base-content/60">
                Last {userTier >= TIER.HERO ? '7' : '3'} days
                {userTier < TIER.HERO && (
                  <Link href="/pricing" className="ml-2 link link-primary text-xs">
                    Upgrade for full history
                  </Link>
                )}
              </span>
            </div>

            <div className="space-y-3">
              {sparkHistory.map((spark, index) => {
                const date = new Date(spark.date);
                const isToday = index === 0;
                const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div
                    key={spark.date}
                    className={`card bg-base-100 shadow-sm border ${isToday ? 'border-primary/30' : 'border-base-content/5'}`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isToday ? 'text-primary' : 'text-base-content'}`}>
                            {dayName}
                          </span>
                          <span className="text-sm text-base-content/50">{dateStr}</span>
                        </div>
                        {isToday && (
                          <span className="badge badge-primary badge-sm">Current</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                          <span className="text-lg">☀️</span>
                          <div className="flex-1">
                            <p className="text-sm text-base-content">{spark.morning}</p>
                          </div>
                          <button
                            onClick={() => handleCopySpark(spark.morning)}
                            className="btn btn-ghost btn-xs"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                          <span className="text-lg">🌙</span>
                          <div className="flex-1">
                            <p className="text-sm text-base-content">{spark.night}</p>
                          </div>
                          <button
                            onClick={() => handleCopySpark(spark.night)}
                            className="btn btn-ghost btn-xs"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
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
