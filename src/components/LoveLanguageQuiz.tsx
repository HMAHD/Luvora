'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircleHeart, Gift, Clock, Hand, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LOVE_LANGUAGES, LOVE_LANGUAGE_NAMES, type LoveLanguage } from '@/lib/types';

interface LoveLanguageQuizProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (loveLanguage: LoveLanguage) => void;
}

type QuizQuestion = {
    question: string;
    options: {
        text: string;
        language: LoveLanguage;
    }[];
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "What makes you feel most loved?",
        options: [
            { text: "When my partner tells me they love me or gives me compliments", language: LOVE_LANGUAGES.WORDS },
            { text: "When my partner helps me with tasks or does things for me", language: LOVE_LANGUAGES.ACTS },
            { text: "When my partner surprises me with thoughtful gifts", language: LOVE_LANGUAGES.GIFTS },
            { text: "When my partner spends quality one-on-one time with me", language: LOVE_LANGUAGES.TIME },
            { text: "When my partner holds my hand, hugs me, or is physically close", language: LOVE_LANGUAGES.TOUCH },
        ]
    },
    {
        question: "What would hurt you the most in a relationship?",
        options: [
            { text: "Harsh criticism or lack of verbal appreciation", language: LOVE_LANGUAGES.WORDS },
            { text: "When my partner doesn't help even when they see I'm struggling", language: LOVE_LANGUAGES.ACTS },
            { text: "Forgotten birthdays, anniversaries, or no thoughtful surprises", language: LOVE_LANGUAGES.GIFTS },
            { text: "Feeling like we never spend meaningful time together", language: LOVE_LANGUAGES.TIME },
            { text: "Lack of physical affection or feeling physically distant", language: LOVE_LANGUAGES.TOUCH },
        ]
    },
    {
        question: "How do you prefer to show love to your partner?",
        options: [
            { text: "Writing love notes or expressing my feelings with words", language: LOVE_LANGUAGES.WORDS },
            { text: "Doing things to make their life easier", language: LOVE_LANGUAGES.ACTS },
            { text: "Finding and giving them perfect gifts", language: LOVE_LANGUAGES.GIFTS },
            { text: "Planning special dates or quality time together", language: LOVE_LANGUAGES.TIME },
            { text: "Physical touch, cuddling, and being close", language: LOVE_LANGUAGES.TOUCH },
        ]
    },
    {
        question: "What makes a perfect evening with your partner?",
        options: [
            { text: "Deep conversations about our relationship and future", language: LOVE_LANGUAGES.WORDS },
            { text: "When they cook for me or take care of something I needed", language: LOVE_LANGUAGES.ACTS },
            { text: "Exchanging surprise gifts we picked for each other", language: LOVE_LANGUAGES.GIFTS },
            { text: "Undivided attention - phones away, just us", language: LOVE_LANGUAGES.TIME },
            { text: "Cuddling on the couch while watching something together", language: LOVE_LANGUAGES.TOUCH },
        ]
    },
    {
        question: "What would be the best surprise from your partner?",
        options: [
            { text: "A heartfelt letter expressing their love for me", language: LOVE_LANGUAGES.WORDS },
            { text: "Coming home to find they did all my chores", language: LOVE_LANGUAGES.ACTS },
            { text: "A meaningful gift they put thought into choosing", language: LOVE_LANGUAGES.GIFTS },
            { text: "A surprise day trip or date planned just for us", language: LOVE_LANGUAGES.TIME },
            { text: "A long massage or being held close all evening", language: LOVE_LANGUAGES.TOUCH },
        ]
    }
];

const LANGUAGE_ICONS: Record<LoveLanguage, React.ReactNode> = {
    [LOVE_LANGUAGES.WORDS]: <MessageCircleHeart className="w-6 h-6" />,
    [LOVE_LANGUAGES.ACTS]: <Heart className="w-6 h-6" />,
    [LOVE_LANGUAGES.GIFTS]: <Gift className="w-6 h-6" />,
    [LOVE_LANGUAGES.TIME]: <Clock className="w-6 h-6" />,
    [LOVE_LANGUAGES.TOUCH]: <Hand className="w-6 h-6" />,
};

const LANGUAGE_COLORS: Record<LoveLanguage, string> = {
    [LOVE_LANGUAGES.WORDS]: 'text-pink-400 bg-pink-400/10',
    [LOVE_LANGUAGES.ACTS]: 'text-blue-400 bg-blue-400/10',
    [LOVE_LANGUAGES.GIFTS]: 'text-amber-400 bg-amber-400/10',
    [LOVE_LANGUAGES.TIME]: 'text-green-400 bg-green-400/10',
    [LOVE_LANGUAGES.TOUCH]: 'text-purple-400 bg-purple-400/10',
};

export function LoveLanguageQuiz({ isOpen, onClose, onComplete }: LoveLanguageQuizProps) {
    const { user, pb } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<LoveLanguage[]>([]);
    const [result, setResult] = useState<LoveLanguage | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAnswer = (language: LoveLanguage) => {
        const newAnswers = [...answers, language];
        setAnswers(newAnswers);

        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate result
            const counts = newAnswers.reduce((acc, lang) => {
                acc[lang] = (acc[lang] || 0) + 1;
                return acc;
            }, {} as Record<LoveLanguage, number>);

            const dominant = Object.entries(counts).reduce((a, b) =>
                b[1] > a[1] ? b : a
            )[0] as LoveLanguage;

            setResult(dominant);
        }
    };

    const handleSave = async () => {
        if (!result || !user?.id) return;

        setIsSaving(true);
        try {
            await pb.collection('users').update(user.id, {
                love_language: result,
            });

            const currentRecord = pb.authStore.record;
            if (currentRecord) {
                pb.authStore.save(pb.authStore.token!, {
                    ...currentRecord,
                    love_language: result,
                });
            }

            onComplete?.(result);
            handleClose();
        } catch (err) {
            console.error('Failed to save love language:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
        onClose();
    };

    const handleRetake = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
    };

    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const progress = ((currentQuestion + (result ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative bg-base-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-base-content/10"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-base-200">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            // Question View
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Question Counter */}
                                <div className="text-xs text-base-content/50 mb-2">
                                    Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                                </div>

                                {/* Question */}
                                <h2 className="text-xl font-bold text-base-content mb-6">
                                    {QUIZ_QUESTIONS[currentQuestion].question}
                                </h2>

                                {/* Options */}
                                <div className="space-y-3">
                                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => handleAnswer(option.language)}
                                            className="w-full text-left p-4 rounded-xl bg-base-200/50 hover:bg-base-200 border border-transparent hover:border-primary/30 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-base-content/80 group-hover:text-base-content">
                                                    {option.text}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-primary transition-colors" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            // Result View
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center"
                            >
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                    className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${LANGUAGE_COLORS[result]}`}
                                >
                                    {LANGUAGE_ICONS[result]}
                                </motion.div>

                                {/* Result */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <p className="text-sm text-base-content/60 mb-1">Your love language is</p>
                                    <h2 className="text-2xl font-bold text-base-content mb-4">
                                        {LOVE_LANGUAGE_NAMES[result]}
                                    </h2>
                                </motion.div>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-base-content/70 mb-6"
                                >
                                    {result === LOVE_LANGUAGES.WORDS && "You feel most loved when your partner expresses their feelings through words - compliments, love notes, and verbal appreciation make your heart sing."}
                                    {result === LOVE_LANGUAGES.ACTS && "Actions speak louder than words for you. When your partner helps out or does things to make your life easier, you feel truly cared for."}
                                    {result === LOVE_LANGUAGES.GIFTS && "Thoughtful gifts and surprises show you that your partner was thinking of you. It's not about the price - it's the thought behind it."}
                                    {result === LOVE_LANGUAGES.TIME && "Nothing says 'I love you' like undivided attention. Quality time together, free from distractions, is how you feel most connected."}
                                    {result === LOVE_LANGUAGES.TOUCH && "Physical closeness - holding hands, hugs, cuddles - is how you feel most loved and connected to your partner."}
                                </motion.p>

                                {/* Spark Preview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-base-200/50 rounded-xl p-4 mb-6"
                                >
                                    <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Your sparks will now include messages like:</span>
                                    </div>
                                    <p className="text-sm italic text-base-content/80">
                                        {result === LOVE_LANGUAGES.WORDS && '"You have no idea how incredible you truly are."'}
                                        {result === LOVE_LANGUAGES.ACTS && '"I\'ll always be here to lighten your load."'}
                                        {result === LOVE_LANGUAGES.GIFTS && '"Every gift I give you is just a fraction of what you deserve."'}
                                        {result === LOVE_LANGUAGES.TIME && '"Every moment with you is precious to me."'}
                                        {result === LOVE_LANGUAGES.TOUCH && '"Your touch is my favorite feeling in the world."'}
                                    </p>
                                </motion.div>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex gap-3"
                                >
                                    <button
                                        onClick={handleRetake}
                                        className="btn btn-ghost flex-1"
                                    >
                                        Retake Quiz
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn btn-primary flex-1"
                                    >
                                        {isSaving ? (
                                            <span className="loading loading-spinner loading-sm" />
                                        ) : (
                                            <>
                                                <Heart className="w-4 h-4" />
                                                Save Result
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
