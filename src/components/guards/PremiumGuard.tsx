'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PremiumGuardProps {
  children: React.ReactNode;
  requiredTier?: 'hero' | 'legend';
  fallback?: React.ReactNode;
}

/**
 * PremiumGuard - Feature gate component for premium-only features
 * Wraps content that should only be accessible to premium users
 */
export function PremiumGuard({ children, requiredTier = 'hero', fallback }: PremiumGuardProps) {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Check if user has required tier
  const hasAccess = user?.is_premium ||
    (requiredTier === 'hero' && (user?.tier === 'hero' || user?.tier === 'legend')) ||
    (requiredTier === 'legend' && user?.tier === 'legend');

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-base-200 rounded-2xl border border-base-content/10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-base-content mb-2">Premium Feature</h3>
        <p className="text-base-content/60 mb-6 max-w-sm">
          This feature is available for {requiredTier === 'legend' ? 'Legend' : 'Hero'} members.
          Upgrade to unlock exclusive features.
        </p>
        <Link href="/" className="btn btn-primary gap-2">
          <Sparkles className="w-4 h-4" />
          Upgrade Now
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * AuthGuard - Requires user to be logged in
 */
export function AuthGuard({ children, redirectTo = '/' }: { children: React.ReactNode; redirectTo?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !user) {
      router.push(redirectTo);
    }
  }, [isClient, user, router, redirectTo]);

  if (!isClient || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * AdminGuard - Requires user to be an admin
 * Checks against ADMIN_UUIDS environment variable
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user is admin by ID or email
    const adminIds = (process.env.NEXT_PUBLIC_ADMIN_UUIDS || '').split(',').filter(Boolean);
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').filter(Boolean);

    const isAdminById = user?.id && adminIds.includes(user.id);
    const isAdminByEmail = user?.email && adminEmails.includes(user.email);

    if (isAdminById || isAdminByEmail) {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    if (isClient && !user) {
      router.push('/');
    }
  }, [isClient, user, router]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-base-content mb-2">Access Denied</h1>
          <p className="text-base-content/60 mb-6">You don&apos;t have permission to access this area.</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
