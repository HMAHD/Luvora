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

    // Memoized sync function to avoid recreating on every render
    const syncPartnerName = useCallback((authUser: User) => {
        if (authUser.partner_name) {
            const currentName = localStorage.getItem('partner_name');
            if (currentName !== JSON.stringify(authUser.partner_name)) {
                localStorage.setItem('partner_name', JSON.stringify(authUser.partner_name));
            }
        }
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

        console.log('Subscribing to realtime updates for:', user.id);
        pb.collection('users').subscribe(user.id, (e) => {
            console.log('Realtime update:', e.action, e.record);
            if (e.action === 'update') {
                setUser(e.record as unknown as User); // Update local state instantly
            }
        });

        // Robust cleanup: Unsubscribe when user ID changes or component unmounts
        return () => {
            console.log('Unsubscribing from:', user.id);
            pb.collection('users').unsubscribe(user.id);
        };
    }, [user?.id]);

    return { user, pb };
}
