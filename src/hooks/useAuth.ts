'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import type { User } from '@/lib/types';

// Initialize user from authStore immediately (not in useEffect)
const getInitialUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    return pb.authStore.model as unknown as User | null;
};

export function useAuth() {
    const [user, setUser] = useState<User | null>(getInitialUser);
    const hasInitializedRef = useRef(false);

    // Memoized sync function to avoid recreating on every render
    const syncPartnerName = useCallback((authUser: User) => {
        if (authUser.partner_name) {
            const currentName = localStorage.getItem('partner_name');
            if (currentName !== JSON.stringify(authUser.partner_name)) {
                localStorage.setItem('partner_name', JSON.stringify(authUser.partner_name));
            }
        }
    }, []);

    useEffect(() => {
        // Prevent double initialization in strict mode
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        // Sync partner name on initial load if user exists
        const model = pb.authStore.model as unknown as User | null;
        if (model) {
            syncPartnerName(model);
        }

        // Subscribe to Auth Changes
        const unsubscribeAuth = pb.authStore.onChange((token, model) => {
            console.log('Auth Store Change:', { token, model });
            const u = model as unknown as User | null;
            setUser(u);
            if (u) {
                syncPartnerName(u);
            }
        });

        // Cleanup subscription
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
