'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  Trophy,
  Activity,
  Flame,
  Mail,
  RefreshCw,
  ChevronRight,
  Clock,
  Crown,
  Star,
  Zap,
} from 'lucide-react';
import { getEngagementStats, triggerReengagementEmails } from '@/actions/engagement';
import { TIER_NAMES } from '@/lib/types';

interface AtRiskUser {
  id: string;
  email: string;
  name?: string;
  tier: number;
  days_inactive: number;
  last_activity: string;
  engagement_score: number;
}

interface TopEngager {
  userId: string;
  email: string;
  copies: number;
  streak: number;
}

interface EngagementStats {
  totalActiveUsers: number;
  atRiskUsers: AtRiskUser[];
  averageStreak: number;
  topEngagers: TopEngager[];
}

export function EngagementPanel() {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getEngagementStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch engagement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReengagement = async () => {
    setSendingEmails(true);
    setEmailResult(null);
    try {
      const result = await triggerReengagementEmails();
      setEmailResult(result);
      // Refresh stats after sending
      await fetchStats();
    } catch (error) {
      console.error('Failed to send re-engagement emails:', error);
    } finally {
      setSendingEmails(false);
    }
  };

  const getTierIcon = (tier: number) => {
    if (tier === 2) return <Crown className="w-3 h-3 text-warning" />;
    if (tier === 1) return <Star className="w-3 h-3 text-primary" />;
    return null;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-base-content/60">
        Failed to load engagement data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">
                  {stats.totalActiveUsers}
                </p>
                <p className="text-xs text-base-content/60">Active Users (7d)</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">
                  {stats.averageStreak}
                </p>
                <p className="text-xs text-base-content/60">Avg. Streak (days)</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">
                  {stats.atRiskUsers.length}
                </p>
                <p className="text-xs text-base-content/60">At-Risk Users</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Trophy className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-content">
                  {stats.topEngagers[0]?.streak || 0}
                </p>
                <p className="text-xs text-base-content/60">Top Streak</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 border border-base-content/5"
        >
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base-content flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                At-Risk Users
              </h3>
              <button
                onClick={handleSendReengagement}
                disabled={sendingEmails || stats.atRiskUsers.length === 0}
                className="btn btn-sm btn-ghost gap-2"
              >
                {sendingEmails ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Send Re-engagement
              </button>
            </div>

            {/* Email result notification */}
            {emailResult && (
              <div className="alert alert-info mb-4 py-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">
                  Sent: {emailResult.sent}, Skipped: {emailResult.skipped}, Failed: {emailResult.failed}
                </span>
              </div>
            )}

            {/* Users list */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.atRiskUsers.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  No at-risk users detected
                </div>
              ) : (
                stats.atRiskUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-rose-500">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">
                            {user.email}
                          </p>
                          {getTierIcon(user.tier)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-base-content/50">
                          <Clock className="w-3 h-3" />
                          <span>{user.days_inactive}d inactive</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-xs font-medium ${getEngagementColor(
                          user.engagement_score
                        )}`}
                      >
                        {user.engagement_score}%
                      </div>
                      <ChevronRight className="w-4 h-4 text-base-content/30" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Engagers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 border border-base-content/5"
        >
          <div className="card-body p-4">
            <h3 className="font-semibold text-base-content flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-500" />
              Top Engagers
            </h3>

            <div className="space-y-2">
              {stats.topEngagers.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  No engagement data yet
                </div>
              ) : (
                stats.topEngagers.map((engager, index) => (
                  <div
                    key={engager.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-base-200/50"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === 0
                            ? 'bg-amber-500/20 text-amber-500'
                            : index === 1
                            ? 'bg-slate-400/20 text-slate-400'
                            : index === 2
                            ? 'bg-orange-600/20 text-orange-600'
                            : 'bg-base-300 text-base-content/50'
                        }`}
                      >
                        <span className="text-xs font-bold">#{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {engager.email}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {engager.copies} copies
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{engager.streak}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn btn-ghost btn-sm gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>
    </div>
  );
}
