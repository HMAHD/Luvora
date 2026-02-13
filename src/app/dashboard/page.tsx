'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/guards/PremiumGuard';
import { HeroGate, LegendGate } from '@/components/guards/TierGate';
import { TierBadge } from '@/components/TierBadge';
import { LoveLanguageQuiz } from '@/components/LoveLanguageQuiz';
import { ToneSelector } from '@/components/ToneSelector';
import { CountdownWidget, CountdownWidgetMini } from '@/components/CountdownWidget';
import { SparkArchive } from '@/components/SparkArchive';
import { PartnerLink } from '@/components/PartnerLink';
import { DeveloperIntegrations } from '@/components/DeveloperIntegrations';
import { TelegramSetup } from '@/components/messaging/TelegramSetup';
import { WhatsAppSetup } from '@/components/messaging/WhatsAppSetup';
import { TIER, TIER_NAMES, LOVE_LANGUAGE_NAMES, type LoveLanguage } from '@/lib/types';
import {
  User,
  Clock,
  Heart,
  Flame,
  Calendar,
  Settings,
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  MessageCircle,
  Cake,
  Gift,
  MessageCircleHeart,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { getDailySpark } from '@/lib/algo';

type Role = 'neutral' | 'masculine' | 'feminine';

// Inline Automation Tab Component
function AutomationTabContent({
  user,
  userTier,
  pb
}: {
  user: ReturnType<typeof useAuth>['user'];
  userTier: number;
  pb: ReturnType<typeof useAuth>['pb'];
}) {
  const [morningEnabled, setMorningEnabled] = useState(user?.morning_enabled ?? false);
  const [morningTime, setMorningTime] = useState(user?.morning_time || '08:00');
  const [eveningEnabled, setEveningEnabled] = useState(user?.evening_enabled ?? false);
  const [eveningTime, setEveningTime] = useState(user?.evening_time || '20:00');
  const [selectedPlatform, setSelectedPlatform] = useState<'telegram' | 'whatsapp' | 'discord'>('telegram');
  const [showMessagingSetup, setShowMessagingSetup] = useState(false);
  const [loveLanguage, setLoveLanguage] = useState(user?.love_language || '');
  const [preferredTone, setPreferredTone] = useState(user?.preferred_tone || '');
  const [specialOccasionsEnabled, setSpecialOccasionsEnabled] = useState(user?.special_occasions_enabled ?? true);
  const [anniversaryDate, setAnniversaryDate] = useState(user?.anniversary_date || '');
  const [partnerBirthday, setPartnerBirthday] = useState(user?.partner_birthday || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLegend = userTier >= TIER.LEGEND;

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const updateData: Record<string, unknown> = {
        timezone,
        morning_enabled: morningEnabled,
        morning_time: morningTime,
        evening_enabled: eveningEnabled,
        evening_time: eveningTime,
      };

      if (isLegend) {
        updateData.love_language = loveLanguage || null;
        updateData.preferred_tone = preferredTone || null;
        updateData.special_occasions_enabled = specialOccasionsEnabled;
        updateData.anniversary_date = anniversaryDate || null;
        updateData.partner_birthday = partnerBirthday || null;
      }

      await pb.collection('users').update(user.id, updateData);
      await pb.collection('users').authRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save automation:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messaging Channel Setup Card */}
      <div className="card bg-base-100 shadow-xl border border-base-content/10">
        <div className="card-body p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                Messaging Channel
              </h2>
              <p className="text-sm text-base-content/70 ml-12">
                Connect your preferred messaging platform to receive daily sparks directly
              </p>
            </div>
          </div>

          {!showMessagingSetup ? (
            <div className="space-y-4">
              {/* Platform Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Telegram Option */}
                <button
                  onClick={() => setSelectedPlatform('telegram')}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    selectedPlatform === 'telegram'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : 'border-base-content/10 bg-base-100 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedPlatform === 'telegram' ? 'bg-primary/20' : 'bg-base-200 group-hover:bg-primary/10'
                    }`}>
                      <svg className={`w-7 h-7 transition-colors ${
                        selectedPlatform === 'telegram' ? 'text-primary' : 'text-base-content/60 group-hover:text-primary'
                      }`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${
                        selectedPlatform === 'telegram' ? 'text-primary' : 'text-base-content'
                      }`}>Telegram</h3>
                      <p className="text-xs text-base-content/60 mt-1">Bot-based delivery</p>
                    </div>
                    {selectedPlatform === 'telegram' && (
                      <div className="absolute top-2 right-2">
                        <div className="badge badge-primary badge-sm">Selected</div>
                      </div>
                    )}
                  </div>
                </button>

                {/* WhatsApp Option */}
                <button
                  onClick={() => setSelectedPlatform('whatsapp')}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    selectedPlatform === 'whatsapp'
                      ? 'border-success bg-success/5 shadow-lg shadow-success/20'
                      : 'border-base-content/10 bg-base-100 hover:border-success/30 hover:shadow-md'
                  }`}
                >
                  <div className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedPlatform === 'whatsapp' ? 'bg-success/20' : 'bg-base-200 group-hover:bg-success/10'
                    }`}>
                      <svg className={`w-7 h-7 transition-colors ${
                        selectedPlatform === 'whatsapp' ? 'text-success' : 'text-base-content/60 group-hover:text-success'
                      }`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${
                        selectedPlatform === 'whatsapp' ? 'text-success' : 'text-base-content'
                      }`}>WhatsApp</h3>
                      <p className="text-xs text-base-content/60 mt-1">QR code linking</p>
                    </div>
                    {selectedPlatform === 'whatsapp' && (
                      <div className="absolute top-2 right-2">
                        <div className="badge badge-success badge-sm">Selected</div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Discord Option */}
                <button
                  onClick={() => setSelectedPlatform('discord')}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    selectedPlatform === 'discord'
                      ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/20'
                      : 'border-base-content/10 bg-base-100 hover:border-secondary/30 hover:shadow-md'
                  }`}
                >
                  <div className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedPlatform === 'discord' ? 'bg-secondary/20' : 'bg-base-200 group-hover:bg-secondary/10'
                    }`}>
                      <svg className={`w-7 h-7 transition-colors ${
                        selectedPlatform === 'discord' ? 'text-secondary' : 'text-base-content/60 group-hover:text-secondary'
                      }`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${
                        selectedPlatform === 'discord' ? 'text-secondary' : 'text-base-content'
                      }`}>Discord</h3>
                      <p className="text-xs text-base-content/60 mt-1">DM notifications</p>
                    </div>
                    {selectedPlatform === 'discord' && (
                      <div className="absolute top-2 right-2">
                        <div className="badge badge-secondary badge-sm">Selected</div>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Info Alert */}
              <div className={`alert shadow-md border-l-4 ${
                selectedPlatform === 'telegram' ? 'border-primary bg-primary/5' :
                selectedPlatform === 'whatsapp' ? 'border-success bg-success/5' :
                'border-secondary bg-secondary/5'
              }`}>
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`stroke-current shrink-0 w-6 h-6 ${
                    selectedPlatform === 'telegram' ? 'text-primary' :
                    selectedPlatform === 'whatsapp' ? 'text-success' :
                    'text-secondary'
                  }`}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-base-content">
                      {selectedPlatform === 'telegram' && 'Create your own Telegram bot using @BotFather'}
                      {selectedPlatform === 'whatsapp' && 'Link your personal WhatsApp account via QR code'}
                      {selectedPlatform === 'discord' && 'Connect your Discord account for direct messages'}
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {selectedPlatform === 'telegram' && 'Your bot token is securely encrypted and stored'}
                      {selectedPlatform === 'whatsapp' && 'Session persists - no need to rescan each time'}
                      {selectedPlatform === 'discord' && 'Receive sparks privately in your Discord DMs'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Setup Button */}
              <button
                onClick={() => setShowMessagingSetup(true)}
                className={`btn btn-block gap-2 shadow-lg ${
                  selectedPlatform === 'telegram' ? 'btn-primary' :
                  selectedPlatform === 'whatsapp' ? 'btn-success' :
                  'btn-secondary'
                }`}
              >
                <Settings className="w-5 h-5" />
                Configure {selectedPlatform === 'telegram' ? 'Telegram Bot' :
                           selectedPlatform === 'whatsapp' ? 'WhatsApp Connection' :
                           'Discord Integration'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between pb-4 border-b border-base-content/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedPlatform === 'telegram' ? 'bg-primary/10' :
                    selectedPlatform === 'whatsapp' ? 'bg-success/10' :
                    'bg-secondary/10'
                  }`}>
                    {selectedPlatform === 'telegram' && (
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    )}
                    {selectedPlatform === 'whatsapp' && (
                      <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    )}
                    {selectedPlatform === 'discord' && (
                      <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-base-content">
                      {selectedPlatform === 'telegram' ? 'Telegram' :
                       selectedPlatform === 'whatsapp' ? 'WhatsApp' :
                       'Discord'} Setup
                    </h3>
                    <p className="text-xs text-base-content/60">Follow the steps below</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessagingSetup(false)}
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>
              </div>

              {/* Component Integration */}
              <div className="mt-4">
                {selectedPlatform === 'telegram' ? (
                  <TelegramSetup
                    userId={user?.id || ''}
                    onSuccess={() => {
                      setShowMessagingSetup(false);
                    }}
                    onError={(error) => {
                      console.error('Telegram setup error:', error);
                    }}
                  />
                ) : selectedPlatform === 'whatsapp' ? (
                  <WhatsAppSetup
                    userId={user?.id || ''}
                    onSuccess={() => {
                      setShowMessagingSetup(false);
                    }}
                    onError={(error) => {
                      console.error('WhatsApp setup error:', error);
                    }}
                  />
                ) : (
                  <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Discord Integration Coming Soon</h3>
                      <div className="text-xs">We're currently working on Discord support. Please use Telegram or WhatsApp for now.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Schedule Card */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5">
        <div className="card-body">
          <h2 className="card-title text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Delivery Schedule
          </h2>
          <p className="text-sm text-base-content/60 mb-4">
            Choose when to receive your sparks • Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Morning Spark */}
            <div className={`card p-4 transition-all ${morningEnabled ? 'bg-warning/10 border-2 border-warning/40' : 'bg-base-200/50 border border-base-content/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className={`w-5 h-5 ${morningEnabled ? 'text-warning' : 'text-base-content/40'}`} />
                  <span className="font-medium">Morning Spark</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-warning"
                  checked={morningEnabled}
                  onChange={(e) => setMorningEnabled(e.target.checked)}
                />
              </div>
              {morningEnabled && (
                <input
                  type="time"
                  className="input input-bordered input-sm w-full"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                />
              )}
              <p className="text-xs text-base-content/50 mt-2">
                {morningEnabled ? 'Start your day with love' : 'Enable to receive morning sparks'}
              </p>
            </div>

            {/* Evening Spark */}
            <div className={`card p-4 transition-all ${eveningEnabled ? 'bg-info/10 border-2 border-info/40' : 'bg-base-200/50 border border-base-content/10'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className={`w-5 h-5 ${eveningEnabled ? 'text-info' : 'text-base-content/40'}`} />
                  <span className="font-medium">Night Spark</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-info"
                  checked={eveningEnabled}
                  onChange={(e) => setEveningEnabled(e.target.checked)}
                />
              </div>
              {eveningEnabled && (
                <input
                  type="time"
                  className="input input-bordered input-sm w-full"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                />
              )}
              <p className="text-xs text-base-content/50 mt-2">
                {eveningEnabled ? 'End your day with warmth' : 'Enable to receive evening sparks'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Features Card */}
      {isLegend ? (
        <div className="card bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-warning" />
              <h2 className="card-title text-lg">Legend Features</h2>
            </div>

            <div className="space-y-5">
              {/* Love Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" /> Love Language
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={loveLanguage}
                  onChange={(e) => setLoveLanguage(e.target.value)}
                >
                  <option value="">Auto (Varied messages)</option>
                  {Object.entries(LOVE_LANGUAGE_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                <label className="label py-1">
                  <span className="label-text-alt text-base-content/50">Messages tailored to how your partner feels love</span>
                </label>
              </div>

              {/* Emotional Tone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" /> Emotional Tone
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={preferredTone}
                  onChange={(e) => setPreferredTone(e.target.value)}
                >
                  <option value="">Auto (Varied tones)</option>
                  <option value="poetic">Poetic</option>
                  <option value="playful">Playful</option>
                  <option value="romantic">Romantic</option>
                  <option value="passionate">Passionate</option>
                  <option value="sweet">Sweet</option>
                  <option value="supportive">Supportive</option>
                </select>
              </div>

              {/* Special Occasions */}
              <div className={`card p-4 transition-all ${specialOccasionsEnabled ? 'bg-base-100 border border-warning/30' : 'bg-base-200/30 border border-base-content/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-warning" />
                    <span className="font-medium">Special Occasion Sparks</span>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    checked={specialOccasionsEnabled}
                    onChange={(e) => setSpecialOccasionsEnabled(e.target.checked)}
                  />
                </div>

                {specialOccasionsEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400" /> Anniversary
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full"
                        value={anniversaryDate}
                        onChange={(e) => setAnniversaryDate(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs flex items-center gap-1">
                          <Cake className="w-3 h-3 text-amber-400" /> Partner Birthday
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full"
                        value={partnerBirthday}
                        onChange={(e) => setPartnerBirthday(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-base-content/50 mt-2">
                  Get extra special messages on important dates
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-warning/5 border border-warning/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-warning" />
              <div className="flex-1">
                <h3 className="font-bold text-warning">Unlock Legend Features</h3>
                <p className="text-sm text-base-content/60">
                  Love Language, Emotional Tones, Anniversary Intelligence & more
                </p>
              </div>
              <Link href="/pricing" className="btn btn-warning btn-sm">
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`btn btn-block btn-lg ${saved ? 'btn-success' : 'btn-primary'}`}
      >
        {saving ? (
          <span className="loading loading-spinner" />
        ) : saved ? (
          <>
            <Check className="w-5 h-5" /> Saved!
          </>
        ) : (
          'Save Schedule Settings'
        )}
      </button>
    </div>
  );
}

function DashboardContent() {
  const { user, pb } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'automation' | 'history'>('profile');

  // Form states - Initialize from user object (PocketBase), NOT localStorage
  const [formPartnerName, setFormPartnerName] = useState('');
  const [formRole, setFormRole] = useState<Role>('neutral');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Phase 8: Legend tier fields
  const [showLoveLanguageQuiz, setShowLoveLanguageQuiz] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');

  // User tier (default to FREE)
  const userTier = user?.tier ?? TIER.FREE;

  // Load user data from PocketBase on mount/user change
  useEffect(() => {
    if (user) {
      setFormPartnerName(user.partner_name || '');
      setFormRole(user.recipient_role || 'neutral');
      // Phase 8 fields
      setAnniversaryDate(user.anniversary_date || '');
      setPartnerBirthday(user.partner_birthday || '');
      setRelationshipStart(user.relationship_start || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      // Save to PocketBase (user-specific data)
      await pb.collection('users').update(user.id, {
        partner_name: formPartnerName,
        recipient_role: formRole,
      });

      // Also update localStorage for SparkCard (synced)
      localStorage.setItem('partner_name', JSON.stringify(formPartnerName));
      localStorage.setItem('recipient_role', JSON.stringify(formRole));

      // Update auth store to trigger realtime updates
      const currentRecord = pb.authStore.record;
      if (currentRecord) {
        pb.authStore.save(pb.authStore.token!, {
          ...currentRecord,
          partner_name: formPartnerName,
          recipient_role: formRole,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDates = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await pb.collection('users').update(user.id, {
        anniversary_date: anniversaryDate || null,
        partner_birthday: partnerBirthday || null,
        relationship_start: relationshipStart || null,
      });

      const currentRecord = pb.authStore.record;
      if (currentRecord) {
        pb.authStore.save(pb.authStore.token!, {
          ...currentRecord,
          anniversary_date: anniversaryDate || null,
          partner_birthday: partnerBirthday || null,
          relationship_start: relationshipStart || null,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save dates:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-content/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-ghost btn-circle btn-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-base-content">Command Center</h1>
              <p className="text-sm text-base-content/60">Manage your sparks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown Mini Widget */}
            {userTier >= TIER.LEGEND && (
              <CountdownWidgetMini
                anniversaryDate={user?.anniversary_date}
                partnerBirthday={user?.partner_birthday}
              />
            )}
            <TierBadge tier={userTier} size="md" />
            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-base-100 border-b border-base-content/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="tabs tabs-bordered">
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab tab-lg gap-2 ${activeTab === 'profile' ? 'tab-active' : ''}`}
            >
              <Heart className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`tab tab-lg gap-2 ${activeTab === 'preferences' ? 'tab-active' : ''}`}
            >
              <Crown className="w-4 h-4" />
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`tab tab-lg gap-2 ${activeTab === 'automation' ? 'tab-active' : ''}`}
            >
              <Clock className="w-4 h-4" />
              Automation
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab tab-lg gap-2 ${activeTab === 'history' ? 'tab-active' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Streak Stat */}
              <div className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 shadow-lg">
                <div className="card-body p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Streak</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mt-1">
                      {user?.streak || 0}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {user?.streak === 0 ? 'Start today!' : user?.streak === 1 ? 'Keep it up!' : 'On fire!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Stat */}
              <div className="card bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 shadow-lg">
                <div className="card-body p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Partner</p>
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 mt-1 truncate">
                      {user?.partner_name || 'Not set'}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {user?.partner_name ? 'Your special one' : 'Add their name'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier Stat */}
              <div className={`card border shadow-lg ${
                userTier === TIER.LEGEND
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20'
                  : userTier === TIER.HERO
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                  : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20'
              }`}>
                <div className="card-body p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      userTier === TIER.LEGEND
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/30'
                        : userTier === TIER.HERO
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-500/30'
                        : 'bg-gradient-to-br from-gray-400 to-slate-500 shadow-gray-500/30'
                    }`}>
                      {userTier === TIER.LEGEND ? (
                        <Crown className="w-6 h-6 text-white" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Tier</p>
                    <p className={`text-xl font-bold mt-1 ${
                      userTier === TIER.LEGEND ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500' :
                      userTier === TIER.HERO ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500' :
                      'text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-slate-500'
                    }`}>
                      {TIER_NAMES[userTier]}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {userTier === TIER.FREE ? (
                        <Link href="/pricing" className="link link-primary font-medium">Upgrade now</Link>
                      ) : (
                        'Premium active'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Love Language Stat (Legend only) or Upgrade Prompt */}
              {userTier >= TIER.LEGEND ? (
                <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-lg">
                  <div className="card-body p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <MessageCircleHeart className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Love Language</p>
                      <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mt-1 truncate">
                        {user?.love_language ? LOVE_LANGUAGE_NAMES[user.love_language as LoveLanguage] : 'Not set'}
                      </p>
                      <button
                        onClick={() => setShowLoveLanguageQuiz(true)}
                        className="text-xs text-purple-500 hover:text-purple-600 font-medium mt-1 transition-colors"
                      >
                        {user?.love_language ? 'Retake Quiz →' : 'Take Quiz →'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <Link href="/pricing" className="card-body p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Legend</p>
                      <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mt-1">
                        Unlock More
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium mt-1 group-hover:underline">
                        Upgrade now →
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Relationship Profile */}
            <div className="card bg-base-100 shadow-xl border border-base-content/10">
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="card-title text-xl font-bold flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      Relationship Profile
                    </h2>
                    <p className="text-sm text-base-content/70 ml-12">
                      Tell us about your special someone to personalize every spark
                    </p>
                  </div>
                </div>

                <div className="space-y-5 mt-4">
                  {/* Partner Name Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        Partner&apos;s Name
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter their name or nickname"
                      className="input input-bordered input-lg w-full focus:input-primary transition-all"
                      value={formPartnerName}
                      onChange={(e) => setFormPartnerName(e.target.value)}
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        This name will appear in your personalized messages
                      </span>
                    </label>
                  </div>

                  {/* Recipient Role Selection */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        Recipient Role
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['neutral', 'feminine', 'masculine'] as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setFormRole(r)}
                          className={`btn btn-lg relative overflow-hidden transition-all duration-300 ${
                            formRole === r
                              ? r === 'feminine'
                                ? 'btn-secondary shadow-lg shadow-secondary/30'
                                : r === 'masculine'
                                ? 'btn-primary shadow-lg shadow-primary/30'
                                : 'btn-accent shadow-lg shadow-accent/30'
                              : 'btn-outline hover:shadow-md'
                          }`}
                        >
                          {formRole === r && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                          <span className="flex items-center gap-2">
                            {r === 'neutral' ? '💑 Partner' : r === 'feminine' ? '💖 Her' : '💙 Him'}
                          </span>
                        </button>
                      ))}
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Messages will be crafted specifically for{' '}
                        <span className="font-medium text-base-content">
                          {formRole === 'neutral' ? 'your partner' : formRole === 'feminine' ? 'her' : 'him'}
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !formPartnerName.trim()}
                      className={`btn btn-lg w-full gap-2 shadow-lg transition-all ${
                        saved
                          ? 'btn-success'
                          : 'btn-primary hover:shadow-xl'
                      }`}
                    >
                      {saving ? (
                        <>
                          <span className="loading loading-spinner loading-sm" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-5 h-5" /> Profile Saved!
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" /> Save Profile
                        </>
                      )}
                    </button>
                    {!formPartnerName.trim() && (
                      <p className="text-xs text-warning mt-2 text-center">
                        Please enter your partner&apos;s name to continue
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <LegendGate blur>
              {/* Love Language & Tone Preferences */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5">
                <div className="card-body gap-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Legend Preferences</h2>
                      <p className="text-xs text-base-content/50">Personalized sparks just for you</p>
                    </div>
                  </div>

                  <div className="divider my-0"></div>

                  {/* Love Language Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircleHeart className="w-4 h-4 text-pink-400" />
                      <span className="font-medium text-sm">Love Language</span>
                    </div>

                    {user?.love_language ? (
                      <div className="flex items-center justify-between bg-base-200/50 rounded-xl p-4 border border-base-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-400/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-base-content">
                              {LOVE_LANGUAGE_NAMES[user.love_language as LoveLanguage]}
                            </p>
                            <p className="text-xs text-base-content/50">Your primary love language</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowLoveLanguageQuiz(true)}
                          className="btn btn-ghost btn-sm"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLoveLanguageQuiz(true)}
                        className="w-full btn btn-outline btn-primary gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Discover Your Love Language
                      </button>
                    )}
                    <p className="text-xs text-base-content/40 pl-1">
                      Get sparks that speak directly to how you experience love
                    </p>
                  </div>

                  <div className="divider my-0"></div>

                  {/* Emotional Tone */}
                  <ToneSelector />
                </div>
              </div>

              {/* Important Dates */}
              <div className="card bg-base-100 shadow-sm border border-base-content/5 mt-6">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Important Dates
                  </h2>
                  <p className="text-sm text-base-content/60 mb-4">
                    Get special sparks on your most cherished days
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-400" />
                          Anniversary
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={anniversaryDate}
                        onChange={(e) => setAnniversaryDate(e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Cake className="w-4 h-4 text-amber-400" />
                          Partner&apos;s Birthday
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={partnerBirthday}
                        onChange={(e) => setPartnerBirthday(e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-400" />
                          Started Dating
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={relationshipStart}
                        onChange={(e) => setRelationshipStart(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveDates}
                    disabled={saving}
                    className={`btn w-full mt-4 ${saved ? 'btn-success' : 'btn-primary'}`}
                  >
                    {saving ? (
                      <span className="loading loading-spinner" />
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved!
                      </>
                    ) : (
                      'Save Important Dates'
                    )}
                  </button>

                  {/* Countdown Widget */}
                  {(anniversaryDate || partnerBirthday || relationshipStart) && (
                    <div className="mt-6 pt-6 border-t border-base-content/10">
                      <CountdownWidget
                        anniversaryDate={anniversaryDate}
                        partnerBirthday={partnerBirthday}
                        relationshipStart={relationshipStart}
                        partnerName={formPartnerName || 'Partner'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Link Section */}
              <div className="mt-6">
                <PartnerLink />
              </div>

              {/* Developer Integrations */}
              <div className="mt-6">
                <DeveloperIntegrations />
              </div>
            </LegendGate>
          </motion.div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <HeroGate blur>
              <AutomationTabContent
                user={user}
                userTier={userTier}
                pb={pb}
              />
            </HeroGate>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SparkArchive userTier={userTier} role={formRole} />
          </motion.div>
        )}
      </main>

      {/* Love Language Quiz Modal */}
      <LoveLanguageQuiz
        isOpen={showLoveLanguageQuiz}
        onClose={() => setShowLoveLanguageQuiz(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
