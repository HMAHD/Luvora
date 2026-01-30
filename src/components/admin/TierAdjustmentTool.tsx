'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown,
    Star,
    Search,
    UserCheck,
    AlertTriangle,
    CheckCircle,
    History,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { TIER, TIER_NAMES, type TierLevel } from '@/lib/types';
import { changeUserTier, getUserTierHistory, searchUserByEmail, type TierChangeReason, type TierAuditLog } from '@/actions/tier';

interface TierAdjustmentToolProps {
    adminId: string;
}

const REASON_LABELS: Record<TierChangeReason, string> = {
    purchase: 'Purchase',
    refund: 'Refund',
    dispute: 'Dispute',
    admin_upgrade: 'Admin Upgrade',
    admin_downgrade: 'Admin Downgrade',
    sync_script: 'Sync Script',
    promo_code: 'Promo Code',
    gift: 'Gift',
    system: 'System',
};

export function TierAdjustmentTool({ adminId }: TierAdjustmentToolProps) {
    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState<{
        id: string;
        email: string;
        name: string;
        tier: TierLevel;
    } | null>(null);
    const [selectedTier, setSelectedTier] = useState<TierLevel>(TIER.FREE);
    const [selectedReason, setSelectedReason] = useState<TierChangeReason>('admin_upgrade');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [tierHistory, setTierHistory] = useState<TierAuditLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const searchUser = async () => {
        if (!searchEmail.trim()) return;

        setSearching(true);
        setError(null);
        setFoundUser(null);
        setTierHistory([]);
        setShowHistory(false);

        try {
            const user = await searchUserByEmail(searchEmail.trim());
            if (user) {
                setFoundUser(user);
                setSelectedTier(user.tier);
            } else {
                setError('User not found with that email');
            }
        } catch {
            setError('Failed to search for user');
        } finally {
            setSearching(false);
        }
    };

    const loadHistory = async () => {
        if (!foundUser) return;

        setLoadingHistory(true);
        try {
            const history = await getUserTierHistory(foundUser.id);
            setTierHistory(history);
            setShowHistory(true);
        } catch {
            setTierHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleTierChange = async () => {
        if (!foundUser) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await changeUserTier(
            foundUser.id,
            selectedTier,
            selectedReason,
            adminId,
            notes ? { notes } : undefined
        );

        setLoading(false);

        if (result.success) {
            setSuccess(
                `Successfully changed ${foundUser.email} from ${TIER_NAMES[result.previousTier!]} to ${TIER_NAMES[result.newTier!]}`
            );
            setFoundUser({ ...foundUser, tier: selectedTier });
            // Refresh history
            if (showHistory) {
                loadHistory();
            }
        } else {
            setError(result.error || 'Failed to change tier');
        }
    };

    const getTierIcon = (tier: TierLevel) => {
        switch (tier) {
            case TIER.LEGEND:
                return <Crown className="w-4 h-4 text-warning" />;
            case TIER.HERO:
                return <Star className="w-4 h-4 text-primary" />;
            default:
                return <UserCheck className="w-4 h-4 text-base-content/50" />;
        }
    };

    const getTierBadgeClass = (tier: TierLevel) => {
        switch (tier) {
            case TIER.LEGEND:
                return 'badge-warning';
            case TIER.HERO:
                return 'badge-primary';
            default:
                return 'badge-ghost';
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-content/5">
            <div className="card-body">
                <h2 className="card-title flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-warning" />
                    Tier Adjustment Tool
                </h2>

                {/* Search Section */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Search User by Email</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="user@example.com"
                            className="input input-bordered flex-1"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                        />
                        <button
                            onClick={searchUser}
                            disabled={searching || !searchEmail.trim()}
                            className="btn btn-primary"
                        >
                            {searching ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Search
                        </button>
                    </div>
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="alert alert-error mt-4"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="alert alert-success mt-4"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Found User Section */}
                {foundUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-base-200 rounded-xl space-y-4"
                    >
                        {/* User Info */}
                        <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-content/10">
                            <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                                        <span className="text-lg font-medium leading-none">
                                            {foundUser.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">{foundUser.name}</p>
                                    <p className="text-sm text-base-content/60">{foundUser.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-base-content/50">Current Tier</span>
                                <div className={`badge ${getTierBadgeClass(foundUser.tier)} gap-1`}>
                                    {getTierIcon(foundUser.tier)}
                                    {TIER_NAMES[foundUser.tier]}
                                </div>
                            </div>
                        </div>

                        {/* Tier Selection */}
                        <div className="divider text-xs text-base-content/40 my-2">Change Tier</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label pb-1">
                                    <span className="label-text font-medium">New Tier</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedTier}
                                    onChange={(e) => setSelectedTier(Number(e.target.value) as TierLevel)}
                                >
                                    <option value={TIER.FREE}>{TIER_NAMES[TIER.FREE]}</option>
                                    <option value={TIER.HERO}>{TIER_NAMES[TIER.HERO]}</option>
                                    <option value={TIER.LEGEND}>{TIER_NAMES[TIER.LEGEND]}</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label pb-1">
                                    <span className="label-text font-medium">Reason</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value as TierChangeReason)}
                                >
                                    {Object.entries(REASON_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control sm:col-span-2">
                                <label className="label pb-1">
                                    <span className="label-text font-medium">Notes</span>
                                    <span className="label-text-alt text-base-content/50">Optional</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Order #12345, Refund request, etc."
                                    className="input input-bordered w-full"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-base-content/10">
                            <button
                                onClick={loadHistory}
                                disabled={loadingHistory}
                                className="btn btn-ghost btn-sm gap-2"
                            >
                                {loadingHistory ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <History className="w-4 h-4" />
                                )}
                                {showHistory ? 'Refresh' : 'View'} History
                                {showHistory ? (
                                    <ChevronUp className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                            </button>

                            <button
                                onClick={handleTierChange}
                                disabled={loading || selectedTier === foundUser.tier}
                                className={`btn gap-2 ${
                                    selectedTier === foundUser.tier
                                        ? 'btn-disabled'
                                        : selectedTier > foundUser.tier
                                            ? 'btn-success'
                                            : 'btn-warning'
                                }`}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : selectedTier === foundUser.tier ? (
                                    'No Change'
                                ) : (
                                    <>
                                        {selectedTier > foundUser.tier ? 'Upgrade' : 'Downgrade'}
                                        <span className="opacity-75">
                                            {TIER_NAMES[foundUser.tier]} → {TIER_NAMES[selectedTier]}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* History Section */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-base-content/10 pt-4 mt-4"
                                >
                                    <h3 className="text-sm font-medium mb-3">Tier Change History</h3>
                                    {tierHistory.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {tierHistory.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="text-sm p-2 bg-base-100 rounded-lg flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`badge badge-xs ${getTierBadgeClass(log.previous_tier)}`}>
                                                            {TIER_NAMES[log.previous_tier]}
                                                        </span>
                                                        <span className="text-base-content/40">→</span>
                                                        <span className={`badge badge-xs ${getTierBadgeClass(log.new_tier)}`}>
                                                            {TIER_NAMES[log.new_tier]}
                                                        </span>
                                                        <span className="text-base-content/50">
                                                            ({REASON_LABELS[log.reason as TierChangeReason] || log.reason})
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-base-content/40">
                                                        {new Date(log.created).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-base-content/50 text-center py-4">
                                            No tier change history found
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
