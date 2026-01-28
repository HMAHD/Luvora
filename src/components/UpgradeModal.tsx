'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Heart, LogIn, Crown, Shield, Clock, Gift } from 'lucide-react';
import { createCheckoutSession } from '@/actions/payments';
import { useAuth } from '@/hooks/useAuth';
import { TIER } from '@/lib/types';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Psychological pricing - prices that feel smaller
const PRICING = {
    hero: {
        price: 4.99,
        originalPrice: 9.99,
        perDay: '< 2¢',
    },
    legend: {
        price: 19.99,
        originalPrice: 39.99,
        perDay: '< 6¢',
    }
};

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { user } = useAuth();
    const [showLoginToast, setShowLoginToast] = useState(false);
    const [selectedTier, setSelectedTier] = useState<'hero' | 'legend'>('hero');
    const [isLoading, setIsLoading] = useState(false);
    const [socialProof, setSocialProof] = useState({ today: 0, total: 0 });

    // Social proof numbers
    useEffect(() => {
        if (isOpen) {
            const baseToday = 23 + Math.floor(Math.random() * 15);
            const baseTotal = 4200 + Math.floor(Math.random() * 300);
            setSocialProof({ today: baseToday, total: baseTotal });
        }
    }, [isOpen]);

    const handleUpgrade = async (tier: 'hero' | 'legend') => {
        if (!user?.id) {
            setShowLoginToast(true);
            setTimeout(() => setShowLoginToast(false), 3000);
            return;
        }

        setIsLoading(true);
        try {
            const url = await createCheckoutSession(user.id, user.email || '', tier);
            if (url) window.location.href = url;
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const userTier = user?.tier ?? TIER.FREE;

    // Use Portal to render at document body level, escaping any stacking context
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-base-content/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8 relative">
                    {/* Header - Loss Aversion Hook */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="inline-flex items-center gap-2 bg-error/10 text-error px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                            </span>
                            <span>15,402 couples sent the same message today</span>
                        </motion.div>

                        <h2 className="text-2xl sm:text-3xl font-bold font-romantic text-base-content mb-2">
                            Your Love Deserves to be <span className="text-primary">Unique</span>
                        </h2>
                        <p className="text-sm text-base-content/60 max-w-md mx-auto">
                            Stand out. Make every spark feel like it was written just for your partner.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {/* Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setSelectedTier('hero')}
                            className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
                                selectedTier === 'hero'
                                    ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'bg-base-200/50 border-2 border-transparent hover:border-base-content/20'
                            }`}
                        >
                            {/* Most Popular Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-primary text-primary-content text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                    Most Popular
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 mt-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content">Hero</h3>
                                    <p className="text-[10px] text-base-content/50">The Daily Romantic</p>
                                </div>
                            </div>

                            {/* Price with Anchoring */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-base-content">${PRICING.hero.price}</span>
                                    <span className="text-sm line-through text-base-content/40">${PRICING.hero.originalPrice}</span>
                                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-semibold">50% OFF</span>
                                </div>
                                <p className="text-xs text-base-content/50 mt-1">
                                    One-time • {PRICING.hero.perDay}/day forever
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2">
                                {[
                                    '1-of-1 Unique Daily Sparks',
                                    'No Ads or Branding',
                                    'Full Streak History',
                                    'Priority Support',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-base-content/80">
                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Selection indicator */}
                            {selectedTier === 'hero' && (
                                <motion.div
                                    layoutId="selection"
                                    className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 text-primary-content" />
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Legend Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setSelectedTier('legend')}
                            className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
                                selectedTier === 'legend'
                                    ? 'legend-upgrade-card border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                                    : 'bg-base-200/50 border-2 border-transparent hover:border-yellow-400/30'
                            }`}
                        >
                            {/* Best Value Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                    Best Value
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 mt-2">
                                <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content">Legend</h3>
                                    <p className="text-[10px] text-base-content/50">The Soulmate Experience</p>
                                </div>
                            </div>

                            {/* Price with Anchoring */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-base-content">${PRICING.legend.price}</span>
                                    <span className="text-sm line-through text-base-content/40">${PRICING.legend.originalPrice}</span>
                                    <span className="text-xs bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">50% OFF</span>
                                </div>
                                <p className="text-xs text-base-content/50 mt-1">
                                    One-time • {PRICING.legend.perDay}/day forever
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs text-base-content/50">
                                    <span>Everything in Hero, plus:</span>
                                </li>
                                {[
                                    'Auto-Send to WhatsApp/Telegram',
                                    'Exclusive Poetic Messages',
                                    'Premium Streak Cards',
                                    'Anniversary Reminders',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-base-content/80">
                                        <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Selection indicator */}
                            {selectedTier === 'legend' && (
                                <motion.div
                                    layoutId="selection"
                                    className="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 text-yellow-900" />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => handleUpgrade(selectedTier)}
                        disabled={isLoading || (userTier >= TIER.HERO && selectedTier === 'hero') || (userTier >= TIER.LEGEND)}
                        className={`btn btn-lg w-full shadow-xl group relative overflow-hidden transition-all duration-300 ${
                            selectedTier === 'legend'
                                ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 text-amber-900 border-none'
                                : 'btn-primary'
                        } ${isLoading ? 'opacity-70' : ''}`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : selectedTier === 'legend' ? (
                                <Crown className="w-5 h-5" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            {isLoading
                                ? 'Processing...'
                                : userTier >= TIER.LEGEND
                                    ? "You're a Legend!"
                                    : userTier >= TIER.HERO && selectedTier === 'hero'
                                        ? "You're already a Hero!"
                                        : `Unlock ${selectedTier === 'legend' ? 'Legend' : 'Hero'} — $${selectedTier === 'legend' ? PRICING.legend.price : PRICING.hero.price}`
                            }
                        </span>
                        {!isLoading && (
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        )}
                    </motion.button>

                    {/* Trust Signals */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-base-content/50">
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Instant Access</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5" />
                            <span>Lifetime Updates</span>
                        </div>
                    </div>

                    {/* Social Proof Counter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 pt-4 border-t border-base-content/10 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs">
                            <div className="flex -space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-base-100 flex items-center justify-center"
                                    >
                                        <Heart className="w-3 h-3 text-primary" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-base-content/60">
                                <span className="font-semibold text-primary">{socialProof.today} couples</span> upgraded today •{' '}
                                <span className="font-semibold">{socialProof.total.toLocaleString()}+</span> total
                            </span>
                        </div>
                    </motion.div>

                    {/* Money-back guarantee - Risk Reversal */}
                    <p className="text-center text-[10px] text-base-content/40 mt-3">
                        100% satisfaction guaranteed. Not happy? Email us within 7 days for a full refund.
                    </p>
                </div>
            </motion.div>

            {/* Login Required Toast */}
            <AnimatePresence>
                {showLoginToast && (
                    <div className="toast toast-bottom toast-center z-[60]">
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="alert alert-warning shadow-xl border border-warning/20"
                        >
                            <LogIn className="w-5 h-5" />
                            <span className="font-medium">Please log in first to upgrade!</span>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
}
