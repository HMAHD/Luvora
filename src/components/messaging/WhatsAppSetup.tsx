'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, AlertCircle, Loader2, QrCode, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface WhatsAppSetupProps {
    userId: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

interface WhatsAppStatus {
    connected: boolean;
    enabled?: boolean;
    phoneNumber?: string;
    linked?: boolean;
    hasSession?: boolean;
}

export function WhatsAppSetup({ userId, onSuccess, onError }: WhatsAppSetupProps) {
    const [step, setStep] = useState<'instructions' | 'qr' | 'success'>('instructions');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<WhatsAppStatus | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const eventSourceRef = useRef<EventSource | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch current status on mount
    useEffect(() => {
        fetchStatus();

        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/channels/whatsapp/status', {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setStatus(data);

                if (data.connected && data.linked) {
                    setStep('success');
                }
            }
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    };

    const startQRSession = () => {
        setLoading(true);
        setError('');
        setQrCode(null);
        setTimeRemaining(300);

        // Close existing connection
        cleanup();

        // Create new EventSource for QR code streaming
        const eventSource = new EventSource('/api/channels/whatsapp/setup', {
            withCredentials: true
        });

        eventSourceRef.current = eventSource;

        eventSource.addEventListener('qr', (event) => {
            try {
                const data = JSON.parse(event.data);
                setQrCode(data.qr);
                setLoading(false);
                setStep('qr');

                // Start countdown timer
                if (!timerRef.current) {
                    timerRef.current = setInterval(() => {
                        setTimeRemaining((prev) => {
                            if (prev <= 1) {
                                cleanup();
                                setError('QR code expired. Please try again.');
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            } catch (err) {
                console.error('Failed to parse QR event:', err);
            }
        });

        eventSource.addEventListener('ready', (event) => {
            try {
                const data = JSON.parse(event.data);
                cleanup();
                setStep('success');
                setStatus({
                    connected: true,
                    enabled: true,
                    phoneNumber: data.phoneNumber,
                    linked: true,
                    hasSession: true
                });
                onSuccess?.();
            } catch (err) {
                console.error('Failed to parse ready event:', err);
            }
        });

        eventSource.addEventListener('error', (event) => {
            try {
                const data = JSON.parse((event as MessageEvent).data);
                setError(data.message || 'Failed to setup WhatsApp');
                onError?.(data.message);
            } catch (err) {
                setError('Connection error. Please try again.');
            } finally {
                cleanup();
                setLoading(false);
            }
        });

        eventSource.onerror = () => {
            if (eventSource.readyState === EventSource.CLOSED) {
                // Connection closed normally (likely timeout or completion)
                if (!status?.linked) {
                    setError('Connection closed. Please try again.');
                }
            }
            cleanup();
            setLoading(false);
        };
    };

    const handleRetry = () => {
        setError('');
        setQrCode(null);
        setStep('instructions');
        cleanup();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {/* Step 1: Instructions */}
                {step === 'instructions' && (
                    <motion.div
                        key="instructions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-semibold">Link Your WhatsApp</p>
                                <p className="opacity-75">Scan QR code to receive messages directly</p>
                            </div>
                        </div>

                        <div className="card bg-base-200/50 p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Smartphone className="w-5 h-5" />
                                How It Works
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm opacity-80">
                                <li>Click "Generate QR Code" below</li>
                                <li>Open WhatsApp on your phone</li>
                                <li>Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong></li>
                                <li>Tap <strong>Linked Devices</strong></li>
                                <li>Tap <strong>Link a Device</strong></li>
                                <li>Point your phone at the QR code on this screen</li>
                            </ol>
                        </div>

                        <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="text-xs">
                                <p className="font-semibold">Important:</p>
                                <p>Your phone must be connected to the internet while scanning</p>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            onClick={startQRSession}
                            disabled={loading}
                            className="btn btn-primary btn-block gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating QR Code...
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-5 h-5" />
                                    Generate QR Code
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Step 2: QR Code Display */}
                {step === 'qr' && (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="alert alert-info">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <div className="text-sm">
                                <p className="font-semibold">Waiting for scan...</p>
                                <p className="opacity-75">Open WhatsApp on your phone and scan the QR code</p>
                            </div>
                        </div>

                        {/* QR Code Display */}
                        <div className="card bg-base-200 p-6">
                            <div className="flex flex-col items-center gap-4">
                                {qrCode ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative"
                                        >
                                            <Image
                                                src={qrCode}
                                                alt="WhatsApp QR Code"
                                                width={256}
                                                height={256}
                                                className="rounded-lg shadow-lg"
                                                priority
                                            />
                                            {/* Animated border */}
                                            <motion.div
                                                className="absolute inset-0 border-4 border-primary rounded-lg"
                                                animate={{
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        </motion.div>

                                        {/* Timer */}
                                        <div className="text-center">
                                            <div className="text-2xl font-mono font-bold">
                                                {formatTime(timeRemaining)}
                                            </div>
                                            <p className="text-xs opacity-60">Time remaining</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-8">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                        <p className="text-sm opacity-60">Generating QR code...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card bg-base-300 p-4">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                Steps to scan:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-xs opacity-75">
                                <li>Open WhatsApp on your phone</li>
                                <li>Go to Settings → Linked Devices</li>
                                <li>Tap "Link a Device"</li>
                                <li>Scan this QR code</li>
                            </ol>
                        </div>

                        <button
                            onClick={handleRetry}
                            className="btn btn-outline btn-block btn-sm gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Cancel
                        </button>
                    </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="alert alert-success">
                            <CheckCircle className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">WhatsApp Connected!</p>
                                <p className="text-sm opacity-75">
                                    You'll receive your daily sparks on WhatsApp
                                </p>
                            </div>
                        </div>

                        <div className="card bg-base-200/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Phone Number</span>
                                <code className="kbd kbd-sm">{status?.phoneNumber || 'Linked'}</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <span className="badge badge-success badge-sm">Active</span>
                            </div>
                        </div>

                        <div className="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-xs">
                                <p className="font-semibold">Keep your phone online</p>
                                <p className="opacity-75">Your session stays active as long as your phone has internet</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRetry}
                            className="btn btn-outline btn-block btn-sm gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reconnect WhatsApp
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
