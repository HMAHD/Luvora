'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { User } from '@/lib/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [partnerName, setPartnerName] = useLocalStorage<string>('partner_name', '');

    useEffect(() => {
        // Helper to sync partner name from DB if needed
        const syncData = (authUser: User) => {
            if (authUser.partner_name && authUser.partner_name !== partnerName) {
                console.log('Syncing from DB:', authUser.partner_name);
                setPartnerName(authUser.partner_name);
            }
        };

        // 1. Initial Load
        const model = pb.authStore.model as unknown as User | null;
        if (model) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(model);
            syncData(model);
        } else {
            // Fallback for Guests / Initial State
            // We ensure we never leave it entirely undefined if we can help it, 
            // though user=null is handled by UI. 
            // The critical part is local storage defaults which are handled by the hook initializer.
        }

        // 2. Subscribe to Auth Changes
        const unsubscribeAuth = pb.authStore.onChange((token, model) => {
            console.log('Auth Store Change:', { token, model });
            const u = model as unknown as User | null;
            setUser(u);
            if (u) syncData(u);
        });

        // Cleanup subscription
        return () => {
            unsubscribeAuth();
        };
    }, [partnerName, setPartnerName]);

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
