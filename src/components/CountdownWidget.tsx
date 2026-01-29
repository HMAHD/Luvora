'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Cake, Calendar, Sparkles, Gift } from 'lucide-react';
import { getDaysUntilOccasion } from '@/lib/algo';

interface CountdownWidgetProps {
    anniversaryDate?: string;
    partnerBirthday?: string;
    relationshipStart?: string;
    partnerName?: string;
}

type OccasionType = 'anniversary' | 'birthday' | 'together';

interface Occasion {
    type: OccasionType;
    label: string;
    date: string;
    daysUntil: number;
    icon: React.ReactNode;
    color: string;
    gradient: string;
}

export function CountdownWidget({
    anniversaryDate,
    partnerBirthday,
    relationshipStart,
    partnerName = 'Partner',
}: CountdownWidgetProps) {
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [daysTogether, setDaysTogether] = useState<number | null>(null);

    useEffect(() => {
        const now = new Date();
        const newOccasions: Occasion[] = [];

        if (anniversaryDate) {
            const days = getDaysUntilOccasion(anniversaryDate, now);
            newOccasions.push({
                type: 'anniversary',
                label: 'Anniversary',
                date: anniversaryDate,
                daysUntil: days,
                icon: <Heart className="w-5 h-5" />,
                color: 'text-pink-400',
                gradient: 'from-pink-500/20 to-rose-500/20',
            });
        }

        if (partnerBirthday) {
            const days = getDaysUntilOccasion(partnerBirthday, now);
            newOccasions.push({
                type: 'birthday',
                label: `${partnerName}'s Birthday`,
                date: partnerBirthday,
                daysUntil: days,
                icon: <Cake className="w-5 h-5" />,
                color: 'text-amber-400',
                gradient: 'from-amber-500/20 to-orange-500/20',
            });
        }

        // Calculate days together
        if (relationshipStart) {
            const start = new Date(relationshipStart);
            const diffTime = now.getTime() - start.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0) {
                setDaysTogether(diffDays);
            }
        }

        // Sort by days until (ascending)
        newOccasions.sort((a, b) => a.daysUntil - b.daysUntil);
        setOccasions(newOccasions);
    }, [anniversaryDate, partnerBirthday, relationshipStart, partnerName]);

    if (occasions.length === 0 && daysTogether === null) {
        return null;
    }

    const upcomingOccasion = occasions[0];
    const isToday = upcomingOccasion?.daysUntil === 0;
    const isSoon = upcomingOccasion?.daysUntil <= 7;

    return (
        <div className="space-y-4">
            {/* Days Together Banner */}
            {daysTogether !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-4 border border-primary/20"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-base-content/60">Together for</p>
                                <p className="text-lg font-bold text-base-content">
                                    {daysTogether.toLocaleString()} days
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-base-content/60">That's</p>
                            <p className="text-sm font-medium text-primary">
                                {Math.floor(daysTogether / 365)} years, {daysTogether % 365} days
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Upcoming Occasions */}
            {occasions.length > 0 && (
                <div className="space-y-3">
                    {occasions.map((occasion, index) => (
                        <motion.div
                            key={occasion.type}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative overflow-hidden rounded-2xl p-4 border ${
                                occasion.daysUntil === 0
                                    ? 'border-primary shadow-lg shadow-primary/20'
                                    : 'border-base-content/10'
                            }`}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${occasion.gradient}`} />

                            {/* Special Today Animation */}
                            {occasion.daysUntil === 0 && (
                                <div className="absolute inset-0 overflow-hidden">
                                    <motion.div
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
                                    />
                                </div>
                            )}

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-base-100/50 flex items-center justify-center ${occasion.color}`}>
                                        {occasion.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-base-content">{occasion.label}</p>
                                        <p className="text-xs text-base-content/60">
                                            {new Date(occasion.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {occasion.daysUntil === 0 ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="flex items-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            <span className="text-lg font-bold text-primary">Today!</span>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-base-content">
                                                {occasion.daysUntil}
                                            </p>
                                            <p className="text-xs text-base-content/60">days away</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Gift Reminder for Soon */}
                            {occasion.daysUntil > 0 && occasion.daysUntil <= 7 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="relative mt-3 pt-3 border-t border-base-content/10"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <Gift className="w-3 h-3 text-primary" />
                                        <span className="text-base-content/70">
                                            {occasion.type === 'birthday'
                                                ? "Time to plan something special!"
                                                : "Celebrate your love story!"}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Mini version for dashboard sidebar
export function CountdownWidgetMini({
    anniversaryDate,
    partnerBirthday,
}: {
    anniversaryDate?: string;
    partnerBirthday?: string;
}) {
    const [nextOccasion, setNextOccasion] = useState<{ type: string; days: number } | null>(null);

    useEffect(() => {
        const now = new Date();
        const occasions: { type: string; days: number }[] = [];

        if (anniversaryDate) {
            const days = getDaysUntilOccasion(anniversaryDate, now);
            occasions.push({ type: 'anniversary', days });
        }

        if (partnerBirthday) {
            const days = getDaysUntilOccasion(partnerBirthday, now);
            occasions.push({ type: 'birthday', days });
        }

        // Find closest occasion
        const closest = occasions.length > 0
            ? occasions.reduce((min, curr) => curr.days < min.days ? curr : min)
            : null;

        setNextOccasion(closest);
    }, [anniversaryDate, partnerBirthday]);

    if (!nextOccasion) return null;

    const isToday = nextOccasion.days === 0;
    const isSoon = nextOccasion.days <= 7;

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isToday
                    ? 'bg-primary/20 text-primary animate-pulse'
                    : isSoon
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-base-200 text-base-content/60'
            }`}
        >
            {nextOccasion.type === 'anniversary' ? (
                <Heart className="w-3 h-3" />
            ) : (
                <Cake className="w-3 h-3" />
            )}
            {isToday ? (
                <span>Today!</span>
            ) : (
                <span>
                    {nextOccasion.days}d until {nextOccasion.type === 'anniversary' ? 'anniversary' : 'birthday'}
                </span>
            )}
        </div>
    );
}
