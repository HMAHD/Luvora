'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Heart,
    Download,
    Calendar,
    Copy,
    Check,
    Star,
    Filter,
    ChevronDown,
    FileJson,
    FileText,
    X,
    Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getDailySpark, getRarityInfo } from '@/lib/algo';
import { TIER, type EmotionalTone } from '@/lib/types';
import { ReplySuggestions } from '@/components/ReplySuggestions';
import { PhotoMemoryCard, PhotoMemoryButton } from '@/components/PhotoMemoryCard';

interface SparkEntry {
    date: string;
    morning: string;
    night: string;
    morningRarity?: string;
    nightRarity?: string;
    morningTone?: string;
    nightTone?: string;
    isFavorite?: boolean;
}

interface SparkArchiveProps {
    userTier: number;
    role: 'neutral' | 'masculine' | 'feminine';
}

export function SparkArchive({ userTier, role }: SparkArchiveProps) {
    const { user, pb } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRarity, setFilterRarity] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [sparkHistory, setSparkHistory] = useState<SparkEntry[]>([]);
    const [showPhotoCard, setShowPhotoCard] = useState(false);
    const [selectedSparkForPhoto, setSelectedSparkForPhoto] = useState<string>('');

    // Generate spark history based on tier
    const daysToShow = userTier >= TIER.LEGEND ? 90 : userTier >= TIER.HERO ? 30 : 7;
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        async function loadSparkHistory() {
            setLoadingHistory(true);
            const history: SparkEntry[] = [];

            // Load sparks in parallel batches for better performance
            const dates: Date[] = [];
            for (let i = 0; i < daysToShow; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date);
            }

            // Fetch all sparks in parallel
            const sparkPromises = dates.map(date => getDailySpark(date, role));
            const sparks = await Promise.all(sparkPromises);

            sparks.forEach((spark, i) => {
                const date = dates[i];
                history.push({
                    date: date.toISOString().split('T')[0],
                    morning: spark.morning.content,
                    night: spark.night.content,
                    morningRarity: spark.morning.rarity,
                    nightRarity: spark.night.rarity,
                    morningTone: spark.morning.tone,
                    nightTone: spark.night.tone,
                    isFavorite: favorites.has(date.toISOString().split('T')[0]),
                });
            });

            setSparkHistory(history);
            setLoadingHistory(false);
        }

        loadSparkHistory();
    }, [daysToShow, role, favorites]);

    // Load favorites from localStorage
    useEffect(() => {
        if (user?.id) {
            const saved = localStorage.getItem(`favorites_${user.id}`);
            if (saved) {
                setFavorites(new Set(JSON.parse(saved)));
            }
        }
    }, [user?.id]);

    // Filter and search sparks
    const filteredSparks = useMemo(() => {
        return sparkHistory.filter(spark => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!spark.morning.toLowerCase().includes(query) &&
                    !spark.night.toLowerCase().includes(query)) {
                    return false;
                }
            }

            // Rarity filter
            if (filterRarity) {
                if (spark.morningRarity !== filterRarity && spark.nightRarity !== filterRarity) {
                    return false;
                }
            }

            // Favorites filter
            if (showFavoritesOnly && !favorites.has(spark.date)) {
                return false;
            }

            return true;
        });
    }, [sparkHistory, searchQuery, filterRarity, showFavoritesOnly, favorites]);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleFavorite = (date: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(date)) {
            newFavorites.delete(date);
        } else {
            newFavorites.add(date);
        }
        setFavorites(newFavorites);
        if (user?.id) {
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify([...newFavorites]));
        }
    };

    const exportHistory = (format: 'json' | 'txt') => {
        const dataToExport = showFavoritesOnly
            ? filteredSparks
            : sparkHistory;

        if (format === 'json') {
            const json = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `luvora-sparks-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            let text = `Luvora Spark History\nExported: ${new Date().toLocaleDateString()}\n${'='.repeat(50)}\n\n`;
            dataToExport.forEach(spark => {
                const date = new Date(spark.date);
                text += `📅 ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
                text += `☀️ Morning: ${spark.morning}\n`;
                text += `🌙 Night: ${spark.night}\n`;
                if (favorites.has(spark.date)) text += `⭐ Favorited\n`;
                text += '\n';
            });
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `luvora-sparks-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Spark Archive
                    </h2>
                    <p className="text-sm text-base-content/60">
                        {userTier >= TIER.LEGEND ? 'Unlimited' : `Last ${daysToShow} days`} • {filteredSparks.length} sparks
                        {favorites.size > 0 && ` • ${favorites.size} favorites`}
                    </p>
                </div>

                {/* Export Dropdown */}
                {userTier >= TIER.LEGEND && (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-outline btn-sm gap-2">
                            <Download className="w-4 h-4" />
                            Export
                            <ChevronDown className="w-3 h-3" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-content/10">
                            <li>
                                <button onClick={() => exportHistory('json')} className="flex items-center gap-2">
                                    <FileJson className="w-4 h-4" />
                                    Export as JSON
                                </button>
                            </li>
                            <li>
                                <button onClick={() => exportHistory('txt')} className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Export as Text
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search your sparks..."
                        className="input input-bordered w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`btn ${showFavoritesOnly ? 'btn-primary' : 'btn-outline'} gap-2`}
                    >
                        <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Favorites</span>
                    </button>

                    {userTier >= TIER.LEGEND && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${showFilters || filterRarity ? 'btn-primary' : 'btn-outline'} gap-2`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Rarity Filter Pills */}
            <AnimatePresence>
                {showFilters && userTier >= TIER.LEGEND && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {['common', 'rare', 'epic', 'legendary'].map(rarity => {
                            const info = getRarityInfo(rarity as 'common' | 'rare' | 'epic' | 'legendary');
                            return (
                                <button
                                    key={rarity}
                                    onClick={() => setFilterRarity(filterRarity === rarity ? null : rarity)}
                                    className={`btn btn-sm ${filterRarity === rarity ? 'btn-primary' : 'btn-outline'} ${info.color}`}
                                >
                                    {info.label}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spark List */}
            <div className="space-y-3">
                {filteredSparks.length === 0 ? (
                    <div className="text-center py-12 text-base-content/50">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No sparks found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="btn btn-ghost btn-sm mt-2"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredSparks.map((spark, index) => {
                        const date = new Date(spark.date);
                        const isToday = index === 0 && !searchQuery && !showFavoritesOnly;
                        const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const morningRarity = getRarityInfo(spark.morningRarity as 'common' | 'rare' | 'epic' | 'legendary' | undefined);
                        const nightRarity = getRarityInfo(spark.nightRarity as 'common' | 'rare' | 'epic' | 'legendary' | undefined);
                        const isFavorite = favorites.has(spark.date);

                        return (
                            <motion.div
                                key={spark.date}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`card bg-base-100 shadow-sm border ${
                                    isToday ? 'border-primary/30' :
                                    isFavorite ? 'border-yellow-400/30' :
                                    'border-base-content/5'
                                }`}
                            >
                                <div className="card-body p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${isToday ? 'text-primary' : 'text-base-content'}`}>
                                                {dayName}
                                            </span>
                                            <span className="text-sm text-base-content/50">{dateStr}</span>
                                            {isToday && (
                                                <span className="badge badge-primary badge-sm">Current</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {userTier >= TIER.LEGEND && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSparkForPhoto(spark.morning);
                                                        setShowPhotoCard(true);
                                                    }}
                                                    className="btn btn-ghost btn-sm btn-circle text-base-content/30 hover:text-primary"
                                                    title="Create Photo Memory Card"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleFavorite(spark.date)}
                                                className={`btn btn-ghost btn-sm btn-circle ${isFavorite ? 'text-yellow-500' : 'text-base-content/30'}`}
                                            >
                                                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Morning Spark */}
                                        <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                                            <span className="text-lg">☀️</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-base-content">{spark.morning}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {userTier >= TIER.LEGEND && spark.morningRarity && spark.morningRarity !== 'common' && (
                                                        <span className={`text-xs ${morningRarity.color}`}>
                                                            {morningRarity.label}
                                                        </span>
                                                    )}
                                                    {spark.morningTone && (
                                                        <span className="text-xs text-base-content/40 capitalize">
                                                            {spark.morningTone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(spark.morning, `morning-${spark.date}`)}
                                                className="btn btn-ghost btn-xs"
                                                title="Copy"
                                            >
                                                {copiedId === `morning-${spark.date}` ? (
                                                    <Check className="w-3 h-3 text-success" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Night Spark */}
                                        <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                                            <span className="text-lg">🌙</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-base-content">{spark.night}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {userTier >= TIER.LEGEND && spark.nightRarity && spark.nightRarity !== 'common' && (
                                                        <span className={`text-xs ${nightRarity.color}`}>
                                                            {nightRarity.label}
                                                        </span>
                                                    )}
                                                    {spark.nightTone && (
                                                        <span className="text-xs text-base-content/40 capitalize">
                                                            {spark.nightTone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(spark.night, `night-${spark.date}`)}
                                                className="btn btn-ghost btn-xs"
                                                title="Copy"
                                            >
                                                {copiedId === `night-${spark.date}` ? (
                                                    <Check className="w-3 h-3 text-success" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reply Suggestions for Today's Spark (Legend only) */}
                                    {isToday && userTier >= TIER.LEGEND && (
                                        <div className="mt-4 pt-4 border-t border-base-content/10">
                                            <ReplySuggestions
                                                sparkContent={spark.morning}
                                                tone={spark.morningTone as EmotionalTone}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Load More for Legend */}
            {userTier >= TIER.LEGEND && filteredSparks.length >= 90 && (
                <div className="text-center py-4">
                    <p className="text-sm text-base-content/50">
                        Showing last 90 days. Use search to find older sparks.
                    </p>
                </div>
            )}

            {/* Photo Memory Card Modal */}
            <PhotoMemoryCard
                isOpen={showPhotoCard}
                onClose={() => setShowPhotoCard(false)}
                sparkContent={selectedSparkForPhoto}
                partnerName={user?.partner_name}
            />
        </div>
    );
}
