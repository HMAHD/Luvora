'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code,
    Key,
    Webhook,
    Copy,
    Check,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    ExternalLink,
    AlertCircle,
    Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed?: string;
}

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    active: boolean;
    created: string;
}

const AVAILABLE_EVENTS = [
    { id: 'spark.generated', name: 'Spark Generated', description: 'When a new daily spark is generated' },
    { id: 'spark.copied', name: 'Spark Copied', description: 'When a user copies a spark' },
    { id: 'spark.shared', name: 'Spark Shared', description: 'When a user shares a spark card' },
    { id: 'streak.updated', name: 'Streak Updated', description: 'When user streak changes' },
    { id: 'occasion.upcoming', name: 'Occasion Upcoming', description: 'When anniversary/birthday is within 7 days' }
];

export function DeveloperIntegrations() {
    const { user, pb } = useAuth();
    const [activeSection, setActiveSection] = useState<'api' | 'webhooks'>('api');

    // API Keys state
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [showNewKeyForm, setShowNewKeyForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    // Webhooks state
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);
    const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });
    const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

    // Load existing keys and webhooks
    useEffect(() => {
        if (user?.id) {
            loadApiKeys();
            loadWebhooks();
        }
    }, [user?.id]);

    const loadApiKeys = async () => {
        // In production, this would fetch from PocketBase
        // For now, use localStorage as a demo
        const stored = localStorage.getItem(`api_keys_${user?.id}`);
        if (stored) {
            setApiKeys(JSON.parse(stored));
        }
    };

    const loadWebhooks = async () => {
        const stored = localStorage.getItem(`webhooks_${user?.id}`);
        if (stored) {
            setWebhooks(JSON.parse(stored));
        }
    };

    const generateApiKey = async () => {
        if (!newKeyName.trim()) return;
        setIsCreatingKey(true);

        try {
            // Generate a secure API key
            const key = `luvora_${Array.from(crypto.getRandomValues(new Uint8Array(24)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')}`;

            const newKey: ApiKey = {
                id: crypto.randomUUID(),
                name: newKeyName.trim(),
                key,
                created: new Date().toISOString()
            };

            const updated = [...apiKeys, newKey];
            setApiKeys(updated);
            localStorage.setItem(`api_keys_${user?.id}`, JSON.stringify(updated));

            setNewKeyName('');
            setShowNewKeyForm(false);
            setVisibleKeys(new Set([...visibleKeys, newKey.id]));
        } catch (err) {
            console.error('Failed to generate key:', err);
        } finally {
            setIsCreatingKey(false);
        }
    };

    const deleteApiKey = (keyId: string) => {
        const updated = apiKeys.filter(k => k.id !== keyId);
        setApiKeys(updated);
        localStorage.setItem(`api_keys_${user?.id}`, JSON.stringify(updated));
    };

    const copyApiKey = async (key: string, keyId: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedKeyId(keyId);
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const toggleKeyVisibility = (keyId: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(keyId)) {
            newVisible.delete(keyId);
        } else {
            newVisible.add(keyId);
        }
        setVisibleKeys(newVisible);
    };

    const createWebhook = async () => {
        if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) return;
        setIsCreatingWebhook(true);

        try {
            const webhook: WebhookConfig = {
                id: crypto.randomUUID(),
                name: newWebhook.name.trim(),
                url: newWebhook.url.trim(),
                events: newWebhook.events,
                active: true,
                created: new Date().toISOString()
            };

            const updated = [...webhooks, webhook];
            setWebhooks(updated);
            localStorage.setItem(`webhooks_${user?.id}`, JSON.stringify(updated));

            setNewWebhook({ name: '', url: '', events: [] });
            setShowNewWebhookForm(false);
        } catch (err) {
            console.error('Failed to create webhook:', err);
        } finally {
            setIsCreatingWebhook(false);
        }
    };

    const toggleWebhook = (webhookId: string) => {
        const updated = webhooks.map(w =>
            w.id === webhookId ? { ...w, active: !w.active } : w
        );
        setWebhooks(updated);
        localStorage.setItem(`webhooks_${user?.id}`, JSON.stringify(updated));
    };

    const deleteWebhook = (webhookId: string) => {
        const updated = webhooks.filter(w => w.id !== webhookId);
        setWebhooks(updated);
        localStorage.setItem(`webhooks_${user?.id}`, JSON.stringify(updated));
    };

    const toggleWebhookEvent = (eventId: string) => {
        const events = newWebhook.events.includes(eventId)
            ? newWebhook.events.filter(e => e !== eventId)
            : [...newWebhook.events, eventId];
        setNewWebhook({ ...newWebhook, events });
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-content/5">
            <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Developer Integrations
                </h2>
                <p className="text-sm text-base-content/60 mb-4">
                    Connect Luvora with your apps using API keys and webhooks
                </p>

                {/* Section Tabs */}
                <div className="tabs tabs-boxed bg-base-200 mb-4">
                    <button
                        onClick={() => setActiveSection('api')}
                        className={`tab gap-2 ${activeSection === 'api' ? 'tab-active' : ''}`}
                    >
                        <Key className="w-4 h-4" />
                        API Keys
                    </button>
                    <button
                        onClick={() => setActiveSection('webhooks')}
                        className={`tab gap-2 ${activeSection === 'webhooks' ? 'tab-active' : ''}`}
                    >
                        <Webhook className="w-4 h-4" />
                        Webhooks
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeSection === 'api' ? (
                        <motion.div
                            key="api"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* API Keys List */}
                            {apiKeys.length > 0 && (
                                <div className="space-y-2">
                                    {apiKeys.map(apiKey => (
                                        <div
                                            key={apiKey.id}
                                            className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg border border-base-300"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{apiKey.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-xs bg-base-300 px-2 py-0.5 rounded font-mono">
                                                        {visibleKeys.has(apiKey.id)
                                                            ? apiKey.key
                                                            : '•'.repeat(32)}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-base-content/50 mt-1">
                                                    Created {new Date(apiKey.created).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    title={visibleKeys.has(apiKey.id) ? 'Hide' : 'Show'}
                                                >
                                                    {visibleKeys.has(apiKey.id) ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyApiKey(apiKey.key, apiKey.id)}
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    title="Copy"
                                                >
                                                    {copiedKeyId === apiKey.id ? (
                                                        <Check className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteApiKey(apiKey.id)}
                                                    className="btn btn-ghost btn-xs btn-circle text-error"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Key Form */}
                            <AnimatePresence>
                                {showNewKeyForm ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 p-4 bg-base-200/50 rounded-lg border border-base-300"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Key name (e.g., My App)"
                                            className="input input-bordered w-full"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={generateApiKey}
                                                disabled={isCreatingKey || !newKeyName.trim()}
                                                className="btn btn-primary flex-1"
                                            >
                                                {isCreatingKey ? (
                                                    <span className="loading loading-spinner loading-sm" />
                                                ) : (
                                                    'Generate Key'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowNewKeyForm(false)}
                                                className="btn btn-ghost"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={() => setShowNewKeyForm(true)}
                                        className="btn btn-outline w-full gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create API Key
                                    </button>
                                )}
                            </AnimatePresence>

                            {/* API Docs Link */}
                            <div className="flex items-center gap-2 text-xs text-base-content/50">
                                <Shield className="w-4 h-4" />
                                <span>Keep your API keys secure. Never share them publicly.</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="webhooks"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Webhooks List */}
                            {webhooks.length > 0 && (
                                <div className="space-y-2">
                                    {webhooks.map(webhook => (
                                        <div
                                            key={webhook.id}
                                            className={`p-3 rounded-lg border ${
                                                webhook.active
                                                    ? 'bg-base-200/50 border-base-300'
                                                    : 'bg-base-200/20 border-base-300/50 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{webhook.name}</p>
                                                    <span className={`badge badge-xs ${webhook.active ? 'badge-success' : 'badge-ghost'}`}>
                                                        {webhook.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleWebhook(webhook.id)}
                                                        className="btn btn-ghost btn-xs"
                                                    >
                                                        {webhook.active ? 'Disable' : 'Enable'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteWebhook(webhook.id)}
                                                        className="btn btn-ghost btn-xs btn-circle text-error"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <code className="text-xs bg-base-300 px-2 py-0.5 rounded font-mono block truncate">
                                                {webhook.url}
                                            </code>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {webhook.events.map(event => (
                                                    <span key={event} className="badge badge-sm badge-outline">
                                                        {event}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Webhook Form */}
                            <AnimatePresence>
                                {showNewWebhookForm ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 p-4 bg-base-200/50 rounded-lg border border-base-300"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Webhook name"
                                            className="input input-bordered w-full"
                                            value={newWebhook.name}
                                            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                        />
                                        <input
                                            type="url"
                                            placeholder="https://your-app.com/webhook"
                                            className="input input-bordered w-full font-mono text-sm"
                                            value={newWebhook.url}
                                            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                        />

                                        <div>
                                            <p className="text-sm font-medium mb-2">Events to trigger:</p>
                                            <div className="space-y-1">
                                                {AVAILABLE_EVENTS.map(event => (
                                                    <label
                                                        key={event.id}
                                                        className="flex items-center gap-2 p-2 bg-base-100 rounded cursor-pointer hover:bg-base-200"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-sm checkbox-primary"
                                                            checked={newWebhook.events.includes(event.id)}
                                                            onChange={() => toggleWebhookEvent(event.id)}
                                                        />
                                                        <div>
                                                            <span className="text-sm font-medium">{event.name}</span>
                                                            <p className="text-xs text-base-content/50">{event.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={createWebhook}
                                                disabled={isCreatingWebhook || !newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0}
                                                className="btn btn-primary flex-1"
                                            >
                                                {isCreatingWebhook ? (
                                                    <span className="loading loading-spinner loading-sm" />
                                                ) : (
                                                    'Create Webhook'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowNewWebhookForm(false)}
                                                className="btn btn-ghost"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={() => setShowNewWebhookForm(true)}
                                        className="btn btn-outline w-full gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Webhook
                                    </button>
                                )}
                            </AnimatePresence>

                            {/* Info */}
                            <div className="flex items-start gap-2 text-xs text-base-content/50 bg-base-200/30 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    Webhooks receive POST requests with JSON payloads when selected events occur.
                                    Make sure your endpoint responds with 2xx status within 10 seconds.
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
