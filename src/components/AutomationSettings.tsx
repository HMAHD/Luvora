'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Clock, MessageCircle, X } from 'lucide-react';

export function AutomationSettings({ onClose }: { onClose: () => void }) {
    const { user, pb } = useAuth();
    const [morningTime, setMorningTime] = useState(user?.morning_time || '08:00');
    const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>(user?.messaging_platform || 'telegram');
    const [msgId, setMsgId] = useState(user?.messaging_id || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            await pb.collection('users').update(user.id, {
                morning_time: morningTime,
                messaging_platform: platform,
                messaging_id: msgId,
                timezone: timezone
            });
            setSuccess(true);
            setTimeout(onClose, 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm">
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold font-serif mb-1">Lazy Hero Settings</h2>
                    <p className="opacity-60 text-sm mb-6">Automate your daily spark delivery.</p>

                    <div className="space-y-4">
                        {/* Time */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2"><Clock className="w-4 h-4" /> Delivery Time</span>
                            </label>
                            <input
                                type="time"
                                className="input input-bordered w-full"
                                value={morningTime}
                                onChange={(e) => setMorningTime(e.target.value)}
                            />
                            <div className="text-xs opacity-50 mt-1">Detected Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                        </div>

                        {/* Platform */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Messaging App</span>
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPlatform('telegram')}
                                    className={`btn flex-1 ${platform === 'telegram' ? 'btn-primary' : 'btn-outline'}`}
                                >Telegram</button>
                                <button
                                    onClick={() => setPlatform('whatsapp')}
                                    className={`btn flex-1 ${platform === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                                >WhatsApp</button>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    {platform === 'whatsapp' ? 'Phone Number (Intl Format)' : 'Telegram Chat ID'}
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder={platform === 'whatsapp' ? '+1234567890' : '12345678'}
                                className="input input-bordered w-full font-mono"
                                value={msgId}
                                onChange={(e) => setMsgId(e.target.value)}
                            />
                            {platform === 'telegram' && (
                                <a href="https://t.me/userinfobot" target="_blank" className="text-xs link link-hover opacity-50 mt-1">Find Key via @userinfobot</a>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || success}
                        className={`btn btn-block mt-8 ${success ? 'btn-success' : 'btn-primary'}`}
                    >
                        {loading ? <span className="loading loading-spinner" /> : (success ? 'Saved!' : 'Save Automation')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
