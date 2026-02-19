'use client';

import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import type { User } from '@/lib/types';

// Initialize user from authStore immediately (not in useEffect)
const getInitialUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    return pb.authStore.record as unknown as User | null;
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(getInitialUser);

    // Partner name is now read directly from the user object (no localStorage)
    const syncPartnerName = useCallback((_authUser: User) => {
        // No-op: partner_name is available via user.partner_name
        // Removed localStorage persistence to prevent XSS exfiltration
    }, []);

    // Subscribe to Auth Store changes
    useEffect(() => {
        // Sync partner name on initial load if user exists
        const record = pb.authStore.record as unknown as User | null;
        if (record) {
            syncPartnerName(record);
        }

        // Subscribe to Auth Changes - this must run on every mount
        // to ensure subscription is active after Strict Mode re-mounts
        const unsubscribeAuth = pb.authStore.onChange((token, model) => {
            const u = model as unknown as User | null;
            setUser(u);
            if (u) {
                syncPartnerName(u);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribeAuth();
        };
    }, [syncPartnerName]);

    // 3. Realtime Subscription (for Instant Magic)
    useEffect(() => {
        if (!user?.id) return;

        pb.collection('users').subscribe(user.id, (e) => {
            if (e.action === 'update') {
                setUser(e.record as unknown as User); // Update local state instantly
            }
        });

        // Robust cleanup: Unsubscribe when user ID changes or component unmounts
        return () => {
            pb.collection('users').unsubscribe(user.id);
        };
    }, [user?.id]);

    return { user, pb };
}
