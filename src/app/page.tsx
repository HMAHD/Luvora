'use client';

import { useState, useEffect, useMemo } from 'react';
import { SparkCard } from '@/components/SparkCard';
import { AuthModal } from '@/components/AuthModal';
import { DynamicTitle } from '@/components/DynamicTitle';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle, Settings, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { TierBadge } from '@/components/TierBadge';
import { TIER } from '@/lib/types';
import { AdBanner } from '@/components/AdBanner';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const adminIds = (process.env.NEXT_PUBLIC_ADMIN_UUIDS || '').split(',').filter(Boolean);
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').filter(Boolean);
    return (user.id && adminIds.includes(user.id)) || (user.email && adminEmails.includes(user.email));
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-base-200 p-4 relative overflow-hidden safe-area-inset-top safe-area-inset-bottom">
      <DynamicTitle />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Menu Button (Top Left) - z-40 so modals (z-50) appear above */}
      <Footer />

      {/* Auth Button (Top Right) - z-40 so modals (z-50) appear above */}
      <div className="absolute top-4 right-4 z-40">
        {isMounted && (
          user ? (
            <div className="flex items-center gap-2">
              {/* Tier Badge (left of profile) */}
              {(user.tier ?? TIER.FREE) >= TIER.HERO && (
                <TierBadge tier={user.tier ?? TIER.FREE} size="sm" />
              )}

              {/* Profile Dropdown */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-circle btn-ghost bg-base-100 border border-base-content/15 hover:bg-base-200 hover:border-base-content/25 shadow-md transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                    <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-content/10 mt-2">
                <li className="menu-title px-2 py-1">
                  <span className="text-xs truncate">{user.email}</span>
                </li>
                <li>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      pb.authStore.clear();
                      window.location.reload();
                    }}
                    className="flex items-center gap-2 text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </li>
              </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn btn-circle btn-ghost bg-base-100 border border-base-content/15 hover:bg-base-200 hover:border-base-content/25 shadow-md transition-all duration-200"
            >
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-center w-6 h-6">
                  <UserCircle size={24} strokeWidth={2} className="text-base-content" />
                </div>
              </div>
            </button>
          )
        )}
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">

        {/* Header / Logo Area */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold font-romantic tracking-tight text-base-content mb-1">Luvora</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-base-content/50">Daily Spark</p>
        </div>

        {/* The Main Interface */}
        <SparkCard />

        {/* Ad Banner for Free Users - only render after mount to avoid hydration mismatch */}
        {isMounted && (!user || (user.tier ?? TIER.FREE) === TIER.FREE) && (
          <AdBanner
            adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || ''}
            adFormat="horizontal"
            className="w-full mt-4"
          />
        )}

      </div>
    </main>
  );
}
