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
} from 'lucide-react';
import Link from 'next/link';

// Types
interface FinancialStats {
  mrr: number;
  totalSubscribers: number;
  newThisMonth: number;
  churnRate: number;
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
}

function AdminContent() {
  const { pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'broadcasts'>('dashboard');
  const [loading, setLoading] = useState(false);

  // Financial stats (would be fetched from Lemon Squeezy API)
  const [stats, setStats] = useState<FinancialStats>({
    mrr: 0,
    totalSubscribers: 0,
    newThisMonth: 0,
    churnRate: 0,
  });

  // Broadcast logs
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>([]);

  // Messages for CRUD
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    content: '',
    target: 'neutral',
    vibe: 'poetic',
    time_of_day: 'morning',
  });

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchBroadcasts();
    fetchMessages();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // In production, this would call Lemon Squeezy API
      // For now, fetch from PocketBase users collection
      const users = await pb.collection('users').getFullList({
        filter: 'is_premium = true',
      });

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newUsers = users.filter(
        (u) => new Date(u.created) >= thisMonth
      );

      setStats({
        mrr: users.length * 4.99, // $4.99 per user
        totalSubscribers: users.length,
        newThisMonth: newUsers.length,
        churnRate: 0, // Would be calculated from Lemon Squeezy
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      // Fetch broadcast logs from PocketBase
      // This collection would need to be created
      const logs = await pb.collection('broadcast_logs').getList(1, 50, {
        sort: '-sent_at',
      });
      setBroadcasts(logs.items as unknown as BroadcastLog[]);
    } catch {
      // Collection might not exist yet
      setBroadcasts([
        // Mock data for development
        {
          id: '1',
          user_id: 'user1',
          user_email: 'john@example.com',
          platform: 'telegram',
          status: 'success',
          sent_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'jane@example.com',
          platform: 'whatsapp',
          status: 'failed',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
          error: 'Invalid phone number',
        },
      ]);
    }
  };

  const fetchMessages = async () => {
    try {
      const result = await pb.collection('messages').getList(1, 100, {
        sort: '-created',
      });
      setMessages(result.items as unknown as Message[]);
    } catch {
      // Collection might not exist, show empty
      setMessages([]);
    }
  };

  const handleCreateMessage = async () => {
    try {
      await pb.collection('messages').create(newMessage);
      setNewMessage({ content: '', target: 'neutral', vibe: 'poetic', time_of_day: 'morning' });
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

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-content/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-ghost btn-circle btn-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-base-content">Admin Cockpit</h1>
              <p className="text-sm text-base-content/60">Business overview & management</p>
            </div>
          </div>
          <button onClick={fetchStats} className="btn btn-ghost btn-sm gap-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-base-100 border-b border-base-content/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="tabs tabs-bordered">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab tab-lg gap-2 ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`tab tab-lg gap-2 ${activeTab === 'content' ? 'tab-active' : ''}`}
            >
              <MessageSquare className="w-4 h-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('broadcasts')}
              className={`tab tab-lg gap-2 ${activeTab === 'broadcasts' ? 'tab-active' : ''}`}
            >
              <Send className="w-4 h-4" />
              Broadcasts
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
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

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://app.lemonsqueezy.com"
                    target="_blank"
                    className="btn btn-outline gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Lemon Squeezy Dashboard
                  </a>
                  <Link href="/admin" className="btn btn-outline gap-2">
                    <MessageSquare className="w-4 h-4" />
                    PocketBase Admin
                  </Link>
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
                  <label className="label">
                    <span className="label-text">Message Content</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 w-full"
                    placeholder="Enter the message content..."
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  />
                </div>

                {/* Options Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Target</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={newMessage.target}
                      onChange={(e) => setNewMessage({ ...newMessage, target: e.target.value })}
                    >
                      <option value="neutral">Neutral</option>
                      <option value="feminine">Feminine</option>
                      <option value="masculine">Masculine</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Vibe</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={newMessage.vibe}
                      onChange={(e) => setNewMessage({ ...newMessage, vibe: e.target.value })}
                    >
                      <option value="poetic">Poetic</option>
                      <option value="playful">Playful</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Time of Day</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={newMessage.time_of_day}
                      onChange={(e) => setNewMessage({ ...newMessage, time_of_day: e.target.value })}
                    >
                      <option value="morning">Morning</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text opacity-0">Action</span>
                    </label>
                    <button
                      onClick={handleCreateMessage}
                      disabled={!newMessage.content}
                      className="btn btn-primary w-full gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Message
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
                        <th>Vibe</th>
                        <th>Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-base-content/50 py-8">
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
                              <span className="badge badge-ghost badge-sm">{msg.vibe}</span>
                            </td>
                            <td>
                              <span className="badge badge-ghost badge-sm">{msg.time_of_day}</span>
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
                <div className="modal-box">
                  <h3 className="font-bold text-lg mb-4">Edit Message</h3>
                  <div className="space-y-4">
                    <textarea
                      className="textarea textarea-bordered w-full h-24"
                      value={editingMessage.content}
                      onChange={(e) =>
                        setEditingMessage({ ...editingMessage, content: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-3 gap-2">
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
                        <option value="poetic">Poetic</option>
                        <option value="playful">Playful</option>
                        <option value="minimal">Minimal</option>
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
                            No broadcast logs yet.
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
