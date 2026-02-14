'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';

interface DiscordSetupProps {
    userId: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

interface DiscordStatus {
    connected: boolean;
    enabled?: boolean;
    botUsername?: string;
    discordUserId?: string;
    linked?: boolean;
}

export function DiscordSetup({ userId, onSuccess, onError }: DiscordSetupProps) {
    const [step, setStep] = useState<'instructions' | 'token' | 'linking' | 'success'>('instructions');
    const [botToken, setBotToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<DiscordStatus | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch current status on mount
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/channels/discord/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);

                if (data.connected && data.linked) {
                    setStep('success');
                }
            }
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    };

    const validateToken = (token: string): boolean => {
        // Discord bot tokens format: base64 string with two periods
        // Format: [24+ chars].[6+ chars].[27+ chars]
        const tokenRegex = /^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{27,}$/;
        return tokenRegex.test(token.trim());
    };

    const handleSetup = async () => {
        const trimmedToken = botToken.trim();

        if (!validateToken(trimmedToken)) {
            setError('Invalid token format. Please check and try again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/channels/discord/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ botToken: trimmedToken })
            });

            const data = await res.json();

            if (!res.ok) {
                let errorMessage = data.error || 'Failed to setup Discord bot';

                // Provide helpful error messages
                if (errorMessage.includes('ENCRYPTION_KEY')) {
                    errorMessage = 'Server configuration error. Please contact support.';
                } else if (errorMessage.includes('Invalid bot token')) {
                    errorMessage = 'Invalid bot token. Please check the token from Discord Developer Portal.';
                } else if (errorMessage.includes('bot account')) {
                    errorMessage = 'Token must be for a bot account, not a user account.';
                }

                throw new Error(errorMessage);
            }

            // Success! Move to linking step
            setStep('linking');
            await fetchStatus();

            // Start polling for link status
            startLinkingPoll();

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Setup failed';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Poll status every 3 seconds to detect when user sends /start
    const startLinkingPoll = () => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/channels/discord/status');
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);

                    if (data.linked) {
                        clearInterval(pollInterval);
                        setStep('success');
                        onSuccess?.();
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
    };

    const handleTestMessage = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/test-discord', {
                method: 'POST',
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Failed to send test message');
            }

            // Show success feedback
            setError('');
        } catch (err) {
            setError('Failed to send test message. Make sure you sent /start to your bot.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {/* Step 1: Instructions */}
                {step === 'instructions' && (
                    <motion.div
                        key="instructions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-semibold">Create Your Own Discord Bot</p>
                                <p className="opacity-75">You'll receive messages through your personal bot</p>
                            </div>
                        </div>

                        <div className="card bg-base-200/50 p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="badge badge-primary badge-sm">Step 1</span>
                                Create Bot via Developer Portal
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
                                <li>Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="link">Discord Developer Portal</a></li>
                                <li>Click "New Application" and give it a name</li>
                                <li>Go to the "Bot" section in the left sidebar</li>
                                <li>Click "Reset Token" and copy the new token</li>
                                <li>Enable "Message Content Intent" under Privileged Gateway Intents</li>
                                <li>Click "Save Changes"</li>
                            </ol>
                            <a
                                href="https://discord.com/developers/applications"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm mt-3 gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Developer Portal
                            </a>
                        </div>

                        <button
                            onClick={() => setStep('token')}
                            className="btn btn-primary btn-block"
                        >
                            I have my bot token
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Token Input */}
                {step === 'token' && (
                    <motion.div
                        key="token"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                    <span className="text-secondary font-bold text-lg">2</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base">Enter Bot Token</h3>
                                    <p className="text-xs text-base-content/60">Paste the token from Discord Developer Portal</p>
                                </div>
                            </div>

                            {/* Token Input Card */}
                            <div className="card bg-base-100 border border-base-content/10 shadow-sm">
                                <div className="card-body p-4 space-y-3">
                                    <div className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text font-medium text-sm">Bot Token</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Your Discord bot token"
                                            className={`input input-bordered w-full font-mono text-xs ${error ? 'input-error focus:input-error' : 'focus:input-secondary'}`}
                                            value={botToken}
                                            onChange={(e) => {
                                                setBotToken(e.target.value);
                                                setError('');
                                            }}
                                            disabled={loading}
                                            autoFocus
                                        />
                                        <label className="label pt-1">
                                            <span className="label-text-alt text-base-content/50">Your token is encrypted and stored securely</span>
                                        </label>
                                    </div>

                                    {/* Security Note */}
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="text-xs text-warning-content/90">
                                            <span className="font-semibold block mb-1">Keep this token private</span>
                                            <span className="opacity-80">Never share your bot token publicly or with anyone</span>
                                        </div>
                                    </div>

                                    {/* Error Alert */}
                                    {error && (
                                        <div className="alert alert-error shadow-sm">
                                            <AlertCircle className="w-5 h-5" />
                                            <div className="text-sm">
                                                <p className="font-semibold">Connection Failed</p>
                                                <p className="opacity-90">{error}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('instructions')}
                                className="btn btn-ghost flex-1"
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSetup}
                                disabled={loading || !botToken.trim()}
                                className="btn btn-primary flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Connect Bot'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Linking */}
                {step === 'linking' && (
                    <motion.div
                        key="linking"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="card bg-base-200/50 p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="badge badge-primary badge-sm">Step 3</span>
                                Link Your Account
                            </h3>

                            <div className="alert alert-info mb-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <div className="text-sm">
                                    <p className="font-semibold">Waiting for you to start the bot...</p>
                                    <p className="opacity-75">This usually takes just a few seconds</p>
                                </div>
                            </div>

                            <div className="bg-base-300 rounded-lg p-4 space-y-3">
                                <p className="text-sm font-medium">Complete these steps in Discord:</p>
                                <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
                                    <li>Open Discord</li>
                                    <li>Search for your bot: <code className="kbd kbd-sm">{status?.botUsername || 'your_bot'}</code></li>
                                    <li>Send the bot a direct message with: <code className="kbd kbd-sm">/start</code></li>
                                </ol>

                                {status?.botUsername && (
                                    <button
                                        onClick={() => copyToClipboard(status.botUsername!)}
                                        className="btn btn-sm btn-block gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy {status.botUsername}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="alert alert-success">
                            <CheckCircle className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">Discord Connected!</p>
                                <p className="text-sm opacity-75">
                                    You'll receive your daily sparks via {status?.botUsername}
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-200/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Bot Username</span>
                                <code className="kbd kbd-sm">{status?.botUsername}</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <span className="badge badge-success badge-sm">Active</span>
                            </div>
                        </div>

                        <button
                            onClick={handleTestMessage}
                            disabled={loading}
                            className="btn btn-outline btn-block gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Test Message
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
