'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart } from 'lucide-react';
import { getDailySpark } from '@/lib/algo';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SpecialnessCounter } from './SpecialnessCounter';

export function SparkCard() {
    const [mounted, setMounted] = useState(false);
    const [spark, setSpark] = useState(getDailySpark());
    const [partnerName] = useLocalStorage<string>('partner_name', '');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        // Update spark data if needed (e.g. if midnight crossed, though page refresh handles this usually)
        // The main logic is selecting morning vs night
    }, []);

    const isNight = new Date().getHours() >= 18;
    const message = isNight ? spark.night : spark.morning;
    const displayNickname = partnerName || spark.nickname;

    const handleCopy = () => {
        // 1. Haptic Feedback (Immediate)
        if (navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }

        // 2. Clipboard API
        const textToCopy = `${message.content}\n\n— For ${displayNickname}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000); // Hide toast after 3s
        });
    };

    // Staggered Text Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.3,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    if (!mounted) {
        // Skeleton / SSR State
        return (
            <div className="card w-full max-w-md bg-base-100 shadow-xl opacity-50 animate-pulse h-96 mx-auto">
                <div className="card-body items-center text-center"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="card w-full max-w-md glass shadow-2xl overflow-hidden backdrop-blur-xl border border-white/10"
            >
                <div className="card-body items-center text-center p-8 sm:p-10 relative">

                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                    {/* Vibe Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="badge badge-ghost mb-6 uppercase tracking-widest text-xs opacity-60"
                    >
                        {message.vibe} Vibe
                    </motion.div>

                    {/* Message Content */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mb-8"
                    >
                        {message.content.split(" ").map((word, i) => (
                            <motion.span
                                key={i}
                                variants={item}
                                className="inline-block mr-1 text-2xl sm:text-3xl font-serif leading-tight text-base-content/90"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* Recipient */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="text-sm font-medium opacity-50 mb-8"
                    >
                        For {displayNickname}
                    </motion.p>

                    {/* Actions */}
                    <div className="card-actions w-full justify-center">
                        <button
                            onClick={handleCopy}
                            className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {copied ? <Heart className="w-5 h-5 text-red-500 fill-current" /> : <Copy className="w-5 h-5" />}
                                {copied ? "Sent to Heart!" : "Copy Spark"}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Specialness Counter */}
            <SpecialnessCounter />

            {/* Toast Notification */}
            {copied && (
                <div className="toast toast-bottom toast-center z-50">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="alert alert-success shadow-lg"
                    >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Spark ready for {displayNickname}! 💖</span>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
