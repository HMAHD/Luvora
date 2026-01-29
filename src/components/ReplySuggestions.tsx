'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Copy,
    Check,
    RefreshCw,
    Sparkles,
    Heart,
    ChevronDown
} from 'lucide-react';
import { EMOTIONAL_TONES, type EmotionalTone } from '@/lib/types';

interface ReplySuggestionsProps {
    sparkContent: string;
    tone?: EmotionalTone;
    partnerName?: string;
}

// Reply templates organized by tone
const REPLY_TEMPLATES: Record<EmotionalTone, string[]> = {
    poetic: [
        "Your words paint my world in colors I never knew existed",
        "Every syllable you speak is a verse in the poem of us",
        "You make my heart speak in metaphors",
        "In the story of my life, you're the most beautiful chapter",
        "Your love is the poetry I never knew I needed"
    ],
    playful: [
        "You're making me smile so hard my face hurts! ",
        "Stoppp you're too cute for words!",
        "I literally can't handle how adorable you are",
        "Are you a magician? Because whenever I look at you, everyone else disappears",
        "You just made my whole week better!"
    ],
    romantic: [
        "My heart skips a beat every time I think of you",
        "You are the reason I believe in love",
        "With you, every moment feels like a fairytale",
        "I fall in love with you more every single day",
        "You're the best thing that ever happened to me"
    ],
    passionate: [
        "You set my soul on fire in the best way",
        "I can't stop thinking about you - you consume my thoughts",
        "The intensity of my love for you knows no bounds",
        "You ignite something incredible within me",
        "My desire to be with you grows stronger each day"
    ],
    sweet: [
        "You're the sweetest thing in my life",
        "My heart melts every time I read your messages",
        "You make everything better just by existing",
        "I'm so lucky to have you in my life",
        "You're my favorite person in the whole world"
    ],
    supportive: [
        "Thank you for always being there for me",
        "Your support means everything to me",
        "I'm so grateful for your unwavering love",
        "You make me feel like I can conquer anything",
        "With you by my side, I feel unstoppable"
    ]
};

// Generic replies that work with any tone
const GENERIC_REPLIES = [
    "I love you so much!",
    "You always know how to make me smile",
    "This made my day!",
    "Can't wait to see you",
    "You're amazing, you know that?",
    "How did I get so lucky?",
    "Thinking of you always",
    "You mean everything to me"
];

export function ReplySuggestions({ sparkContent, tone = 'romantic', partnerName }: ReplySuggestionsProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Generate suggestions based on tone
    const suggestions = useMemo(() => {
        const toneReplies = REPLY_TEMPLATES[tone] || REPLY_TEMPLATES.romantic;
        const shuffled = [...toneReplies, ...GENERIC_REPLIES]
            .sort(() => Math.random() - 0.5);

        // Personalize with partner name if available
        return shuffled.map(reply => {
            if (partnerName && Math.random() > 0.7) {
                return reply.replace(/you/gi, partnerName);
            }
            return reply;
        });
    }, [tone, partnerName, refreshKey]);

    const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 4);

    const handleCopy = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-base-content flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Reply Suggestions
                </h3>
                <button
                    onClick={handleRefresh}
                    className="btn btn-ghost btn-xs gap-1"
                >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AnimatePresence mode="popLayout">
                    {displayedSuggestions.map((suggestion, index) => (
                        <motion.button
                            key={`${refreshKey}-${index}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleCopy(suggestion, index)}
                            className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                                copiedIndex === index
                                    ? 'bg-success/10 border-success/30'
                                    : 'bg-base-200/50 border-base-300 hover:bg-base-200 hover:border-primary/30'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-base-content/80 line-clamp-2">
                                    {suggestion}
                                </p>
                                {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                                ) : (
                                    <Copy className="w-4 h-4 text-base-content/30 flex-shrink-0" />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {suggestions.length > 4 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="btn btn-ghost btn-sm w-full gap-1"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                    {showAll ? 'Show Less' : `Show ${suggestions.length - 4} More`}
                </button>
            )}

            <p className="text-xs text-base-content/40 text-center">
                Tap a suggestion to copy it
            </p>
        </div>
    );
}

// Compact version for inline use
export function ReplySuggestionsCompact({ tone = 'romantic', onSelect }: { tone?: EmotionalTone; onSelect: (reply: string) => void }) {
    const suggestions = useMemo(() => {
        const toneReplies = REPLY_TEMPLATES[tone] || REPLY_TEMPLATES.romantic;
        return toneReplies.slice(0, 3);
    }, [tone]);

    return (
        <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion)}
                    className="btn btn-sm btn-outline gap-1"
                >
                    <Sparkles className="w-3 h-3" />
                    {suggestion.length > 25 ? suggestion.slice(0, 25) + '...' : suggestion}
                </button>
            ))}
        </div>
    );
}
