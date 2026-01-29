'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { EMOTIONAL_TONES, EMOTIONAL_TONE_NAMES, type EmotionalTone } from '@/lib/types';
import { Feather, Smile, Heart, Flame, Candy, HandHeart, Check } from 'lucide-react';

interface ToneSelectorProps {
    onChange?: (tone: EmotionalTone) => void;
    showSaveButton?: boolean;
}

const TONE_CONFIG: Record<EmotionalTone, { icon: React.ReactNode; color: string; description: string }> = {
    [EMOTIONAL_TONES.POETIC]: {
        icon: <Feather className="w-4 h-4" />,
        color: 'from-indigo-400 to-purple-500',
        description: 'Elegant, metaphorical expressions',
    },
    [EMOTIONAL_TONES.PLAYFUL]: {
        icon: <Smile className="w-4 h-4" />,
        color: 'from-yellow-400 to-orange-500',
        description: 'Light-hearted and fun messages',
    },
    [EMOTIONAL_TONES.ROMANTIC]: {
        icon: <Heart className="w-4 h-4" />,
        color: 'from-pink-400 to-rose-500',
        description: 'Classic romance and devotion',
    },
    [EMOTIONAL_TONES.PASSIONATE]: {
        icon: <Flame className="w-4 h-4" />,
        color: 'from-red-500 to-orange-600',
        description: 'Intense and deeply emotional',
    },
    [EMOTIONAL_TONES.SWEET]: {
        icon: <Candy className="w-4 h-4" />,
        color: 'from-pink-300 to-purple-400',
        description: 'Gentle, heartwarming words',
    },
    [EMOTIONAL_TONES.SUPPORTIVE]: {
        icon: <HandHeart className="w-4 h-4" />,
        color: 'from-green-400 to-teal-500',
        description: 'Encouraging and uplifting',
    },
};

export function ToneSelector({ onChange, showSaveButton = true }: ToneSelectorProps) {
    const { user, pb } = useAuth();
    const [selectedTone, setSelectedTone] = useState<EmotionalTone | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Sync with user data
    useEffect(() => {
        if (user?.preferred_tone) {
            setSelectedTone(user.preferred_tone as EmotionalTone);
        }
    }, [user?.preferred_tone]);

    const handleSelect = async (tone: EmotionalTone) => {
        setSelectedTone(tone);
        onChange?.(tone);

        // If not showing save button, auto-save
        if (!showSaveButton && user?.id) {
            await saveTone(tone);
        }
    };

    const saveTone = async (tone: EmotionalTone) => {
        if (!user?.id) return;

        setIsSaving(true);
        try {
            await pb.collection('users').update(user.id, {
                preferred_tone: tone,
            });

            const currentRecord = pb.authStore.record;
            if (currentRecord) {
                pb.authStore.save(pb.authStore.token!, {
                    ...currentRecord,
                    preferred_tone: tone,
                });
            }

            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save tone:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = () => {
        if (selectedTone) {
            saveTone(selectedTone);
        }
    };

    const tones = Object.values(EMOTIONAL_TONES) as EmotionalTone[];

    return (
        <div className="space-y-4">
            {/* Label */}
            <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-sm">Preferred Tone</span>
            </div>

            {/* Tone Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tones.map((tone) => {
                    const config = TONE_CONFIG[tone];
                    const isSelected = selectedTone === tone;

                    return (
                        <motion.button
                            key={tone}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(tone)}
                            className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                isSelected
                                    ? 'text-white shadow-lg border-transparent'
                                    : 'bg-base-200/50 text-base-content/70 hover:bg-base-200 border-base-300 hover:border-base-content/20'
                            }`}
                        >
                            {/* Gradient Background for Selected */}
                            {isSelected && (
                                <motion.div
                                    layoutId="tone-selector-bg"
                                    className={`absolute inset-0 bg-gradient-to-r ${config.color} rounded-xl`}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            {/* Content */}
                            <span className="relative z-10 flex items-center gap-2">
                                {config.icon}
                                {EMOTIONAL_TONE_NAMES[tone]}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Description */}
            {selectedTone && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-base-content/50 pl-1"
                >
                    {TONE_CONFIG[selectedTone].description}
                </motion.p>
            )}

            {/* Save Button */}
            {showSaveButton && selectedTone && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <button
                        onClick={handleSave}
                        disabled={isSaving || user?.preferred_tone === selectedTone}
                        className="btn btn-primary btn-sm"
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : showSaved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            'Save Preference'
                        )}
                    </button>

                    {user?.preferred_tone === selectedTone && !showSaved && (
                        <span className="text-xs text-base-content/50">Current selection</span>
                    )}
                </motion.div>
            )}
        </div>
    );
}

// Compact version for inline use
export function ToneSelectorCompact({ value, onChange }: { value?: EmotionalTone; onChange: (tone: EmotionalTone) => void }) {
    const tones = Object.values(EMOTIONAL_TONES) as EmotionalTone[];

    return (
        <div className="flex gap-1 overflow-x-auto pb-1">
            {tones.map((tone) => {
                const config = TONE_CONFIG[tone];
                const isSelected = value === tone;

                return (
                    <button
                        key={tone}
                        onClick={() => onChange(tone)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected
                                ? `bg-gradient-to-r ${config.color} text-white`
                                : 'bg-base-200 text-base-content/60 hover:text-base-content'
                        }`}
                    >
                        {config.icon}
                        {EMOTIONAL_TONE_NAMES[tone]}
                    </button>
                );
            })}
        </div>
    );
}
