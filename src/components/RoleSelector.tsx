'use client';

import { useAuth } from '@/hooks/useAuth';
import { ChevronDown } from 'lucide-react';

type Role = 'neutral' | 'masculine' | 'feminine';

export function RoleSelector() {
    const { user, pb } = useAuth();
    const role = (user?.recipient_role as Role) || 'neutral';

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as Role;
        if (user?.id) {
            try {
                // Update PocketBase user record
                await pb.collection('users').update(user.id, {
                    recipient_role: newRole,
                });
            } catch (err) {
                console.error('Failed to update role:', err);
            }
        }
    };

    return (
        <div className="relative group">
            {/* Custom Select Appearance */}
            <select
                value={role}
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
