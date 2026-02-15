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

interface ChannelInfo {
    platform: string;
    enabled: boolean;
    configured: boolean;
    running: boolean;
    healthy: boolean;
    config: {
        botUsername?: string;
        phoneNumber?: string;
    } | null;
}

interface ChannelStatus {
    userId: string;
    userTier: number;
    hasSingleChannelRestriction: boolean;
    canAddMore: boolean;
    connectedChannels: MessagingPlatform[];
    channels: ChannelInfo[];
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
            if (!user?.id || !pb.authStore.token) {
                console.log('[AutomationSettings] Skipping channel status fetch - no user or token', { userId: user?.id, hasToken: !!pb.authStore.token });
                setLoadingChannelStatus(false);
                return;
            }

            try {
                console.log('[AutomationSettings] Fetching channel status for user:', user.id);
                const response = await fetch('/api/messaging/channels', {
                    headers: {
                        'Authorization': `Bearer ${pb.authStore.token}`
                    }
                });

                console.log('[AutomationSettings] API response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('[AutomationSettings] Channel status:', data);
                    console.log('[AutomationSettings] Channels array:', data.channels);
                    console.log('[AutomationSettings] Configured channels:', data.channels?.filter((c: any) => c.configured));
                    setChannelStatus(data);
                } else {
                    const errorText = await response.text();
                    console.error('[AutomationSettings] API error:', response.status, errorText);
                }
            } catch (error) {
                console.error('[AutomationSettings] Failed to fetch channel status:', error);
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
                        <div className="mb-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                Messaging Channel
                            </h3>
                            <p className="text-sm opacity-60">Connect your preferred messaging platform to receive daily sparks directly</p>
                        </div>

                        {loadingChannelStatus ? (
                            <div className="flex items-center justify-center py-8">
                                <span className="loading loading-spinner loading-md" />
                            </div>
                        ) : !showMessagingSetup ? (
                            <>
                                {/* Check if user has a configured channel */}
                                {channelStatus?.channels?.some(c => c.configured) ? (
                                    /* Show only the configured channel */
                                    (() => {
                                        const configuredChannel = channelStatus.channels.find(c => c.configured)!;
                                        const platform = configuredChannel.platform as MessagingPlatform;

                                        return (
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Connected channel card */}
                                        <div className="border-2 border-success bg-success/5 rounded-2xl p-6 relative">
                                            <div className="absolute top-4 right-4">
                                                <span className="badge badge-success gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Connected
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                                                    platform === 'telegram' ? 'bg-sky-100' :
                                                    platform === 'whatsapp' ? 'bg-green-100' :
                                                    'bg-indigo-100'
                                                }`}>
                                                    {platform === 'telegram' && (
                                                        <svg className="w-10 h-10 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                                        </svg>
                                                    )}
                                                    {platform === 'whatsapp' && (
                                                        <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                    )}
                                                    {platform === 'discord' && (
                                                        <svg className="w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold capitalize text-primary">
                                                        {platform}
                                                    </h4>
                                                    <p className="text-sm opacity-60 mb-3">
                                                        {platform === 'telegram' ? 'Bot-based delivery' :
                                                         platform === 'whatsapp' ? 'QR code linking' :
                                                         'DM notifications'}
                                                    </p>
                                                    {configuredChannel.config?.botUsername && (
                                                        <p className="text-xs opacity-50 mb-2">
                                                            @{configuredChannel.config.botUsername}
                                                        </p>
                                                    )}
                                                    {configuredChannel.config?.phoneNumber && (
                                                        <p className="text-xs opacity-50 mb-2">
                                                            {configuredChannel.config.phoneNumber}
                                                        </p>
                                                    )}
                                                    <button
                                                        onClick={() => handleDisconnect(platform)}
                                                        className="btn btn-sm btn-ghost btn-error gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info message */}
                                        {channelStatus.hasSingleChannelRestriction && (
                                            <div className="alert alert-info">
                                                <Info className="w-4 h-4" />
                                                <div className="text-sm">
                                                    <p className="font-medium">Want to switch platforms?</p>
                                                    <p className="text-xs opacity-70">Disconnect your current channel first, then select a different platform.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                        );
                                    })()
                                ) : (
                                    /* Show all 3 channel options when nothing is configured */
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Telegram Card */}
                                            <div
                                                onClick={() => setSelectedPlatform('telegram')}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 relative ${
                                                    selectedPlatform === 'telegram'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-base-300 hover:border-primary/50'
                                                }`}
                                            >
                                                {selectedPlatform === 'telegram' && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="badge badge-primary badge-sm">Selected</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="font-semibold text-primary">Telegram</h4>
                                                        <p className="text-xs opacity-60">Bot-based delivery</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WhatsApp Card */}
                                            <div
                                                onClick={() => setSelectedPlatform('whatsapp')}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 relative ${
                                                    selectedPlatform === 'whatsapp'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-base-300 hover:border-primary/50'
                                                }`}
                                            >
                                                {selectedPlatform === 'whatsapp' && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="badge badge-primary badge-sm">Selected</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="font-semibold text-primary">WhatsApp</h4>
                                                        <p className="text-xs opacity-60">QR code linking</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Discord Card */}
                                            <div
                                                onClick={() => setSelectedPlatform('discord')}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 relative ${
                                                    selectedPlatform === 'discord'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-base-300 hover:border-primary/50'
                                                }`}
                                            >
                                                {selectedPlatform === 'discord' && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="badge badge-primary badge-sm">Selected</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0 a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                                        </svg>
                                                    </div>
                                                    <div className="text-center">
                                                        <h4 className="font-semibold text-primary">Discord</h4>
                                                        <p className="text-xs opacity-60">DM notifications</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info banner */}
                                        <div className="alert alert-info">
                                            <Info className="w-4 h-4" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    Create your own {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} bot using {selectedPlatform === 'telegram' ? '@BotFather' : selectedPlatform === 'whatsapp' ? 'QR code' : 'Developer Portal'}
                                                </p>
                                                <p className="text-xs opacity-70">Your bot token is securely encrypted and stored</p>
                                            </div>
                                        </div>

                                        {/* Configure button */}
                                        <button
                                            onClick={() => setShowMessagingSetup(true)}
                                            className="btn btn-primary btn-lg btn-block gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            Configure {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Bot
                                        </button>
                                    </>
                                )}
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
