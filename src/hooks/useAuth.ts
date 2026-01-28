'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { User } from '@/lib/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [partnerName, setPartnerName] = useLocalStorage<string>('partner_name', '');

    useEffect(() => {
        // 1. Initial Load
        const model = pb.authStore.model as unknown as User | null;
        if (model) {
            setUser(model);
            syncData(model);
        }

        // 2. Subscribe to Auth Changes
        const unsubscribeAuth = pb.authStore.onChange((token, model) => {
            const u = model as unknown as User | null;
            setUser(u);
            if (u) syncData(u);
        });

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

        /**
         * Sync Priority: DB > Local
         * If DB has name, overwrite Local.
         * If DB is empty, but Local has name, KEEP Local (and optionally prompt user to save).
         */
        const syncData = (authUser: User) => {
            if (authUser.partner_name && authUser.partner_name !== partnerName) {
                console.log('Syncing from DB:', authUser.partner_name);
                setPartnerName(authUser.partner_name);
            }
        };

        return { user, pb };
    }
