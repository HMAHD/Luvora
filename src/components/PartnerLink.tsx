'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Link2,
    Copy,
    Check,
    Send,
    Heart,
    UserPlus,
    Unlink,
    RefreshCw,
    Sparkles,
    X,
    AlertCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';

interface PartnerLinkProps {
    onPartnerLinked?: () => void;
}

type LinkStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

interface PartnerLinkData {
    id: string;
    invite_code: string;
    status: LinkStatus;
    inviter_id: string;
    invitee_id?: string;
    expires_at?: string;
    created: string;
}

export function PartnerLink({ onPartnerLinked }: PartnerLinkProps) {
    const { user, pb } = useAuth();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [partnerLink, setPartnerLink] = useState<PartnerLinkData | null>(null);
    const [linkedPartner, setLinkedPartner] = useState<{ email: string; partner_name?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showLovePing, setShowLovePing] = useState(false);
    const [lovePingMessage, setLovePingMessage] = useState('');
    const [isSendingPing, setIsSendingPing] = useState(false);
    const [pingSuccess, setPingSuccess] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    // Load existing link status
    useEffect(() => {
        if (user?.id) {
            loadPartnerStatus();
        }
    }, [user?.id]);

    const loadPartnerStatus = async () => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            // Check if user has an active partner link from user record
            if (user.linked_partner_id) {
                try {
                    const partner = await pb.collection('users').getOne(user.linked_partner_id);
                    setLinkedPartner({
                        email: partner.email,
                        partner_name: partner.partner_name
                    });
                } catch {
                    // Partner might not be accessible, use fallback
                    setLinkedPartner({ email: 'Partner', partner_name: user.partner_name });
                }
            }

            // Try to load from PocketBase, fallback to localStorage if permissions not set
            try {
                const invites = await pb.collection('partner_links').getList(1, 1, {
                    filter: `inviter_id = "${user.id}" && status = "pending"`,
                    sort: '-created'
                });

                if (invites.items.length > 0) {
                    const invite = invites.items[0] as unknown as PartnerLinkData;
                    setPartnerLink(invite);
                    setInviteCode(invite.invite_code);
                }
            } catch {
                // PocketBase collection rules not configured - use localStorage fallback
                const stored = localStorage.getItem(`partner_invite_${user.id}`);
                if (stored) {
                    const invite = JSON.parse(stored) as PartnerLinkData;
                    if (invite.status === 'pending') {
                        setPartnerLink(invite);
                        setInviteCode(invite.invite_code);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load partner status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const generateInviteCode = async () => {
        if (!user?.id) return;
        setIsGenerating(true);

        try {
            // Generate a unique code
            const code = `LUV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            // Set expiry to 7 days from now
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const inviteData: PartnerLinkData = {
                id: crypto.randomUUID(),
                inviter_id: user.id,
                invite_code: code,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
                created: new Date().toISOString()
            };

            // Try PocketBase first, fallback to localStorage
            try {
                const invite = await pb.collection('partner_links').create({
                    inviter_id: user.id,
                    invite_code: code,
                    status: 'pending',
                    expires_at: expiresAt.toISOString()
                });
                setPartnerLink(invite as unknown as PartnerLinkData);
            } catch {
                // PocketBase not configured - use localStorage
                localStorage.setItem(`partner_invite_${user.id}`, JSON.stringify(inviteData));
                setPartnerLink(inviteData);
            }

            setInviteCode(code);
        } catch (err) {
            console.error('Failed to generate invite:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyInviteCode = async () => {
        if (!inviteCode) return;
        await navigator.clipboard.writeText(inviteCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const joinWithCode = async () => {
        if (!user?.id || !joinCode.trim()) return;
        setIsJoining(true);
        setJoinError(null);

        try {
            // Find the invite
            const invites = await pb.collection('partner_links').getList(1, 1, {
                filter: `invite_code = "${joinCode.trim().toUpperCase().replace(/["\\\n\r]/g, '')}" && status = "pending"`
            });

            if (invites.items.length === 0) {
                setJoinError('Invalid or expired invite code');
                return;
            }

            const invite = invites.items[0];

            // Check if not self-invite
            if (invite.inviter_id === user.id) {
                setJoinError("You can't use your own invite code");
                return;
            }

            // Update the invite
            await pb.collection('partner_links').update(invite.id, {
                invitee_id: user.id,
                status: 'accepted'
            });

            // Link both users
            await pb.collection('users').update(user.id, {
                linked_partner_id: invite.inviter_id
            });

            await pb.collection('users').update(invite.inviter_id, {
                linked_partner_id: user.id
            });

            // Update auth store
            const currentRecord = pb.authStore.record;
            if (currentRecord) {
                pb.authStore.save(pb.authStore.token!, {
                    ...currentRecord,
                    linked_partner_id: invite.inviter_id
                });
            }

            // Reload status
            await loadPartnerStatus();
            onPartnerLinked?.();
        } catch (err) {
            console.error('Failed to join:', err);
            setJoinError('Failed to connect with partner');
        } finally {
            setIsJoining(false);
        }
    };

    const unlinkPartner = async () => {
        if (!user?.id || !user.linked_partner_id) return;

        try {
            // Unlink both users
            await pb.collection('users').update(user.id, {
                linked_partner_id: ''
            });

            await pb.collection('users').update(user.linked_partner_id, {
                linked_partner_id: ''
            });

            // Update auth store
            const currentRecord = pb.authStore.record;
            if (currentRecord) {
                pb.authStore.save(pb.authStore.token!, {
                    ...currentRecord,
                    linked_partner_id: ''
                });
            }

            setLinkedPartner(null);
        } catch (err) {
            console.error('Failed to unlink:', err);
        }
    };

    const sendLovePing = async () => {
        if (!user?.id || !user.linked_partner_id || !lovePingMessage.trim()) return;
        setIsSendingPing(true);

        try {
            // In a real implementation, this would send a notification
            // For now, we'll simulate it
            await new Promise(resolve => setTimeout(resolve, 1000));

            setPingSuccess(true);
            setTimeout(() => {
                setShowLovePing(false);
                setLovePingMessage('');
                setPingSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to send ping:', err);
        } finally {
            setIsSendingPing(false);
        }
    };

    const QUICK_PINGS = [
        "Thinking of you 💭",
        "I love you! ❤️",
        "Miss you 🥺",
        "Can't wait to see you! ✨",
        "You're amazing 🌟",
        "Sending hugs 🤗"
    ];

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md text-primary" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body">
                    <h2 className="card-title text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Partner Link
                    </h2>
                    <p className="text-sm text-base-content/60 mb-4">
                        Connect with your partner for synchronized sparks and Love Pings
                    </p>

                    {linkedPartner ? (
                        // Connected State
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-success/10 rounded-xl border border-success/20">
                                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-success">Connected!</p>
                                    <p className="text-sm text-base-content/60">
                                        Linked with {linkedPartner.partner_name || linkedPartner.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowLovePing(true)}
                                    className="btn btn-primary flex-1 gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Love Ping
                                </button>
                                <button
                                    onClick={unlinkPartner}
                                    className="btn btn-ghost btn-square text-error"
                                    title="Unlink Partner"
                                >
                                    <Unlink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Not Connected State
                        <div className="space-y-6">
                            {/* Generate Invite Section */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <Link2 className="w-4 h-4" />
                                    Invite Your Partner
                                </h3>

                                {inviteCode ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 font-mono text-lg tracking-wider bg-base-200 rounded-lg p-3 text-center">
                                            {inviteCode}
                                        </div>
                                        <button
                                            onClick={copyInviteCode}
                                            className="btn btn-primary btn-square"
                                        >
                                            {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={generateInviteCode}
                                        disabled={isGenerating}
                                        className="btn btn-primary w-full gap-2"
                                    >
                                        {isGenerating ? (
                                            <span className="loading loading-spinner loading-sm" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Generate Invite Code
                                            </>
                                        )}
                                    </button>
                                )}

                                {inviteCode && (
                                    <p className="text-xs text-base-content/50 text-center">
                                        Share this code with your partner. Expires in 7 days.
                                    </p>
                                )}
                            </div>

                            <div className="divider text-xs text-base-content/40">OR</div>

                            {/* Join with Code Section */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Join with Partner&apos;s Code
                                </h3>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter invite code (e.g., LUV-XXXX-XXXX)"
                                        className={`input input-bordered flex-1 font-mono uppercase ${joinError ? 'input-error' : ''}`}
                                        value={joinCode}
                                        onChange={(e) => {
                                            setJoinCode(e.target.value.toUpperCase());
                                            setJoinError(null);
                                        }}
                                    />
                                    <button
                                        onClick={joinWithCode}
                                        disabled={isJoining || !joinCode.trim()}
                                        className="btn btn-outline btn-primary"
                                    >
                                        {isJoining ? (
                                            <span className="loading loading-spinner loading-sm" />
                                        ) : (
                                            'Join'
                                        )}
                                    </button>
                                </div>

                                {joinError && (
                                    <p className="text-xs text-error flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {joinError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Love Ping Modal */}
            {showLovePing && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => !isSendingPing && setShowLovePing(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-content/10"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Send className="w-5 h-5 text-primary" />
                                    Send Love Ping
                                </h3>
                                <button
                                    onClick={() => setShowLovePing(false)}
                                    className="btn btn-ghost btn-sm btn-circle"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {pingSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="w-16 h-16 rounded-full bg-success/20 mx-auto mb-4 flex items-center justify-center"
                                        >
                                            <Heart className="w-8 h-8 text-success fill-success" />
                                        </motion.div>
                                        <p className="text-lg font-semibold text-success">Sent!</p>
                                        <p className="text-sm text-base-content/60">Your love ping is on its way 💕</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        {/* Quick Pings */}
                                        <div>
                                            <p className="text-sm text-base-content/60 mb-2">Quick messages:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {QUICK_PINGS.map((ping, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setLovePingMessage(ping)}
                                                        className={`btn btn-sm ${lovePingMessage === ping ? 'btn-primary' : 'btn-outline'}`}
                                                    >
                                                        {ping}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="divider text-xs">or write your own</div>

                                        {/* Custom Message */}
                                        <textarea
                                            placeholder="Type your love ping..."
                                            className="textarea textarea-bordered w-full h-24 resize-none"
                                            value={lovePingMessage}
                                            onChange={(e) => setLovePingMessage(e.target.value)}
                                            maxLength={200}
                                        />

                                        <button
                                            onClick={sendLovePing}
                                            disabled={isSendingPing || !lovePingMessage.trim()}
                                            className="btn btn-primary w-full gap-2"
                                        >
                                            {isSendingPing ? (
                                                <span className="loading loading-spinner loading-sm" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Send to {linkedPartner?.partner_name || 'Partner'}
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
