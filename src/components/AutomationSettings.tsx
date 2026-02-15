'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
    Clock,
    MessageCircle,
    X,
    Sun,
    Moon,
    Heart,
    Sparkles,
    Calendar,
    Crown,
    Gift,
    Send,
    CheckCircle,
    AlertCircle,
    Info
} from 'lucide-react';
import { TIER, LOVE_LANGUAGE_NAMES, EMOTIONAL_TONE_NAMES } from '@/lib/types';
import type { LoveLanguage, EmotionalTone } from '@/lib/types';
import { TelegramSetup } from './messaging/TelegramSetup';
import { WhatsAppSetup } from './messaging/WhatsAppSetup';
import { DiscordSetup } from './messaging/DiscordSetup';

type MessagingPlatform = 'telegram' | 'whatsapp' | 'discord';

interface ChannelStatus {
    userId: string;
    userTier: number;
    hasSingleChannelRestriction: boolean;
    canAddMore: boolean;
    connectedChannels: MessagingPlatform[];
    message: string | null;
}

export function AutomationSettings({ onClose }: { onClose: () => void }) {
    const { user, pb } = useAuth();

    // Messaging platform selection
    const [selectedPlatform, setSelectedPlatform] = useState<MessagingPlatform>('telegram');
    const [showMessagingSetup, setShowMessagingSetup] = useState(false);
    const [channelStatus, setChannelStatus] = useState<ChannelStatus | null>(null);
    const [loadingChannelStatus, setLoadingChannelStatus] = useState(true);

    // Delivery times
    const [morningEnabled, setMorningEnabled] = useState(user?.morning_enabled ?? true);
    const [morningTime, setMorningTime] = useState(user?.morning_time || '08:00');
    const [eveningEnabled, setEveningEnabled] = useState(user?.evening_enabled ?? false);
    const [eveningTime, setEveningTime] = useState(user?.evening_time || '20:00');

    // Legend settings
    const [loveLanguage, setLoveLanguage] = useState<LoveLanguage | ''>(user?.love_language || '');
    const [preferredTone, setPreferredTone] = useState<EmotionalTone | ''>(user?.preferred_tone || '');
    const [anniversaryDate, setAnniversaryDate] = useState(user?.anniversary_date || '');
    const [partnerBirthday, setPartnerBirthday] = useState(user?.partner_birthday || '');
    const [specialOccasionsEnabled, setSpecialOccasionsEnabled] = useState(user?.special_occasions_enabled ?? true);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const isLegend = (user?.tier ?? 0) >= TIER.LEGEND;
    const isHeroPlus = (user?.tier ?? 0) >= TIER.HERO;

    // Fetch channel status on mount
    useEffect(() => {
        const fetchChannelStatus = async () => {
            if (!user?.id || !pb.authStore.token) return;

            try {
                const response = await fetch('/api/messaging/channels', {
                    headers: {
                        'Authorization': `Bearer ${pb.authStore.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setChannelStatus(data);
                }
            } catch (error) {
                console.error('Failed to fetch channel status:', error);
            } finally {
                setLoadingChannelStatus(false);
            }
        };

        fetchChannelStatus();
    }, [user?.id, pb.authStore.token]);

    const handleDisconnect = async (platform: MessagingPlatform) => {
        if (!user?.id || !pb.authStore.token) return;

        try {
            const response = await fetch(`/api/messaging/${platform}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${pb.authStore.token}`
                }
            });

            if (response.ok) {
                // Refresh channel status
                const statusResponse = await fetch('/api/messaging/channels', {
                    headers: {
                        'Authorization': `Bearer ${pb.authStore.token}`
                    }
                });

                if (statusResponse.ok) {
                    const data = await statusResponse.json();
                    setChannelStatus(data);
                }
            }
        } catch (error) {
            console.error('Failed to disconnect channel:', error);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const updateData: Record<string, unknown> = {
                timezone: timezone,
                // Delivery times
                morning_enabled: morningEnabled,
                morning_time: morningTime,
                evening_enabled: eveningEnabled,
                evening_time: eveningTime,
            };

            // Legend-only fields
            if (isLegend) {
                updateData.love_language = loveLanguage || null;
                updateData.preferred_tone = preferredTone || null;
                updateData.anniversary_date = anniversaryDate || null;
                updateData.partner_birthday = partnerBirthday || null;
                updateData.special_occasions_enabled = specialOccasionsEnabled;
            }

            await pb.collection('users').update(user.id, updateData);
            // Refresh auth to update user data in context
            await pb.collection('users').authRefresh();
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm z-10">
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-1">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold font-serif">Automation Hub</h2>
                    </div>
                    <p className="opacity-60 text-sm mb-6">Set up automatic spark delivery to your partner.</p>

                    {/* Messaging Platform Selection & Setup */}
                    <div className="space-y-5">
                        <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 p-4">
                            <label className="label">
                                <span className="label-text flex items-center gap-2 font-medium">
                                    <MessageCircle className="w-4 h-4" /> Messaging Channel
                                </span>
                            </label>

                            {loadingChannelStatus ? (
                                <div className="flex items-center justify-center py-4">
                                    <span className="loading loading-spinner loading-sm" />
                                </div>
                            ) : !showMessagingSetup ? (
                                <>
                                    {/* Show connected channel status */}
                                    {channelStatus && channelStatus.connectedChannels.length > 0 && (
                                        <div className="alert alert-success mb-3">
                                            <CheckCircle className="w-4 h-4" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {channelStatus.connectedChannels[0].charAt(0).toUpperCase() +
                                                     channelStatus.connectedChannels[0].slice(1)} Connected
                                                </p>
                                                <p className="text-xs opacity-70">
                                                    Receiving daily sparks
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDisconnect(channelStatus.connectedChannels[0])}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    )}

                                    {/* Show single-channel restriction warning for Hero/Legend */}
                                    {channelStatus && channelStatus.hasSingleChannelRestriction && !channelStatus.canAddMore && (
                                        <div className="alert alert-warning mb-3">
                                            <Info className="w-4 h-4" />
                                            <p className="text-xs">
                                                You can only connect one messaging channel at a time.
                                                Disconnect {channelStatus.connectedChannels[0]} to switch platforms.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <button
                                            onClick={() => setSelectedPlatform('telegram')}
                                            disabled={channelStatus && !channelStatus.canAddMore && !channelStatus.connectedChannels.includes('telegram')}
                                            className={`btn btn-sm ${selectedPlatform === 'telegram' ? 'btn-primary' : 'btn-outline'} ${channelStatus?.connectedChannels.includes('telegram') ? 'btn-success' : ''}`}
                                        >
                                            {channelStatus?.connectedChannels.includes('telegram') && <CheckCircle className="w-3 h-3 mr-1" />}
                                            Telegram
                                        </button>
                                        <button
                                            onClick={() => setSelectedPlatform('whatsapp')}
                                            disabled={channelStatus && !channelStatus.canAddMore && !channelStatus.connectedChannels.includes('whatsapp')}
                                            className={`btn btn-sm ${selectedPlatform === 'whatsapp' ? 'btn-primary' : 'btn-outline'} ${channelStatus?.connectedChannels.includes('whatsapp') ? 'btn-success' : ''}`}
                                        >
                                            {channelStatus?.connectedChannels.includes('whatsapp') && <CheckCircle className="w-3 h-3 mr-1" />}
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={() => setSelectedPlatform('discord')}
                                            disabled={channelStatus && !channelStatus.canAddMore && !channelStatus.connectedChannels.includes('discord')}
                                            className={`btn btn-sm ${selectedPlatform === 'discord' ? 'btn-primary' : 'btn-outline'} ${channelStatus?.connectedChannels.includes('discord') ? 'btn-success' : ''}`}
                                        >
                                            {channelStatus?.connectedChannels.includes('discord') && <CheckCircle className="w-3 h-3 mr-1" />}
                                            Discord
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowMessagingSetup(true)}
                                        disabled={channelStatus && !channelStatus.canAddMore}
                                        className="btn btn-primary btn-block btn-sm gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {channelStatus?.connectedChannels.includes(selectedPlatform)
                                            ? `Reconfigure ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}`
                                            : `Set up ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}`}
                                    </button>

                                    <div className="alert alert-info mt-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs">
                                            {selectedPlatform === 'telegram'
                                                ? 'Create your own Telegram bot to receive messages'
                                                : selectedPlatform === 'whatsapp'
                                                ? 'Link your WhatsApp to receive messages'
                                                : 'Create your own Discord bot to receive messages'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {selectedPlatform === 'telegram' ? 'Telegram' : selectedPlatform === 'whatsapp' ? 'WhatsApp' : 'Discord'} Setup
                                        </span>
                                        <button
                                            onClick={() => setShowMessagingSetup(false)}
                                            className="btn btn-ghost btn-xs"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {selectedPlatform === 'telegram' ? (
                                        <TelegramSetup
                                            userId={user?.id || ''}
                                            onSuccess={async () => {
                                                setShowMessagingSetup(false);
                                                // Refresh channel status
                                                try {
                                                    const response = await fetch('/api/messaging/channels', {
                                                        headers: {
                                                            'Authorization': `Bearer ${pb.authStore.token}`
                                                        }
                                                    });
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        setChannelStatus(data);
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to refresh channel status:', error);
                                                }
                                            }}
                                            onError={(error) => {
                                                console.error('Telegram setup error:', error);
                                            }}
                                        />
                                    ) : selectedPlatform === 'whatsapp' ? (
                                        <WhatsAppSetup
                                            userId={user?.id || ''}
                                            onSuccess={async () => {
                                                setShowMessagingSetup(false);
                                                // Refresh channel status
                                                try {
                                                    const response = await fetch('/api/messaging/channels', {
                                                        headers: {
                                                            'Authorization': `Bearer ${pb.authStore.token}`
                                                        }
                                                    });
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        setChannelStatus(data);
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to refresh channel status:', error);
                                                }
                                            }}
                                            onError={(error) => {
                                                console.error('WhatsApp setup error:', error);
                                            }}
                                        />
                                    ) : (
                                        <DiscordSetup
                                            userId={user?.id || ''}
                                            onSuccess={async () => {
                                                setShowMessagingSetup(false);
                                                // Refresh channel status
                                                try {
                                                    const response = await fetch('/api/messaging/channels', {
                                                        headers: {
                                                            'Authorization': `Bearer ${pb.authStore.token}`
                                                        }
                                                    });
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        setChannelStatus(data);
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to refresh channel status:', error);
                                                }
                                            }}
                                            onError={(error) => {
                                                console.error('Discord setup error:', error);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="divider text-xs opacity-50">DELIVERY SCHEDULE</div>

                        {/* Morning Delivery */}
                        <div className="card bg-base-200/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-5 h-5 text-warning" />
                                    <span className="font-medium">Morning Spark</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={morningEnabled}
                                    onChange={(e) => setMorningEnabled(e.target.checked)}
                                />
                            </div>
                            {morningEnabled && (
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Delivery Time
                                        </span>
                                    </label>
                                    <input
                                        type="time"
                                        className="input input-bordered input-sm w-full"
                                        value={morningTime}
                                        onChange={(e) => setMorningTime(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Evening Delivery */}
                        <div className="card bg-base-200/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Moon className="w-5 h-5 text-info" />
                                    <span className="font-medium">Night Spark</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={eveningEnabled}
                                    onChange={(e) => setEveningEnabled(e.target.checked)}
                                />
                            </div>
                            {eveningEnabled && (
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Delivery Time
                                        </span>
                                    </label>
                                    <input
                                        type="time"
                                        className="input input-bordered input-sm w-full"
                                        value={eveningTime}
                                        onChange={(e) => setEveningTime(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-xs opacity-50 text-center">
                            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </div>

                        {/* Legend Exclusive Section */}
                        {isLegend ? (
                            <>
                                <div className="divider text-xs">
                                    <span className="flex items-center gap-1 text-warning">
                                        <Crown className="w-3 h-3" /> LEGEND FEATURES
                                    </span>
                                </div>

                                {/* Love Language */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text flex items-center gap-2 font-medium">
                                            <Heart className="w-4 h-4 text-error" /> Love Language
                                        </span>
                                    </label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={loveLanguage}
                                        onChange={(e) => setLoveLanguage(e.target.value as LoveLanguage)}
                                    >
                                        <option value="">Auto (Varied messages)</option>
                                        {Object.entries(LOVE_LANGUAGE_NAMES).map(([key, name]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                    </select>
                                    <label className="label py-1">
                                        <span className="label-text-alt opacity-50">Messages tailored to how your partner feels love</span>
                                    </label>
                                </div>

                                {/* Emotional Tone */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text flex items-center gap-2 font-medium">
                                            <Sparkles className="w-4 h-4 text-secondary" /> Emotional Tone
                                        </span>
                                    </label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={preferredTone}
                                        onChange={(e) => setPreferredTone(e.target.value as EmotionalTone)}
                                    >
                                        <option value="">Auto (Varied tones)</option>
                                        {Object.entries(EMOTIONAL_TONE_NAMES).map(([key, name]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                    </select>
                                    <label className="label py-1">
                                        <span className="label-text-alt opacity-50">Set the mood of your daily sparks</span>
                                    </label>
                                </div>

                                {/* Special Occasions */}
                                <div className="card bg-warning/5 border border-warning/20 p-4">
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
                                    <p className="text-xs opacity-60 mb-3">
                                        Get extra special messages on anniversaries and birthdays
                                    </p>

                                    {specialOccasionsEnabled && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="form-control">
                                                <label className="label py-1">
                                                    <span className="label-text text-xs flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Anniversary
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
                                                        <Gift className="w-3 h-3" /> Partner Birthday
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
                                </div>
                            </>
                        ) : isHeroPlus ? (
                            <div className="card bg-warning/5 border border-warning/20 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-5 h-5 text-warning" />
                                    <span className="font-medium text-warning">Unlock Legend Features</span>
                                </div>
                                <p className="text-xs opacity-60 mb-3">
                                    Get Love Language mode, Emotional Tones, Anniversary Intelligence, and more!
                                </p>
                                <a href="/pricing" className="btn btn-warning btn-sm">
                                    Upgrade to Legend
                                </a>
                            </div>
                        ) : null}

                        <button
                            onClick={handleSave}
                            disabled={loading || success}
                            className={`btn btn-block mt-4 ${success ? 'btn-success' : 'btn-primary'}`}
                        >
                            {loading ? <span className="loading loading-spinner" /> : (success ? 'Saved!' : 'Save Settings')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
