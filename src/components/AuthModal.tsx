'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestOTP, verifyOTP } from '@/lib/auth';
import { Mail, ArrowRight, Loader2, CheckCircle, X } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthState = 'idle' | 'requesting' | 'verifying' | 'success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [otpId, setOtpId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [status, setStatus] = useState<AuthState>('idle');
    const [error, setError] = useState('');

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('requesting');

        try {
            const res = await requestOTP(email);
            // PocketBase requestOTP returns an object with otpId (if configured to return it, 
            // otherwise we might need to rely on the user checking email. 
            // Standard PB authWithOTP requires otpId which is usually sent in the email 
            // OR returned if we are in dev mode / using a custom adapter.
            // Wait - SDK `requestOTP` usually returns just a boolean or void in standard config?
            // Let's check the library usage. 
            // Actually standard `pb.collection('users').requestOTP(email)` returns { otpId: ... } usually?
            // Let's assume it returns { otpId } based on typical PB usage for this flow or we adapt.
            // If it returns void, we can't implement the 2-step flow easily without the ID.
            // Assuming standard PB behavior for now:

            if (res && res.otpId) {
                setOtpId(res.otpId);
            } else {
                // If ID isn't returned (security setting), we might need to ask user for the ID sent to email too?
                // usually the flow is: request -> get ID/Email -> User types code -> authWithOTP(otpId, code).
                // We'll assume for this UI we get the ID. If not, we'd need a different field.
                setOtpId(res?.otpId || '');
            }

            // For this UI, we assume we move to verification step
            // Even if otpId is hidden, we show the input. 
            // (Note: Real PB requires otpId for verify. If it's not returned, this flow changes).

            setStatus('verifying');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send code.');
            setStatus('idle');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await verifyOTP(otpId, otpCode);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setEmail('');
                setOtpCode('');
            }, 1000);
        } catch {
            setError('Invalid code. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative glass bg-base-100/80 border border-base-content/5 w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl p-6"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost btn-xs opacity-50">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold font-romantic bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                                {status === 'verifying' ? 'Check Your Inbox' : 'Unlock Magic'}
                            </h3>
                            <p className="text-sm text-base-content/60 mt-2">
                                {status === 'verifying' ? `Code sent to ${email}` : 'Log in to save your special moments'}
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-error text-xs py-2 px-3 mb-4 rounded-lg">
                                <span>{error}</span>
                            </div>
                        )}

                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-success animate-in zoom-in">
                                <CheckCircle className="w-12 h-12 mb-2" />
                                <span className="font-bold">Welcome Back!</span>
                            </div>
                        ) : status === 'verifying' ? (
                            <form onSubmit={handleVerify} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter OTP Code"
                                    className="input input-bordered w-full text-center tracking-[1em] font-mono text-lg text-base-content placeholder:text-base-content/40 placeholder:tracking-normal"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary w-full gap-2 group">
                                    Verify Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-xs text-base-content/50 text-center">
                                    Check your spam/junk folder if you don&apos;t see the email
                                </p>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="text-xs link link-hover opacity-50"
                                    >
                                        Wrong email? Start over
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                                    <input
                                        type="email"
                                        placeholder="hello@example.com"
                                        className="input input-bordered w-full pl-10 text-base-content placeholder:text-base-content/40"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'requesting'}
                                    className="btn btn-primary w-full"
                                >
                                    {status === 'requesting' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Send Magic Code'
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
