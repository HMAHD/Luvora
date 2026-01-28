'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Heart, LogIn } from 'lucide-react';
import { createCheckoutSession } from '@/actions/payments';
import { useAuth } from '@/hooks/useAuth';

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuth();
    const [showLoginToast, setShowLoginToast] = useState(false);

    const handleUpgrade = async () => {
        if (user?.id) {
            // Trigger server action
            const url = await createCheckoutSession(user.id, user.email || '');
            if (url) window.location.href = url;
        } else {
            // Show toast for unauthenticated users
            setShowLoginToast(true);
            setTimeout(() => setShowLoginToast(false), 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative bg-base-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-base-content/10"
            >
                <div className="p-8 text-center relative overflow-hidden">
                    {/* Decorative BG */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-primary/5 via-transparent to-transparent animate-spin-slow pointer-events-none opacity-50" />

                    <h2 className="text-3xl font-bold font-romantic mb-2 text-base-content">Be 1 of 1</h2>
                    <p className="text-sm text-base-content/70 mb-6 max-w-xs mx-auto">
                        <span className="font-bold text-teal-500">15,402 people</span> are sending the global message today. Your partner deserves something unique.
                    </p>

                    {/* Comparison */}
                    <div className="overflow-x-auto mb-8">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="text-center text-base-content/60">Free</th>
                                    <th className="text-center font-bold text-teal-500">Hero</th>
                                </tr>
                            </thead>
                            <tbody className="text-base-content">
                                <tr>
                                    <td>Daily Spark</td>
                                    <td className="text-center"><Check className="w-4 h-4 mx-auto text-base-content/50" /></td>
                                    <td className="text-center"><Check className="w-4 h-4 mx-auto text-teal-500" /></td>
                                </tr>
                                <tr>
                                    <td>Exclusivity</td>
                                    <td className="text-center text-xs text-base-content/60">Global</td>
                                    <td className="text-center font-bold text-xs text-teal-500">1-of-1 Unique</td>
                                </tr>
                                <tr>
                                    <td>Ads / Branding</td>
                                    <td className="text-center text-xs text-base-content/60">Yes</td>
                                    <td className="text-center font-bold text-xs text-teal-500">None</td>
                                </tr>
                                <tr>
                                    <td>Support Luvora</td>
                                    <td className="text-center"><X className="w-4 h-4 mx-auto text-base-content/40" /></td>
                                    <td className="text-center"><Heart className="w-4 h-4 mx-auto text-red-500 fill-current" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="btn btn-primary btn-lg w-full shadow-lg group relative overflow-hidden hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.4)] transition-all duration-200"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Unlock Forever ($4.99)
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                    <p className="text-xs text-base-content/60 mt-4">One-time payment. Lifetime access.</p>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>

            {/* Login Required Toast */}
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
                        <span className="font-medium">Please log in to upgrade!</span>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
