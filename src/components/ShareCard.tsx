'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export function ShareCard({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const cardRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const streak = user?.streak || 0;
    const partner = user?.partner_name || 'My Love';

    const downloadImage = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `luvora-streak-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col gap-4 items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* The Capture Area */}
                <div ref={cardRef} className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl shadow-2xl">
                    <div className="bg-base-100 p-8 rounded-xl w-[300px] h-[400px] flex flex-col items-center justify-between relative overflow-hidden text-center">
                        {/* Decor */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                        <div className="z-10 mt-4">
                            <h3 className="font-serif text-2xl font-bold opacity-80">Affection Streak</h3>
                            <p className="text-sm opacity-50 uppercase tracking-widest mt-1">Luvora.love</p>
                        </div>

                        <div className="z-10 flex flex-col items-center">
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm">
                                {streak}
                            </div>
                            <div className="flex items-center gap-2 text-warning font-bold uppercase tracking-wider text-sm mt-2">
                                <Flame className="w-5 h-5 fill-current animate-pulse" /> Days
                            </div>
                        </div>

                        <div className="z-10 mb-4">
                            <p className="text-sm italic opacity-60">
                                "Consistency is the language of love."
                            </p>
                            <div className="badge badge-outline mt-4 opacity-40">Celebrating {partner}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button onClick={downloadImage} className="btn btn-primary btn-wide group">
                        {loading ? <span className="loading loading-spinner" /> : <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
                        Download Card
                    </button>
                </div>
                <button onClick={onClose} className="btn btn-ghost btn-sm text-white/50">Close</button>
            </motion.div>
        </div>
    );
}
