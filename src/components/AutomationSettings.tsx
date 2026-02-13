'use client';

import { useState } from 'react';
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
    Send
} from 'lucide-react';
import { TIER, LOVE_LANGUAGE_NAMES, EMOTIONAL_TONE_NAMES } from '@/lib/types';
import type { LoveLanguage, EmotionalTone } from '@/lib/types';
import { TelegramSetup } from './messaging/TelegramSetup';
import { WhatsAppSetup } from './messaging/WhatsAppSetup';

export function AutomationSettings({ onClose }: { onClose: () => void }) {
    const { user, pb } = useAuth();

    // Messaging platform selection
    const [selectedPlatform, setSelectedPlatform] = useState<'telegram' | 'whatsapp'>('telegram');
    const [showMessagingSetup, setShowMessagingSetup] = useState(false);

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

                            {!showMessagingSetup ? (
                                <>
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => setSelectedPlatform('telegram')}
                                            className={`btn flex-1 ${selectedPlatform === 'telegram' ? 'btn-primary' : 'btn-outline'}`}
                                        >
                                            Telegram
                                        </button>
                                        <button
                                            onClick={() => setSelectedPlatform('whatsapp')}
                                            className={`btn flex-1 ${selectedPlatform === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                                        >
                                            WhatsApp
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowMessagingSetup(true)}
                                        className="btn btn-primary btn-block btn-sm gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Set up {selectedPlatform === 'telegram' ? 'Telegram' : 'WhatsApp'}
                                    </button>

                                    <div className="alert alert-info mt-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs">
                                            {selectedPlatform === 'telegram'
                                                ? 'Create your own Telegram bot to receive messages'
                                                : 'Link your WhatsApp to receive messages'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {selectedPlatform === 'telegram' ? 'Telegram' : 'WhatsApp'} Setup
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
                                            onSuccess={() => {
                                                setShowMessagingSetup(false);
                                            }}
                                            onError={(error) => {
                                                console.error('Telegram setup error:', error);
                                            }}
                                        />
                                    ) : (
                                        <WhatsAppSetup
                                            userId={user?.id || ''}
                                            onSuccess={() => {
                                                setShowMessagingSetup(false);
                                            }}
                                            onError={(error) => {
                                                console.error('WhatsApp setup error:', error);
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
