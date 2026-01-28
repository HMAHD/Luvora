'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, Settings, Sparkles } from 'lucide-react';
import { getDailySpark, getPremiumSpark, type DailySpark } from '@/lib/algo';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SpecialnessCounter } from './SpecialnessCounter';
import { useAuth } from '@/hooks/useAuth';
import { UpgradeModal } from './UpgradeModal';
import { ShareCard } from './ShareCard';
import { Share2 } from 'lucide-react';

type Role = 'neutral' | 'masculine' | 'feminine';

export function SparkCard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [partnerName] = useLocalStorage<string>('partner_name', '');
  const [role, setRole] = useLocalStorage<Role>('recipient_role', 'neutral');

  // State for Spark (now potentially async)
  const [spark, setSpark] = useState<DailySpark>(getDailySpark(new Date(), role));
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Effect to handle Premium Spark generation
  useEffect(() => {
    async function loadSpark() {
      if (user?.is_premium && user.id) {
        const premiumSpark = await getPremiumSpark(new Date(), user.id, role);
        setSpark(premiumSpark);
      } else {
        setSpark(getDailySpark(new Date(), role));
      }
    }
    loadSpark();
  }, [user, role]); // Re-run if user (premium status) or role changes

  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isNight = new Date().getHours() >= 18;
  const message = isNight ? spark.night : spark.morning;
  const displayNickname = partnerName || spark.nickname;

  const handleCopy = () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    const textToCopy = `${message.content}\n\n— For ${displayNickname}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.3 } },
  };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  if (!mounted) {
    return (
      <div className="card w-full max-w-md bg-base-100 shadow-xl opacity-50 animate-pulse h-96 mx-auto"></div>
    );
  }

  const isPremium = user?.is_premium;

  return (
    <div className="flex flex-col items-center w-full px-4 relative">
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      {isShareOpen && <ShareCard onClose={() => setIsShareOpen(false)} />}

      {/* Settings Toggle Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-0 right-8 z-20 btn btn-circle btn-ghost btn-sm opacity-50 hover:opacity-100"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-10 right-8 z-30 bg-base-100 shadow-xl rounded-box p-4 border border-base-content/10 w-48"
        >
          <div className="text-xs font-bold uppercase opacity-50 mb-2">I am sending to my...</div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setRole('feminine'); setShowSettings(false); }}
              className={`btn btn-sm ${role === 'feminine' ? 'btn-primary' : 'btn-ghost'} justify-start`}
            >
              Girlfriend 🌸
            </button>
            <button
              onClick={() => { setRole('masculine'); setShowSettings(false); }}
              className={`btn btn-sm ${role === 'masculine' ? 'btn-primary' : 'btn-ghost'} justify-start`}
            >
              Boyfriend 🛡️
            </button>
            <button
              onClick={() => { setRole('neutral'); setShowSettings(false); }}
              className={`btn btn-sm ${role === 'neutral' ? 'btn-primary' : 'btn-ghost'} justify-start`}
            >
              Partner ✨
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`card w-full max-w-md glass shadow-2xl overflow-hidden backdrop-blur-xl border ${isPremium ? 'border-yellow-400/50 shadow-yellow-500/20' : 'border-white/10'}`}
      >
        {/* Premium Glow */}
        {isPremium && (
          <div className="absolute inset-0 pointer-events-none border-2 border-yellow-400/30 rounded-2xl animate-pulse" />
        )}

        <div className="card-body items-center text-center p-8 sm:p-10 relative">
          <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${isPremium ? 'from-yellow-400/20' : 'from-primary/10'} to-transparent pointer-events-none`} />

          {/* Vibe Badge */}
          <motion.div
            key={message.vibe}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="badge badge-ghost mb-6 uppercase tracking-widest text-xs opacity-60 flex gap-2"
          >
            {isPremium && <Sparkles className="w-3 h-3 text-yellow-500" />}
            {isPremium ? 'Unique Vibe' : `${message.vibe} Vibe`}
          </motion.div>

          {/* Message Content */}
          <motion.div
            key={message.content}
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            {message.content.split(" ").map((word, i) => (
              <motion.span key={i} variants={item} className="inline-block mr-1 text-2xl sm:text-3xl font-serif leading-tight text-base-content/90">
                {word}
              </motion.span>
            ))}
          </motion.div>

          {/* Recipient */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm font-medium opacity-50 mb-8">
            For {displayNickname}
          </motion.p>

          <button
            onClick={() => setIsShareOpen(true)}
            className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm opacity-50 hover:opacity-100"
            title="Share Streak"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Actions */}
          <div className="card-actions w-full justify-center flex-col gap-3">
            <button
              onClick={handleCopy}
              className={`btn btn-lg w-full sm:w-auto shadow-lg group relative overflow-hidden ${isPremium ? 'btn-warning text-white' : 'btn-primary'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {copied ? <Heart className="w-5 h-5 fill-current" /> : <Copy className="w-5 h-5" />}
                {copied ? "Sent to Heart!" : "Copy Spark"}
              </span>
            </button>

            {!isPremium && (
              <button onClick={() => setIsUpgradeOpen(true)} className="btn btn-ghost btn-xs opacity-50 hover:opacity-100">
                Unlock 1-of-1 Exclusivity
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <SpecialnessCounter />

      {copied && (
        <div className="toast toast-bottom toast-center z-50">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="alert alert-success shadow-lg">
            <Heart className="w-4 h-4 fill-current" />
            <span>Spark ready for {displayNickname}! 💖</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
