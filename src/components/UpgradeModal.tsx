'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { createCheckoutSession } from '@/actions/payments';
import { useAuth } from '@/hooks/useAuth';

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user } = useAuth();

    const handleUpgrade = async () => {
        if (user?.id) {
            // Trigger server action
            const url = await createCheckoutSession(user.id, user.email || '');
            if (url) window.location.href = url;
        } else {
            // Handle unauth case - typically should force login first
            alert("Please log in to upgrade!");
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-primary/20"
            >
                <div className="p-8 text-center relative overflow-hidden">
                    {/* Decorative BG */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-primary/5 via-transparent to-transparent animate-spin-slow pointer-events-none opacity-50" />

                    <h2 className="text-3xl font-bold font-serif mb-2">Be 1 of 1</h2>
                    <p className="text-sm opacity-70 mb-6 max-w-xs mx-auto">
                        <span className="font-bold text-primary">15,402 people</span> are sending the global message today. Your partner deserves something unique.
                    </p>

                    {/* Comparison */}
                    <div className="overflow-x-auto mb-8">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="text-center opacity-50">Free</th>
                                    <th className="text-center font-bold text-primary">Hero</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Daily Spark</td>
                                    <td className="text-center"><Check className="w-4 h-4 mx-auto opacity-50" /></td>
                                    <td className="text-center"><Check className="w-4 h-4 mx-auto text-primary" /></td>
                                </tr>
                                <tr>
                                    <td>Exclusivity</td>
                                    <td className="text-center text-xs opacity-50">Global</td>
                                    <td className="text-center font-bold text-xs text-primary">1-of-1 Unique</td>
                                </tr>
                                <tr>
                                    <td>Ads / Branding</td>
                                    <td className="text-center text-xs opacity-50">Yes</td>
                                    <td className="text-center font-bold text-xs text-primary">None</td>
                                </tr>
                                <tr>
                                    <td>Support Luvora</td>
                                    <td className="text-center"><X className="w-4 h-4 mx-auto opacity-30" /></td>
                                    <td className="text-center"><Heart className="w-4 h-4 mx-auto text-red-500 fill-current" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="btn btn-primary btn-lg w-full shadow-lg group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Unlock Forever ($4.99)
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                    <p className="text-xs opacity-50 mt-4">One-time payment. Lifetime access.</p>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}
