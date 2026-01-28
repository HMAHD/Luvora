'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, Share2, Zap } from 'lucide-react';
import { getDailySpark, getPremiumSpark, type DailySpark } from '@/lib/algo';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SpecialnessCounter } from './SpecialnessCounter';
import { useAuth } from '@/hooks/useAuth';
import { UpgradeModal } from './UpgradeModal';
import { ShareCard } from './ShareCard';
import { AutomationSettings } from './AutomationSettings';
import { RoleSelector } from './RoleSelector';
import { incrementGlobalStats } from '@/actions/stats';

type Role = 'neutral' | 'masculine' | 'feminine';

export function SparkCard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [partnerName] = useLocalStorage<string>('partner_name', '');
  const [role] = useLocalStorage<Role>('recipient_role', 'neutral');

  // State for Spark
  const [spark, setSpark] = useState<DailySpark>(getDailySpark(new Date(), role));
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAutoSettingsOpen, setIsAutoSettingsOpen] = useState(false);

  const isPremium = user?.is_premium;

  // Effect to handle Partner/Premium Spark generation
  useEffect(() => {
    async function loadSpark() {
      if (isPremium && user?.id) {
        const premiumSpark = await getPremiumSpark(new Date(), user.id, role);
        setSpark(premiumSpark);
      } else {
        setSpark(getDailySpark(new Date(), role));
      }
    }
    loadSpark();
  }, [user, role, isPremium]);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isNight = new Date().getHours() >= 18;
  const message = isNight ? spark.night : spark.morning;
  const displayNickname = partnerName || spark.nickname;

  const handleCopy = async () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    // 1. Copy to clipboard
    const textToCopy = `${message.content}\n\n— For ${displayNickname}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });

    // 2. Increment Global Stats (Server Action)
    try {
      await incrementGlobalStats();
    } catch (err) {
      console.error("Failed to increment stats", err);
    }
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

  return (
    <div className="flex flex-col items-center w-full px-4 relative">
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      {isShareOpen && <ShareCard onClose={() => setIsShareOpen(false)} />}
      {isAutoSettingsOpen && <AutomationSettings onClose={() => setIsAutoSettingsOpen(false)} />}

      {/* 
        GOLDEN GLOW WRAPPER 
        We wrap the Motion Card in a static div that handles the Glow/Border.
        This prevents the 'pulse' animation from fighting with the 'scale' entry animation.
      */}
      <div className={`relative w-full max-w-md p-[2px] rounded-3xl transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-200 animate-pulse shadow-[0_0_30px_rgba(234,179,8,0.4)]' : ''}`}>

        {/* Main Card (Glass) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`card w-full h-full bg-base-100/40 glass shadow-2xl overflow-hidden backdrop-blur-xl border ${isPremium ? 'border-none' : 'border-white/10'}`}
        >
          <div className="card-body items-center text-center p-8 sm:p-10 relative">
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${isPremium ? 'from-yellow-400/20' : 'from-primary/10'} to-transparent pointer-events-none`} />

            {/* Dynamic Role Selector (Replaces Static Vibe Badge) */}
            <div className="mb-6 z-20">
              <RoleSelector />
            </div>

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

            {/* Note: Settings button removed as RoleSelector is now primary control */}

            {/* Actions */}
            <div className="card-actions w-full justify-center flex-col items-center gap-3">
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

              {isPremium && (
                <button onClick={() => setIsAutoSettingsOpen(true)} className="btn btn-ghost btn-xs opacity-50 hover:opacity-100 mt-2">
                  <Zap className="w-3 h-3 mr-1" /> Configure Automation
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <SpecialnessCounter />

      {
        copied && (
          <div className="toast toast-bottom toast-center z-50">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="alert alert-success shadow-lg">
              <Heart className="w-4 h-4 fill-current" />
              <span>Spark ready for {displayNickname}! 💖</span>
            </motion.div>
          </div>
        )
      }
    </div >
  );
}
