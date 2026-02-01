'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown } from 'lucide-react';

type Role = 'neutral' | 'masculine' | 'feminine';

export function RoleSelector() {
    const { user, pb } = useAuth();
    const [localRole, setLocalRole] = useState<Role>('neutral');

    // Sync local state with user data or localStorage
    useEffect(() => {
        if (user?.recipient_role) {
            setLocalRole(user.recipient_role as Role);
        } else {
            // For non-authenticated users, use localStorage
            const storedRole = localStorage.getItem('preferred_role') as Role | null;
            if (storedRole) {
                setLocalRole(storedRole);
            }
        }
    }, [user?.recipient_role]);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as Role;

        // Optimistic update - immediately reflect the change
        setLocalRole(newRole);

        if (user?.id) {
            try {
                // CRITICAL: Update auth store FIRST to trigger immediate UI updates
                // This ensures SparkCard sees the change before the database roundtrip
                const currentRecord = pb.authStore.record;
                const token = pb.authStore.token;

                if (currentRecord && token) {
                    // Create a NEW object to ensure React detects the change
                    pb.authStore.save(token, {
                        ...currentRecord,
                        recipient_role: newRole,
                    });
                }

                // Then update PocketBase (async in background)
                await pb.collection('users').update(user.id, {
                    recipient_role: newRole,
                });
            } catch (err) {
                console.error('Failed to update role:', err);
                // Revert on error
                setLocalRole((user.recipient_role as Role) || 'neutral');
                // Revert auth store
                const currentRecord = pb.authStore.record;
                const token = pb.authStore.token;
                if (currentRecord && token) {
                    pb.authStore.save(token, {
                        ...currentRecord,
                        recipient_role: (user.recipient_role as Role) || 'neutral',
                    });
                }
            }
        } else {
            // User not logged in - store preference in localStorage for persistence
            localStorage.setItem('preferred_role', newRole);
            // Dispatch custom event for same-tab reactivity
            window.dispatchEvent(new CustomEvent('roleChange', { detail: newRole }));
        }
    };

    return (
        <div className="relative group">
            {/* Custom Select Appearance */}
            <select
                value={localRole}
                onChange={handleChange}
                className="appearance-none bg-base-100 border border-base-content/20 px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-base-200 hover:border-base-content/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-base-content text-center"
            >
                <option value="neutral">Partner</option>
                <option value="masculine">He</option>
                <option value="feminine">She</option>
            </select>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity">
                <ChevronDown className="w-3 h-3" />
            </div>

            {/* Tooltip-ish help text on hover */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 text-[10px] whitespace-nowrap bg-base-300 text-base-content px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
                Adjust the vibe
            </div>
        </div>
    );
}
