'use client';

import { useState, useEffect, useMemo } from 'react';
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
  // State for Spark (Initialize with memoized daily derivative)
  // useMemo ensures we recalculate sync spark immediately when role changes
  const dailySpark = useMemo(() => getDailySpark(new Date(), role), [role, partnerName]);

  const [spark, setSpark] = useState<DailySpark>(dailySpark);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAutoSettingsOpen, setIsAutoSettingsOpen] = useState(false);

  const isPremium = user?.is_premium;

  // Effect to handle Partner/Premium Spark generation (Async)
  useEffect(() => {
    async function loadSpark() {
      if (isPremium && user?.id) {
        const premiumSpark = await getPremiumSpark(new Date(), user.id, role);
        setSpark(premiumSpark);
      } else {
        // If not premium, revert to standard daily spark
        setSpark(dailySpark);
      }
    }
    loadSpark();
  }, [user, role, isPremium, dailySpark]);

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

  // Debug logs for Role/Partner (Diagnostic Mode)
  if (process.env.NODE_ENV !== 'production' || true) { // Force log for now
    console.log('[SparkCard] Render State:', { role, partnerName, isPremium, user });
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
      <div className={`relative w-full max-w-md p-[2px] rounded-3xl transition-all duration-500 ${isPremium ? 'gradient-gold animate-subtle-pulse shadow-[0_0_40px_rgba(234,179,8,0.35)]' : ''}`}>

        {/* Main Card (Glass) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`card w-full h-full glass shadow-2xl overflow-hidden border ${isPremium ? 'border-none bg-base-100/50' : 'border-base-content/5 bg-base-100/60'}`}
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
                <motion.span key={i} variants={item} className="inline-block mr-1 text-2xl sm:text-3xl font-serif leading-tight text-base-content text-opacity-100">
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Recipient */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm font-medium opacity-100 text-base-content text-opacity-100 mb-8 inline-block px-2">
              For {displayNickname || 'favorite human'}
            </motion.p>

            <button
              onClick={() => setIsShareOpen(true)}
              className="absolute top-4 left-4 btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200"
              title="Share Streak"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <Share2 size={20} strokeWidth={2} />
              </div>
            </button>

            {/* Note: Settings button removed as RoleSelector is now primary control */}

            {/* Actions */}
            <div className="card-actions w-full justify-center flex-col items-center gap-3">
              <button
                onClick={handleCopy}
                className={`btn btn-lg w-full sm:w-auto shadow-lg group relative overflow-hidden transition-all duration-200 ${isPremium ? 'gradient-gold text-base-100 hover:shadow-[0_8px_24px_-4px_rgba(234,179,8,0.5)]' : 'btn-primary hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.4)]'}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6">
                    {copied ? <Heart size={24} strokeWidth={2} className="fill-current animate-float" /> : <Copy size={24} strokeWidth={2} />}
                  </div>
                  {copied ? "Sent to Heart!" : "Copy Spark"}
                </span>
              </button>

              {!isPremium && (
                <button onClick={() => setIsUpgradeOpen(true)} className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content">
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
          <div className="toast toast-bottom toast-center z-50 safe-area-inset-bottom">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="alert alert-success shadow-xl border border-success/20"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-medium">Spark ready for {displayNickname}!</span>
            </motion.div>
          </div>
        )
      }
    </div >
  );
}
