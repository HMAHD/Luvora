'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChevronDown } from 'lucide-react';

type Role = 'neutral' | 'masculine' | 'feminine';

export function RoleSelector() {
    const [role, setRole] = useLocalStorage<Role>('recipient_role', 'neutral');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value as Role);
    };

    return (
        <div className="relative group">
            {/* Custom Select Appearance */}
            <select
                value={role}
                onChange={handleChange}
                className="appearance-none bg-base-100/50 backdrop-blur-md border border-base-content/10 pl-4 pr-10 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-base-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                <option value="neutral">Partner</option>
                <option value="masculine">He</option>
                <option value="feminine">She</option>
            </select>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronDown className="w-3 h-3" />
            </div>

            {/* Tooltip-ish help text on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap bg-base-300 px-2 py-1 rounded shadow-lg pointer-events-none">
                Adjust the vibe
            </div>
        </div>
    );
}
