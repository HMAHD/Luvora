'use client';

import { useState, useEffect } from 'react';
import { SparkCard } from '@/components/SparkCard';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { UserCircle } from 'lucide-react';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-base-200 p-4 relative overflow-hidden safe-area-inset-top safe-area-inset-bottom">

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Auth Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        {isMounted && (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="btn btn-circle btn-ghost glass bg-base-100/40 border border-base-content/10 hover:bg-base-100/60 hover:border-base-content/20 transition-all duration-200"
          >
            {user ? (
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-center w-6 h-6">
                  <UserCircle size={24} strokeWidth={2} className="text-base-content" />
                </div>
              </div>
            )}
          </button>
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

      </div>
    </main>
  );
}
