'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AdminGuard } from '@/components/guards/PremiumGuard';
import {
  DollarSign,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  Activity,
  Heart,
  Link2,
  Crown,
  Star,
  Sparkles,
  UserCheck,
  Clock,
  Globe,
  Settings,
  AlertTriangle,
  ExternalLink,
  Save,
  BarChart3,
} from 'lucide-react';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { AnalyticsSettings } from '@/components/admin/AnalyticsSettings';
import Link from 'next/link';
import {
  TIER,
  TIER_NAMES,
  EMOTIONAL_TONES,
  EMOTIONAL_TONE_NAMES,
  LOVE_LANGUAGE_NAMES,
  type TierLevel,
  type LoveLanguage,
  type EmotionalTone,
} from '@/lib/types';
import {
  DEFAULT_PRICING,
  calculatePerDay,
  calculateDiscount,
  cachePricing,
  type PricingConfig,
} from '@/lib/pricing';

// Types
interface FinancialStats {
  mrr: number;
  totalSubscribers: number;
  heroCount: number;
  legendCount: number;
  newThisMonth: number;
  churnRate: number;
}

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  heroUsers: number;
  legendUsers: number;
  usersWithAutomation: number;
  loveLanguageDistribution: Record<string, number>;
  toneDistribution: Record<string, number>;
}

interface PartnerLinkStats {
  totalLinks: number;
  activeLinks: number;
  pendingLinks: number;
}

interface BroadcastLog {
  id: string;
  user_id: string;
  user_email: string;
  platform: string;
  status: 'success' | 'failed' | 'pending';
  sent_at: string;
  error?: string;
}

interface Message {
  id: string;
  content: string;
  target: string;
  vibe: string;
  time_of_day: string;
  rarity?: string;
  love_language?: string;
}

// Initial pricing from centralized config
const INITIAL_PRICING: PricingConfig = DEFAULT_PRICING;

function AdminContent() {
  const { pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'users' | 'content' | 'broadcasts' | 'partners' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Financial stats
  const [stats, setStats] = useState<FinancialStats>({
    mrr: 0,
    totalSubscribers: 0,
    heroCount: 0,
    legendCount: 0,
    newThisMonth: 0,
    churnRate: 0,
  });

  // User stats
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    freeUsers: 0,
    heroUsers: 0,
    legendUsers: 0,
    usersWithAutomation: 0,
    loveLanguageDistribution: {},
    toneDistribution: {},
  });

  // Partner link stats
  const [partnerStats, setPartnerStats] = useState<PartnerLinkStats>({
    totalLinks: 0,
    activeLinks: 0,
    pendingLinks: 0,
  });

  // Broadcast logs
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>([]);

  // Messages for CRUD
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState<{
    content: string;
    target: string;
    vibe: string;
    time_of_day: string;
    rarity: string;
    love_language: string;
  }>({
    content: '',
    target: 'neutral',
    vibe: EMOTIONAL_TONES.ROMANTIC,
    time_of_day: 'morning',
    rarity: 'common',
    love_language: '',
  });

  // Pricing configuration
  const [pricing, setPricing] = useState<PricingConfig>(INITIAL_PRICING);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchUserStats();
    fetchPartnerStats();
    fetchBroadcasts();
    fetchMessages();
    fetchPricing();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch users with tier >= 1 (Hero or Legend)
      const allPremiumUsers = await pb.collection('users').getFullList({
        filter: 'tier >= 1',
      });

      const heroUsers = allPremiumUsers.filter((u) => u.tier === TIER.HERO);
      const legendUsers = allPremiumUsers.filter((u) => u.tier === TIER.LEGEND);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newUsers = allPremiumUsers.filter(
        (u) => new Date(u.created) >= thisMonth
      );

      // Calculate MRR with dynamic pricing
      const heroMRR = heroUsers.length * pricing.hero.price;
      const legendMRR = legendUsers.length * pricing.legend.price;

      setStats({
        mrr: heroMRR + legendMRR,
        totalSubscribers: allPremiumUsers.length,
        heroCount: heroUsers.length,
        legendCount: legendUsers.length,
        newThisMonth: newUsers.length,
        churnRate: 0, // Would be calculated from Lemon Squeezy
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      console.error('Failed to fetch stats:', err);
      // Don't set error for common auth issues
      if (!errorMessage.includes('client id')) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const allUsers = await pb.collection('users').getFullList();

      const freeUsers = allUsers.filter((u) => (u.tier ?? 0) === TIER.FREE);
      const heroUsers = allUsers.filter((u) => u.tier === TIER.HERO);
      const legendUsers = allUsers.filter((u) => u.tier === TIER.LEGEND);
      const usersWithAutomation = allUsers.filter((u) => u.messaging_platform && u.messaging_id);

      // Calculate love language distribution
      const loveLanguageDistribution: Record<string, number> = {};
      allUsers.forEach((u) => {
        if (u.love_language) {
          const name = LOVE_LANGUAGE_NAMES[u.love_language as LoveLanguage] || u.love_language;
          loveLanguageDistribution[name] = (loveLanguageDistribution[name] || 0) + 1;
        }
      });

      // Calculate tone distribution
      const toneDistribution: Record<string, number> = {};
      allUsers.forEach((u) => {
        if (u.preferred_tone) {
          const name = EMOTIONAL_TONE_NAMES[u.preferred_tone as EmotionalTone] || u.preferred_tone;
          toneDistribution[name] = (toneDistribution[name] || 0) + 1;
        }
      });

      setUserStats({
        totalUsers: allUsers.length,
        freeUsers: freeUsers.length,
        heroUsers: heroUsers.length,
        legendUsers: legendUsers.length,
        usersWithAutomation: usersWithAutomation.length,
        loveLanguageDistribution,
        toneDistribution,
      });
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const fetchPartnerStats = async () => {
    try {
      const links = await pb.collection('partner_links').getFullList();
      const activeLinks = links.filter((l) => l.status === 'active');
      const pendingLinks = links.filter((l) => l.status === 'pending');

      setPartnerStats({
        totalLinks: links.length,
        activeLinks: activeLinks.length,
        pendingLinks: pendingLinks.length,
      });
    } catch {
      // Collection might not exist yet
      setPartnerStats({ totalLinks: 0, activeLinks: 0, pendingLinks: 0 });
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const logs = await pb.collection('broadcast_logs').getList(1, 50, {
        sort: '-sent_at',
      });
      setBroadcasts(logs.items as unknown as BroadcastLog[]);
    } catch {
      // Collection might not exist yet - show empty state
      setBroadcasts([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const result = await pb.collection('messages').getList(1, 100, {
        sort: '-created',
      });
      setMessages(result.items as unknown as Message[]);
    } catch {
      setMessages([]);
    }
  };

  const handleCreateMessage = async () => {
    try {
      await pb.collection('messages').create(newMessage);
      setNewMessage({
        content: '',
        target: 'neutral',
        vibe: EMOTIONAL_TONES.ROMANTIC,
        time_of_day: 'morning',
        rarity: 'common',
        love_language: '',
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to create message:', err);
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    try {
      await pb.collection('messages').update(editingMessage.id, editingMessage);
      setEditingMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to update message:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await pb.collection('messages').delete(id);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      // Try to fetch pricing from PocketBase settings collection
      const settings = await pb.collection('settings').getFirstListItem('key = "pricing"');
      if (settings?.value) {
        const pricingData = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
        setPricing(pricingData);
        cachePricing(pricingData);
      }
    } catch {
      // Settings collection might not exist or pricing not set - use defaults
      console.log('Using default pricing (settings not found in PocketBase)');
    }
  };

  const savePricing = async () => {
    setPricingSaving(true);
    setPricingSaved(false);
    try {
      // Update per-day calculations
      const updatedPricing: PricingConfig = {
        ...pricing,
        hero: {
          ...pricing.hero,
          perDay: calculatePerDay(pricing.hero.price),
        },
        legend: {
          ...pricing.legend,
          perDay: calculatePerDay(pricing.legend.price),
        },
        lastUpdated: new Date().toISOString(),
      };

      // Try to update existing or create new
      try {
        const existing = await pb.collection('settings').getFirstListItem('key = "pricing"');
        await pb.collection('settings').update(existing.id, { value: JSON.stringify(updatedPricing) });
      } catch {
        // Create new settings record
        await pb.collection('settings').create({
          key: 'pricing',
          value: JSON.stringify(updatedPricing),
        });
      }

      setPricing(updatedPricing);
      cachePricing(updatedPricing);
      setPricingSaved(true);

      // Refresh stats with new pricing
      fetchStats();

      // Reset saved indicator after 3 seconds
      setTimeout(() => setPricingSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save pricing:', err);
      alert('Failed to save pricing. Make sure the "settings" collection exists in PocketBase.');
    } finally {
      setPricingSaving(false);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchUserStats();
    fetchPartnerStats();
    fetchBroadcasts();
    fetchMessages();
    fetchPricing();
  };

  // Tab configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: MessageSquare },
    { id: 'partners', label: 'Partners', icon: Link2 },
    { id: 'broadcasts', label: 'Broadcasts', icon: Send },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-ghost btn-circle btn-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-base-content flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                Admin Cockpit
              </h1>
              <p className="text-sm text-base-content/60">Business overview & management</p>
            </div>
          </div>
          <button onClick={refreshAll} className="btn btn-ghost btn-sm gap-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-base-100 border-b border-base-content/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="tabs tabs-bordered overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab tab-lg gap-2 whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-ghost btn-sm">Dismiss</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Financial Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-success">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div className="stat-title">MRR</div>
                <div className="stat-value text-success">${stats.mrr.toFixed(2)}</div>
                <div className="stat-desc">Monthly Recurring Revenue</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-primary">
                  <Users className="w-8 h-8" />
                </div>
                <div className="stat-title">Subscribers</div>
                <div className="stat-value text-primary">{stats.totalSubscribers}</div>
                <div className="stat-desc">Total premium users</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-info">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="stat-title">New This Month</div>
                <div className="stat-value text-info">{stats.newThisMonth}</div>
                <div className="stat-desc">New subscribers</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-warning">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="stat-title">Churn Rate</div>
                <div className="stat-value text-warning">{stats.churnRate}%</div>
                <div className="stat-desc">Monthly churn</div>
              </div>
            </div>

            {/* Tier Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Tier Breakdown
                    </h2>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit Pricing
                    </button>
                  </div>
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Star className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Hero Tier</p>
                          <p className="text-xs text-base-content/60">${pricing.hero.price.toFixed(2)} one-time</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{stats.heroCount}</p>
                        <p className="text-xs text-base-content/60">${(stats.heroCount * pricing.hero.price).toFixed(2)} revenue</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-warning/10 to-secondary/10 rounded-xl border border-warning/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">Legend Tier</p>
                          <p className="text-xs text-base-content/60">${pricing.legend.price.toFixed(2)} one-time</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-warning">{stats.legendCount}</p>
                        <p className="text-xs text-base-content/60">${(stats.legendCount * pricing.legend.price).toFixed(2)} revenue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a
                      href="https://app.lemonsqueezy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Lemon Squeezy
                    </a>
                    <a
                      href={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/_/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      PocketBase Admin
                    </a>
                    <Link href="/dashboard" className="btn btn-outline btn-sm gap-2">
                      <Users className="w-4 h-4" />
                      User Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnalyticsDashboard pb={pb} />
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Total Users</div>
                <div className="stat-value text-2xl">{userStats.totalUsers}</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-base-content/40">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Free (Voyager)</div>
                <div className="stat-value text-2xl">{userStats.freeUsers}</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-primary">
                  <Star className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Hero</div>
                <div className="stat-value text-2xl text-primary">{userStats.heroUsers}</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-warning">
                  <Crown className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Legend</div>
                <div className="stat-value text-2xl text-warning">{userStats.legendUsers}</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-success">
                  <Send className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Automation</div>
                <div className="stat-value text-2xl text-success">{userStats.usersWithAutomation}</div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tier Distribution */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-warning" />
                    Tier Distribution
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: TIER_NAMES[TIER.FREE], count: userStats.freeUsers, color: 'bg-base-content/20' },
                      { name: TIER_NAMES[TIER.HERO], count: userStats.heroUsers, color: 'bg-primary' },
                      { name: TIER_NAMES[TIER.LEGEND], count: userStats.legendUsers, color: 'bg-warning' },
                    ].map((tier) => (
                      <div key={tier.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{tier.name}</span>
                          <span className="font-medium">{tier.count} ({userStats.totalUsers > 0 ? ((tier.count / userStats.totalUsers) * 100).toFixed(1) : 0}%)</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2">
                          <div
                            className={`${tier.color} h-2 rounded-full transition-all`}
                            style={{ width: `${userStats.totalUsers > 0 ? (tier.count / userStats.totalUsers) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Love Language Distribution */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-error" />
                    Love Language Distribution
                  </h2>
                  {Object.keys(userStats.loveLanguageDistribution).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(userStats.loveLanguageDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([language, count]) => (
                          <div key={language} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                            <span className="text-sm">{language}</span>
                            <span className="badge badge-primary badge-sm">{count}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-base-content/50">
                      <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No love language data yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tone Preference Distribution */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    Tone Preferences
                  </h2>
                  {Object.keys(userStats.toneDistribution).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(userStats.toneDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([tone, count]) => (
                          <div key={tone} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                            <span className="text-sm">{tone}</span>
                            <span className="badge badge-secondary badge-sm">{count}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-base-content/50">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No tone preference data yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                  <h2 className="card-title flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Conversion Metrics
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Free to Hero</span>
                        <span className="font-medium">
                          {userStats.freeUsers > 0
                            ? ((userStats.heroUsers / (userStats.freeUsers + userStats.heroUsers + userStats.legendUsers)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={userStats.heroUsers}
                        max={userStats.totalUsers || 1}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hero to Legend</span>
                        <span className="font-medium">
                          {userStats.heroUsers > 0
                            ? ((userStats.legendUsers / (userStats.heroUsers + userStats.legendUsers)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-warning w-full"
                        value={userStats.legendUsers}
                        max={userStats.heroUsers + userStats.legendUsers || 1}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Automation Enabled</span>
                        <span className="font-medium">
                          {userStats.totalUsers > 0
                            ? ((userStats.usersWithAutomation / userStats.totalUsers) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-success w-full"
                        value={userStats.usersWithAutomation}
                        max={userStats.totalUsers || 1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Add New Message */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Message
                </h2>

                {/* Message Content - Full Width */}
                <div className="form-control mb-4">
                  <label className="label pb-2">
                    <span className="label-text font-medium">Message Content</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 w-full"
                    placeholder="Enter the message content..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Target</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={newMessage.target}
                      onChange={(e) => setNewMessage({ ...newMessage, target: e.target.value })}
                    >
                      <option value="neutral">Neutral</option>
                      <option value="feminine">Feminine</option>
                      <option value="masculine">Masculine</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Tone</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={newMessage.vibe}
                      onChange={(e) => setNewMessage({ ...newMessage, vibe: e.target.value })}
                    >
                      {Object.entries(EMOTIONAL_TONE_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Time</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={newMessage.time_of_day}
                      onChange={(e) => setNewMessage({ ...newMessage, time_of_day: e.target.value })}
                    >
                      <option value="morning">Morning</option>
                      <option value="night">Night</option>
                      <option value="any">Any</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Rarity</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={newMessage.rarity}
                      onChange={(e) => setNewMessage({ ...newMessage, rarity: e.target.value })}
                    >
                      <option value="common">Common</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Love Language</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={newMessage.love_language}
                      onChange={(e) => setNewMessage({ ...newMessage, love_language: e.target.value })}
                    >
                      <option value="">Any</option>
                      {Object.entries(LOVE_LANGUAGE_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">&nbsp;</span>
                    </label>
                    <button
                      onClick={handleCreateMessage}
                      disabled={!newMessage.content}
                      className="btn btn-primary btn-sm w-full gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <h2 className="card-title">Messages ({messages.length})</h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Content</th>
                        <th>Target</th>
                        <th>Tone</th>
                        <th>Time</th>
                        <th>Rarity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-base-content/50 py-8">
                            No messages in database. Add some above or use pool.json.
                          </td>
                        </tr>
                      ) : (
                        messages.map((msg) => (
                          <tr key={msg.id}>
                            <td className="max-w-xs truncate">{msg.content}</td>
                            <td>
                              <span className="badge badge-ghost badge-sm">{msg.target}</span>
                            </td>
                            <td>
                              <span className="badge badge-primary badge-sm">
                                {EMOTIONAL_TONE_NAMES[msg.vibe as EmotionalTone] || msg.vibe}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-ghost badge-sm">{msg.time_of_day}</span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${
                                msg.rarity === 'legendary' ? 'badge-warning' :
                                msg.rarity === 'epic' ? 'badge-secondary' :
                                msg.rarity === 'rare' ? 'badge-accent' :
                                'badge-ghost'
                              }`}>
                                {msg.rarity || 'common'}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingMessage(msg)}
                                  className="btn btn-ghost btn-xs"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="btn btn-ghost btn-xs text-error"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Modal */}
            {editingMessage && (
              <div className="modal modal-open">
                <div className="modal-box max-w-2xl">
                  <h3 className="font-bold text-lg mb-4">Edit Message</h3>
                  <div className="space-y-4">
                    <textarea
                      className="textarea textarea-bordered w-full h-24"
                      value={editingMessage.content}
                      onChange={(e) =>
                        setEditingMessage({ ...editingMessage, content: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <select
                        className="select select-bordered select-sm"
                        value={editingMessage.target}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, target: e.target.value })
                        }
                      >
                        <option value="neutral">Neutral</option>
                        <option value="feminine">Feminine</option>
                        <option value="masculine">Masculine</option>
                      </select>
                      <select
                        className="select select-bordered select-sm"
                        value={editingMessage.vibe}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, vibe: e.target.value })
                        }
                      >
                        {Object.entries(EMOTIONAL_TONE_NAMES).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <select
                        className="select select-bordered select-sm"
                        value={editingMessage.time_of_day}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, time_of_day: e.target.value })
                        }
                      >
                        <option value="morning">Morning</option>
                        <option value="night">Night</option>
                        <option value="any">Any</option>
                      </select>
                      <select
                        className="select select-bordered select-sm"
                        value={editingMessage.rarity || 'common'}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, rarity: e.target.value })
                        }
                      >
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                      <select
                        className="select select-bordered select-sm col-span-2"
                        value={editingMessage.love_language || ''}
                        onChange={(e) =>
                          setEditingMessage({ ...editingMessage, love_language: e.target.value })
                        }
                      >
                        <option value="">Any Love Language</option>
                        {Object.entries(LOVE_LANGUAGE_NAMES).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-action">
                    <button onClick={() => setEditingMessage(null)} className="btn btn-ghost">
                      Cancel
                    </button>
                    <button onClick={handleUpdateMessage} className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
                <div className="modal-backdrop" onClick={() => setEditingMessage(null)} />
              </div>
            )}
          </motion.div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Partner Link Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-primary">
                  <Link2 className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Links</div>
                <div className="stat-value text-primary">{partnerStats.totalLinks}</div>
                <div className="stat-desc">Partner invitations</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-success">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="stat-title">Active</div>
                <div className="stat-value text-success">{partnerStats.activeLinks}</div>
                <div className="stat-desc">Connected pairs</div>
              </div>

              <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-content/5">
                <div className="stat-figure text-warning">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{partnerStats.pendingLinks}</div>
                <div className="stat-desc">Awaiting acceptance</div>
              </div>
            </div>

            {/* Partner Links Info Card */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                  <Heart className="w-5 h-5 text-error" />
                  Partner Link System
                </h2>
                <p className="text-base-content/70 mb-4">
                  Legend tier users can invite their partners to create a two-way connection.
                  Connected partners can send each other "Love Pings" and share a synchronized streak counter.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-base-200 rounded-xl">
                    <h3 className="font-medium mb-2">How it works:</h3>
                    <ol className="list-decimal list-inside text-sm space-y-1 text-base-content/70">
                      <li>Legend user generates invite link</li>
                      <li>Partner receives and clicks link</li>
                      <li>Partner creates account or logs in</li>
                      <li>Connection is established</li>
                      <li>Both can send Love Pings</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-base-200 rounded-xl">
                    <h3 className="font-medium mb-2">Features unlocked:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-base-content/70">
                      <li>Instant Love Ping notifications</li>
                      <li>Shared streak counter</li>
                      <li>Partner name in messages</li>
                      <li>Duo streak card styles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Broadcasts Tab */}
        {activeTab === 'broadcasts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Broadcast Monitor
                  </h2>
                  <button onClick={fetchBroadcasts} className="btn btn-ghost btn-sm gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-success/10 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold text-success">
                      {broadcasts.filter((b) => b.status === 'success').length}
                    </div>
                    <div className="text-xs text-base-content/60">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-error/10 rounded-xl">
                    <XCircle className="w-6 h-6 text-error mx-auto mb-2" />
                    <div className="text-2xl font-bold text-error">
                      {broadcasts.filter((b) => b.status === 'failed').length}
                    </div>
                    <div className="text-xs text-base-content/60">Failed</div>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-warning mx-auto mb-2" />
                    <div className="text-2xl font-bold text-warning">
                      {broadcasts.filter((b) => b.status === 'pending').length}
                    </div>
                    <div className="text-xs text-base-content/60">Pending</div>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Platform</th>
                        <th>Status</th>
                        <th>Sent At</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcasts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-base-content/50 py-8">
                            <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>No broadcast logs yet.</p>
                            <p className="text-xs mt-1">Automated broadcasts will appear here once enabled.</p>
                          </td>
                        </tr>
                      ) : (
                        broadcasts.map((log) => (
                          <tr key={log.id}>
                            <td>{log.user_email}</td>
                            <td>
                              <span className="badge badge-ghost badge-sm capitalize">
                                {log.platform}
                              </span>
                            </td>
                            <td>
                              {log.status === 'success' ? (
                                <span className="badge badge-success badge-sm gap-1">
                                  <CheckCircle className="w-3 h-3" /> Success
                                </span>
                              ) : log.status === 'failed' ? (
                                <span className="badge badge-error badge-sm gap-1">
                                  <XCircle className="w-3 h-3" /> Failed
                                </span>
                              ) : (
                                <span className="badge badge-warning badge-sm">Pending</span>
                              )}
                            </td>
                            <td className="text-xs text-base-content/60">
                              {new Date(log.sent_at).toLocaleString()}
                            </td>
                            <td className="text-xs text-error max-w-xs truncate">
                              {log.error || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Pricing Configuration */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="card-title flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      Pricing Configuration
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                      Update prices here. Remember to also update Lemon Squeezy manually.
                    </p>
                  </div>
                  <button
                    onClick={savePricing}
                    disabled={pricingSaving}
                    className={`btn gap-2 ${pricingSaved ? 'btn-success' : 'btn-primary'}`}
                  >
                    {pricingSaving ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : pricingSaved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {pricingSaving ? 'Saving...' : pricingSaved ? 'Saved!' : 'Save Pricing'}
                  </button>
                </div>

                {/* Lemon Squeezy Warning */}
                <div className="alert alert-warning mb-6">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-medium">Manual Lemon Squeezy Update Required</p>
                    <p className="text-sm opacity-80">
                      After changing prices here, you must also update product prices in Lemon Squeezy dashboard.
                    </p>
                  </div>
                  <a
                    href="https://app.lemonsqueezy.com/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-warning gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Lemon Squeezy
                  </a>
                </div>

                {/* Pricing Editors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hero Tier Pricing */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">Hero Tier</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Current Price ($)</span>
                          <span className="label-text-alt">One-time payment</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input input-bordered"
                          value={pricing.hero.price}
                          onChange={(e) => setPricing({
                            ...pricing,
                            hero: { ...pricing.hero, price: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Original Price ($)</span>
                          <span className="label-text-alt">Strike-through price</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input input-bordered"
                          value={pricing.hero.originalPrice}
                          onChange={(e) => setPricing({
                            ...pricing,
                            hero: { ...pricing.hero, originalPrice: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/60">Discount:</span>
                        <span className="font-medium text-success">
                          {calculateDiscount(pricing.hero.originalPrice, pricing.hero.price)}% OFF
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/60">Per day (1 year):</span>
                        <span className="font-medium">{calculatePerDay(pricing.hero.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend Tier Pricing */}
                  <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-warning" />
                      <h3 className="font-bold">Legend Tier</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Current Price ($)</span>
                          <span className="label-text-alt">One-time payment</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input input-bordered"
                          value={pricing.legend.price}
                          onChange={(e) => setPricing({
                            ...pricing,
                            legend: { ...pricing.legend, price: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Original Price ($)</span>
                          <span className="label-text-alt">Strike-through price</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input input-bordered"
                          value={pricing.legend.originalPrice}
                          onChange={(e) => setPricing({
                            ...pricing,
                            legend: { ...pricing.legend, originalPrice: parseFloat(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/60">Discount:</span>
                        <span className="font-medium text-success">
                          {calculateDiscount(pricing.legend.originalPrice, pricing.legend.price)}% OFF
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/60">Per day (1 year):</span>
                        <span className="font-medium">{calculatePerDay(pricing.legend.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                {pricing.lastUpdated && (
                  <p className="text-xs text-base-content/40 mt-4 text-right">
                    Last updated: {new Date(pricing.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Analytics & Monetization Settings */}
            <AnalyticsSettings />

          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}
