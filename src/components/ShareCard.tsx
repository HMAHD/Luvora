'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { Download, Flame, Lock, Crown, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { TIER, type TierLevel } from '@/lib/types';
import Link from 'next/link';

// Card style definitions
interface CardStyle {
  id: string;
  name: string;
  gradient: string;
  textGradient: string;
  bgColor: string;
  accentColor: string;
  minTier: TierLevel;
}

const CARD_STYLES: CardStyle[] = [
  // Free styles (1)
  {
    id: 'classic',
    name: 'Classic',
    gradient: 'from-primary to-secondary',
    textGradient: 'from-teal-500 via-emerald-400 to-cyan-500',
    bgColor: 'bg-base-100',
    accentColor: 'text-amber-500',
    minTier: TIER.FREE,
  },
  // Hero styles (5 total)
  {
    id: 'sunset',
    name: 'Sunset',
    gradient: 'from-orange-400 to-pink-500',
    textGradient: 'from-orange-500 via-pink-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-pink-50',
    accentColor: 'text-orange-500',
    minTier: TIER.HERO,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'from-blue-400 to-cyan-500',
    textGradient: 'from-blue-500 via-cyan-400 to-teal-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    accentColor: 'text-blue-500',
    minTier: TIER.HERO,
  },
  {
    id: 'forest',
    name: 'Forest',
    gradient: 'from-green-500 to-emerald-600',
    textGradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    accentColor: 'text-green-600',
    minTier: TIER.HERO,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    gradient: 'from-purple-400 to-indigo-500',
    textGradient: 'from-purple-500 via-indigo-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    accentColor: 'text-purple-500',
    minTier: TIER.HERO,
  },
  // Legend exclusive styles (12+ total)
  {
    id: 'gold',
    name: 'Royal Gold',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    textGradient: 'from-yellow-500 via-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    accentColor: 'text-amber-600',
    minTier: TIER.LEGEND,
  },
  {
    id: 'rose',
    name: 'Rose Petal',
    gradient: 'from-rose-400 to-pink-600',
    textGradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-100',
    accentColor: 'text-rose-500',
    minTier: TIER.LEGEND,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    gradient: 'from-slate-700 to-slate-900',
    textGradient: 'from-slate-300 via-white to-slate-300',
    bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
    accentColor: 'text-slate-300',
    minTier: TIER.LEGEND,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    gradient: 'from-green-400 via-cyan-500 to-purple-500',
    textGradient: 'from-green-400 via-cyan-400 to-purple-500',
    bgColor: 'bg-gradient-to-br from-slate-900 to-purple-950',
    accentColor: 'text-cyan-400',
    minTier: TIER.LEGEND,
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    gradient: 'from-pink-300 to-rose-400',
    textGradient: 'from-pink-400 via-rose-400 to-red-400',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
    accentColor: 'text-pink-500',
    minTier: TIER.LEGEND,
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    textGradient: 'from-indigo-400 via-purple-400 to-pink-400',
    bgColor: 'bg-gradient-to-br from-indigo-950 to-purple-950',
    accentColor: 'text-purple-400',
    minTier: TIER.LEGEND,
  },
  {
    id: 'ember',
    name: 'Ember',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    textGradient: 'from-red-500 via-orange-400 to-yellow-400',
    bgColor: 'bg-gradient-to-br from-red-950 to-orange-950',
    accentColor: 'text-orange-400',
    minTier: TIER.LEGEND,
  },
  // Premium Legend Templates (Phase 8)
  {
    id: 'velvet',
    name: 'Velvet Night',
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    textGradient: 'from-violet-300 via-purple-300 to-pink-300',
    bgColor: 'bg-gradient-to-br from-violet-950 to-indigo-950',
    accentColor: 'text-violet-300',
    minTier: TIER.LEGEND,
  },
  {
    id: 'champagne',
    name: 'Champagne',
    gradient: 'from-amber-200 via-yellow-300 to-amber-400',
    textGradient: 'from-amber-600 via-yellow-600 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    accentColor: 'text-amber-700',
    minTier: TIER.LEGEND,
  },
  {
    id: 'nebula',
    name: 'Nebula',
    gradient: 'from-fuchsia-500 via-purple-600 to-blue-700',
    textGradient: 'from-fuchsia-400 via-purple-400 to-cyan-400',
    bgColor: 'bg-gradient-to-br from-fuchsia-950 via-purple-950 to-blue-950',
    accentColor: 'text-fuchsia-400',
    minTier: TIER.LEGEND,
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    gradient: 'from-cyan-300 via-blue-400 to-indigo-500',
    textGradient: 'from-cyan-400 via-blue-300 to-white',
    bgColor: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    accentColor: 'text-cyan-600',
    minTier: TIER.LEGEND,
  },
  {
    id: 'eternal',
    name: 'Eternal Love',
    gradient: 'from-rose-500 via-red-500 to-pink-600',
    textGradient: 'from-rose-200 via-pink-200 to-white',
    bgColor: 'bg-gradient-to-br from-rose-900 via-red-950 to-pink-950',
    accentColor: 'text-rose-300',
    minTier: TIER.LEGEND,
  },
];

// Marketing text for sharing
const SHARE_TEXT = "Keeping our love alive, one spark at a time. Join us on Luvora!";
const SHARE_URL = "https://luvora.love";

export function ShareCard({ onClose, userTier = TIER.FREE }: { onClose: () => void; userTier?: TierLevel }) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>(CARD_STYLES[0]);

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

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${SHARE_TEXT}\n\n${streak} days of daily sparks!\n\n${SHARE_URL}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Share to Facebook
  const shareToFacebook = () => {
    const url = encodeURIComponent(SHARE_URL);
    const quote = encodeURIComponent(`${SHARE_TEXT} ${streak} days and counting!`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  };

  // Share to Instagram (Copy to clipboard - Instagram doesn't have direct share)
  const shareToInstagram = async () => {
    // Generate and download image first
    await downloadImage();
    // Copy text to clipboard
    navigator.clipboard.writeText(`${SHARE_TEXT}\n\n${streak} days of daily sparks!\n\n${SHARE_URL}`);
    alert('Image downloaded! Post it to Instagram with the caption (copied to clipboard).');
  };

  const canUseStyle = (style: CardStyle) => userTier >= style.minTier;

  // Check if the selected style is dark (for text color)
  const isDarkStyle = selectedStyle.bgColor.includes('slate') ||
                      selectedStyle.bgColor.includes('950') ||
                      selectedStyle.bgColor.includes('900');

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex flex-col gap-4 items-center my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Style Selector */}
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {CARD_STYLES.map((style) => {
            const canUse = canUseStyle(style);
            const isSelected = selectedStyle.id === style.id;

            return (
              <button
                key={style.id}
                onClick={() => canUse && setSelectedStyle(style)}
                disabled={!canUse}
                className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${style.gradient} transition-all ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''
                } ${!canUse ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                title={canUse ? style.name : `${style.name} (${style.minTier === TIER.LEGEND ? 'Legend' : 'Hero'} only)`}
              >
                {!canUse && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Upgrade hint for locked styles */}
        {userTier < TIER.LEGEND && (
          <Link href="/pricing" className="text-xs text-white/60 hover:text-white flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {userTier === TIER.FREE ? 'Upgrade for more styles' : 'Legend unlocks all styles'}
          </Link>
        )}

        {/* The Capture Area */}
        <div ref={cardRef} className={`bg-gradient-to-br ${selectedStyle.gradient} p-1 rounded-2xl shadow-2xl`}>
          <div className={`${selectedStyle.bgColor} p-8 rounded-xl w-[300px] h-[400px] flex flex-col items-center justify-between relative overflow-hidden text-center`}>
            {/* Decor */}
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${isDarkStyle ? 'from-white/10' : 'from-black/5'} to-transparent pointer-events-none`} />

            <div className="z-10 mt-4">
              <h4 className={`font-bold text-lg mb-1 ${isDarkStyle ? 'text-white' : 'text-base-content'}`}>Spread the Love</h4>
              <p className={`text-xs mb-4 ${isDarkStyle ? 'text-white/70' : 'text-base-content/70'}`}>&quot;A shared joy is a double joy.&quot;</p>
            </div>

            <div className="z-10 flex flex-col items-center">
              <div className={`text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${selectedStyle.textGradient} drop-shadow-sm`}>
                {streak}
              </div>
              <div className={`flex items-center gap-2 ${selectedStyle.accentColor} font-bold uppercase tracking-wider text-sm mt-2`}>
                <Flame className="w-5 h-5 fill-current animate-pulse" /> Days
              </div>
            </div>

            <div className="z-10 mb-4">
              <p className={`text-sm italic ${isDarkStyle ? 'text-white/70' : 'text-base-content/70'}`}>
                &quot;Consistency is the language of love.&quot;
              </p>
              <div className={`badge mt-4 ${isDarkStyle ? 'badge-outline border-white/40 text-white/80' : 'badge-outline text-base-content/60 border-base-content/40'}`}>
                Celebrating {partner}
              </div>
              <p className={`text-[10px] mt-2 ${isDarkStyle ? 'text-white/40' : 'text-base-content/40'}`}>
                luvora.love
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          {/* Download */}
          <button
            onClick={downloadImage}
            className="btn btn-primary w-full group shadow-lg hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.4)] transition-all duration-200"
          >
            {loading ? <span className="loading loading-spinner" /> : <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
            Download Card
          </button>

          {/* Social Share Buttons */}
          <div className="flex gap-2">
            <button
              onClick={shareToWhatsApp}
              className="btn btn-sm flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={shareToFacebook}
              className="btn btn-sm flex-1 bg-[#1877F2] hover:bg-[#0d6efd] text-white border-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              onClick={shareToInstagram}
              className="btn btn-sm flex-1 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white border-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </button>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-ghost btn-sm text-white/60 hover:text-white">Close</button>
      </motion.div>
    </div>,
    document.body
  );
}
