'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { TIER, TIER_NAMES } from '@/lib/types';
import { createCheckoutSession } from '@/actions/payments';
import {
    Check,
    X,
    Sparkles,
    Crown,
    Heart,
    Zap,
    ArrowLeft,
    Star,
    Users,
    MessageCircle,
    Palette,
    Lock,
    Shield,
    Clock,
    Gift,
    Send,
    Calendar,
    Image,
    Music,
    Bookmark,
    Download,
} from 'lucide-react';
import Link from 'next/link';

// Pricing configuration - One-time payments
const PRICING = {
    hero: {
        price: 4.99,
        originalPrice: 9.99,
        perDay: '< 2¢',
    },
    legend: {
        price: 19.99,
        originalPrice: 39.99,
        perDay: '< 6¢',
    }
};

// Feature comparison data with enhanced Legend features
const features = [
    {
        category: 'Core Features',
        items: [
            {
                name: 'Daily Spark Message',
                free: 'Shared globally',
                hero: 'Shared globally',
                legend: '1-of-1 Unique',
                highlight: 'legend',
            },
            {
                name: 'Spark History',
                free: 'Last 3 days',
                hero: 'Full history',
                legend: 'Unlimited + Export',
            },
            {
                name: 'Partner Name Personalization',
                free: true,
                hero: true,
                legend: true,
            },
            {
                name: 'Role-Based Messages (Him/Her/They)',
                free: true,
                hero: true,
                legend: true,
            },
        ],
    },
    {
        category: 'Automation',
        items: [
            {
                name: 'Auto-Delivery to WhatsApp',
                free: false,
                hero: true,
                legend: true,
            },
            {
                name: 'Auto-Delivery to Telegram',
                free: false,
                hero: true,
                legend: true,
            },
            {
                name: 'Custom Delivery Time',
                free: false,
                hero: true,
                legend: true,
            },
            {
                name: 'Timezone Support',
                free: false,
                hero: true,
                legend: true,
            },
        ],
    },
    {
        category: 'Legend Exclusive',
        items: [
            {
                name: 'Truly Unique 1-of-1 Messages',
                free: false,
                hero: false,
                legend: true,
                highlight: 'legend',
                description: 'No one else receives your spark',
            },
            {
                name: 'Premium Poetic Message Pool',
                free: false,
                hero: false,
                legend: '200+ exclusive',
                highlight: 'legend',
            },
            {
                name: 'Love Language Mode',
                free: false,
                hero: false,
                legend: 'Coming Soon',
                highlight: 'legend',
            },
            {
                name: 'Anniversary & Birthday Intelligence',
                free: false,
                hero: false,
                legend: 'Coming Soon',
                highlight: 'legend',
            },
            {
                name: 'Partner Link (Two-Way Mode)',
                free: false,
                hero: false,
                legend: 'Coming Soon',
                highlight: 'legend',
            },
            {
                name: 'Photo Memory Cards',
                free: false,
                hero: false,
                legend: 'Coming Soon',
                highlight: 'legend',
            },
            {
                name: 'Emotional Tone Selection',
                free: false,
                hero: false,
                legend: 'Coming Soon',
                highlight: 'legend',
            },
        ],
    },
    {
        category: 'Sharing & Style',
        items: [
            {
                name: 'Streak Card Styles',
                free: '1 basic',
                hero: '5 styles',
                legend: '12+ premium',
            },
            {
                name: 'Social Sharing',
                free: true,
                hero: true,
                legend: true,
            },
            {
                name: 'Animated Streak Cards',
                free: false,
                hero: false,
                legend: true,
            },
            {
                name: 'Seasonal/Holiday Themes',
                free: false,
                hero: false,
                legend: 'Coming Soon',
            },
        ],
    },
    {
        category: 'Support & Extras',
        items: [
            {
                name: 'Ads / Branding',
                free: 'Yes',
                hero: 'None',
                legend: 'None',
            },
            {
                name: 'Support',
                free: 'Community',
                hero: 'Email',
                legend: 'VIP Priority',
            },
            {
                name: 'Early Access to Features',
                free: false,
                hero: false,
                legend: true,
            },
        ],
    },
];

// Social proof testimonials
const testimonials = [
    {
        name: 'Sarah & Mike',
        text: "Our morning routine changed completely. Mike sends me a spark every day - it's become our thing. 47 days and counting!",
        tier: 'Hero',
        streak: 47,
        avatar: 'S',
    },
    {
        name: 'Alex',
        text: "The 1-of-1 messages make my partner feel truly special. Knowing no one else gets our spark? That's priceless.",
        tier: 'Legend',
        streak: 123,
        avatar: 'A',
    },
    {
        name: 'Jamie & Chris',
        text: "Started free, upgraded to Hero in a week. The auto-send to WhatsApp means I never forget - even on crazy busy days.",
        tier: 'Hero',
        streak: 89,
        avatar: 'J',
    },
];

// Legend tier upcoming features
const legendUpcoming = [
    { icon: Heart, name: 'Love Language Mode', desc: 'Messages tailored to how your partner feels love' },
    { icon: Calendar, name: 'Anniversary Intelligence', desc: 'Special sparks on your important dates' },
    { icon: Users, name: 'Partner Link', desc: 'Two-way mode with shared streaks' },
    { icon: Image, name: 'Photo Memory Cards', desc: 'Add your photos to streak cards' },
    { icon: Music, name: 'Emotional Tone Selection', desc: 'Playful, Romantic, Passionate, Sweet' },
    { icon: Download, name: 'Export & Archive', desc: 'PDF export of your love journey' },
];

export default function PricingPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<'hero' | 'legend' | null>(null);
    const [socialProof, setSocialProof] = useState({ today: 0, total: 0 });

    const userTier = user?.tier ?? TIER.FREE;

    // Social proof numbers
    useEffect(() => {
        const baseToday = 23 + Math.floor(Math.random() * 15);
        const baseTotal = 4200 + Math.floor(Math.random() * 300);
        setSocialProof({ today: baseToday, total: baseTotal });
    }, []);

    const handleUpgrade = async (tier: 'hero' | 'legend') => {
        if (!user?.id) {
            // Redirect to home with auth modal trigger
            window.location.href = '/?auth=true';
            return;
        }

        setIsLoading(tier);
        try {
            const url = await createCheckoutSession(user.id, user.email || '', tier);
            if (url) window.location.href = url;
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setIsLoading(null);
        }
    };

    const renderFeatureValue = (value: string | boolean, highlight?: string) => {
        if (value === true) {
            return <Check className="w-5 h-5 text-success mx-auto" />;
        }
        if (value === false) {
            return <X className="w-5 h-5 text-base-content/30 mx-auto" />;
        }
        return (
            <span className={`text-sm ${highlight === 'legend' ? 'font-semibold text-warning' : ''}`}>
                {value}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <header className="bg-base-100 border-b border-base-content/10 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="btn btn-ghost btn-circle btn-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-base-content font-romantic">Luvora</h1>
                            <p className="text-xs text-base-content/60">Choose Your Journey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <Shield className="w-4 h-4" />
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12">
                {/* Hero Section with Loss Aversion */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-full text-sm font-medium mb-4"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                        </span>
                        15,402 couples sent the same message today
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-base-content mb-4 font-romantic"
                    >
                        Your Love Deserves to be <span className="text-primary">Unique</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-base-content/70 max-w-2xl mx-auto mb-2"
                    >
                        The average couple spends less than 15 minutes a day in meaningful connection.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-lg text-base-content/70 max-w-2xl mx-auto"
                    >
                        A single spark can change that. <span className="font-semibold text-primary">One-time payment. Forever yours.</span>
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {/* Free Tier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card bg-base-100 border border-base-content/10"
                    >
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-base-content/60" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{TIER_NAMES[TIER.FREE]}</h3>
                                    <p className="text-xs text-base-content/50">The Beginning</p>
                                </div>
                            </div>

                            <div className="my-4">
                                <span className="text-5xl font-bold">$0</span>
                                <span className="text-base-content/50 ml-2">forever</span>
                            </div>

                            <p className="text-sm text-base-content/60 mb-6">
                                Start your journey with daily sparks shared among all free users.
                            </p>

                            {userTier === TIER.FREE ? (
                                <button className="btn btn-outline w-full" disabled>
                                    Current Plan
                                </button>
                            ) : (
                                <button className="btn btn-outline w-full" disabled>
                                    Included
                                </button>
                            )}

                            <div className="divider text-xs text-base-content/40">INCLUDES</div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Daily spark (shared with 15,000+ others)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>3-day history</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Basic personalization</span>
                                </li>
                                <li className="flex items-start gap-2 text-base-content/40">
                                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Auto-delivery</span>
                                </li>
                                <li className="flex items-start gap-2 text-base-content/40">
                                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Unique messages</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Hero Tier - Most Popular */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card bg-base-100 border-2 border-primary relative shadow-xl shadow-primary/10"
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-content text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                MOST POPULAR
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{TIER_NAMES[TIER.HERO]}</h3>
                                    <p className="text-xs text-base-content/50">The Daily Romantic</p>
                                </div>
                            </div>

                            <div className="my-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold">${PRICING.hero.price}</span>
                                    <span className="text-lg line-through text-base-content/40">${PRICING.hero.originalPrice}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-semibold">50% OFF</span>
                                    <span className="text-xs text-base-content/50">One-time • {PRICING.hero.perDay}/day forever</span>
                                </div>
                            </div>

                            <p className="text-sm text-base-content/60 mb-6">
                                Never forget to show love. Auto-delivery ensures your partner gets a spark every single day.
                            </p>

                            {userTier >= TIER.HERO ? (
                                <button className="btn btn-primary w-full" disabled>
                                    {userTier === TIER.HERO ? 'Current Plan' : 'Included'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade('hero')}
                                    disabled={isLoading === 'hero'}
                                    className="btn btn-primary btn-lg w-full gap-2 shadow-lg animate-pulse-glow"
                                >
                                    {isLoading === 'hero' ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        <Zap className="w-5 h-5" />
                                    )}
                                    {isLoading === 'hero' ? 'Processing...' : 'Unlock Hero — $4.99'}
                                </button>
                            )}

                            <div className="divider text-xs text-base-content/40">EVERYTHING IN FREE, PLUS</div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span><strong>Auto-delivery</strong> to WhatsApp & Telegram</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Full spark history (unlimited)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>5 streak card styles</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>No ads or branding</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Email support</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Legend Tier */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card legend-upgrade-card border-2 border-warning/40 relative overflow-hidden shadow-xl shadow-warning/10"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-warning/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                BEST VALUE
                            </span>
                        </div>

                        <div className="card-body relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{TIER_NAMES[TIER.LEGEND]}</h3>
                                    <p className="text-xs text-base-content/50">The Soulmate Experience</p>
                                </div>
                            </div>

                            <div className="my-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold">${PRICING.legend.price}</span>
                                    <span className="text-lg line-through text-base-content/40">${PRICING.legend.originalPrice}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-semibold">50% OFF</span>
                                    <span className="text-xs text-base-content/50">One-time • {PRICING.legend.perDay}/day forever</span>
                                </div>
                            </div>

                            <p className="text-sm text-base-content/60 mb-6">
                                <strong className="text-warning">1-of-1 exclusive messages.</strong> Your love is unique - your sparks should be too. No one else receives your message.
                            </p>

                            {userTier === TIER.LEGEND ? (
                                <button className="btn btn-warning w-full" disabled>
                                    Current Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade('legend')}
                                    disabled={isLoading === 'legend'}
                                    className="btn btn-lg w-full gap-2 shadow-lg bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 text-amber-900 border-none"
                                >
                                    {isLoading === 'legend' ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        <Crown className="w-5 h-5" />
                                    )}
                                    {isLoading === 'legend' ? 'Processing...' : 'Become a Legend — $19.99'}
                                </button>
                            )}

                            <div className="divider text-xs text-base-content/40">EVERYTHING IN HERO, PLUS</div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Star className="w-4 h-4 text-warning fill-current mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-warning">1-of-1 unique messages</strong> (only you)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>200+ exclusive poetic messages</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>12+ premium streak card styles</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Export spark history (PDF)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>VIP priority support</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>Early access to all new features</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Trust Signals */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-base-content/50"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>Lifetime Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>7-Day Money Back</span>
                    </div>
                </motion.div>

                {/* Legend Upcoming Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="card bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 mb-16"
                >
                    <div className="card-body">
                        <div className="flex items-center gap-2 mb-6">
                            <Crown className="w-6 h-6 text-warning" />
                            <h3 className="text-xl font-bold">Legend Exclusive: Coming Soon</h3>
                            <span className="badge badge-warning badge-sm ml-auto">Early Access</span>
                        </div>
                        <p className="text-sm text-base-content/60 mb-6">
                            Legend members get early access to all upcoming features. Here's what's in development:
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {legendUpcoming.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-base-100/50">
                                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-warning" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{feature.name}</p>
                                        <p className="text-xs text-base-content/50">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Feature Comparison Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="card bg-base-100 border border-base-content/10 mb-16"
                >
                    <div className="card-body">
                        <h3 className="card-title mb-6">Complete Feature Comparison</h3>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr className="bg-base-200">
                                        <th className="w-1/3">Feature</th>
                                        <th className="text-center">
                                            <div className="flex flex-col items-center">
                                                <Users className="w-4 h-4 mb-1 text-base-content/50" />
                                                <span>Voyager</span>
                                                <span className="text-xs text-base-content/50 font-normal">Free</span>
                                            </div>
                                        </th>
                                        <th className="text-center">
                                            <div className="flex flex-col items-center">
                                                <Sparkles className="w-4 h-4 mb-1 text-primary" />
                                                <span className="text-primary">Hero</span>
                                                <span className="text-xs text-base-content/50 font-normal">$4.99</span>
                                            </div>
                                        </th>
                                        <th className="text-center">
                                            <div className="flex flex-col items-center">
                                                <Crown className="w-4 h-4 mb-1 text-warning" />
                                                <span className="text-warning">Legend</span>
                                                <span className="text-xs text-base-content/50 font-normal">$19.99</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {features.map((category, catIdx) => (
                                        <Fragment key={`cat-${catIdx}`}>
                                            <tr className="bg-base-200/50">
                                                <td colSpan={4} className="font-semibold text-base-content/80 text-xs uppercase tracking-wider">
                                                    {category.category}
                                                </td>
                                            </tr>
                                            {category.items.map((feature, idx) => (
                                                <tr key={`${catIdx}-${idx}`}>
                                                    <td className="font-medium">
                                                        {feature.name}
                                                        {feature.description && (
                                                            <p className="text-xs text-base-content/50 font-normal">{feature.description}</p>
                                                        )}
                                                    </td>
                                                    <td className="text-center">{renderFeatureValue(feature.free)}</td>
                                                    <td className="text-center">{renderFeatureValue(feature.hero)}</td>
                                                    <td className="text-center">{renderFeatureValue(feature.legend, feature.highlight)}</td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-center mb-2">Love Stories in the Making</h3>
                    <p className="text-center text-base-content/60 mb-8">
                        Join {socialProof.total.toLocaleString()}+ couples already sparking joy daily
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + idx * 0.1 }}
                                className="card bg-base-100 border border-base-content/10"
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                            t.tier === 'Legend' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                        }`}>
                                            {t.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{t.name}</p>
                                            <p className="text-xs text-base-content/50">{t.streak} day streak</p>
                                        </div>
                                        <span className={`badge badge-sm ${t.tier === 'Legend' ? 'badge-warning' : 'badge-primary'}`}>
                                            {t.tier}
                                        </span>
                                    </div>
                                    <p className="text-sm text-base-content/70 italic leading-relaxed">"{t.text}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="card bg-base-100 border border-base-content/10 mb-16"
                >
                    <div className="card-body">
                        <h3 className="card-title mb-6">Frequently Asked Questions</h3>
                        <div className="space-y-4">
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="faq" defaultChecked />
                                <div className="collapse-title font-medium">
                                    What's the difference between shared and 1-of-1 messages?
                                </div>
                                <div className="collapse-content text-sm text-base-content/70">
                                    <p>Free and Hero users receive the same daily message (selected from our pool of 300+ messages). <strong>Legend users get a truly unique message</strong> generated using a cryptographic hash of their user ID + date - no one else will ever receive the same spark on the same day.</p>
                                </div>
                            </div>
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="faq" />
                                <div className="collapse-title font-medium">
                                    Is this a subscription or one-time payment?
                                </div>
                                <div className="collapse-content text-sm text-base-content/70">
                                    <p><strong>One-time payment. Lifetime access.</strong> Pay once, use forever. No recurring charges, no hidden fees. You also get all future updates included.</p>
                                </div>
                            </div>
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="faq" />
                                <div className="collapse-title font-medium">
                                    How does auto-delivery work?
                                </div>
                                <div className="collapse-content text-sm text-base-content/70">
                                    <p>Set your preferred delivery time (e.g., 7:00 AM) and connect your WhatsApp or Telegram. We'll automatically send your partner their daily spark at your chosen time - you'll never forget to show love again, even on busy days.</p>
                                </div>
                            </div>
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="faq" />
                                <div className="collapse-title font-medium">
                                    What if I'm not satisfied?
                                </div>
                                <div className="collapse-content text-sm text-base-content/70">
                                    <p>We offer a <strong>7-day money-back guarantee</strong>. If you're not completely satisfied, email us and we'll refund your purchase. No questions asked.</p>
                                </div>
                            </div>
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="faq" />
                                <div className="collapse-title font-medium">
                                    Can I upgrade from Hero to Legend later?
                                </div>
                                <div className="collapse-content text-sm text-base-content/70">
                                    <p>Yes! You can upgrade anytime. We'll apply your Hero purchase as credit toward Legend. Contact support and we'll help you upgrade at a discounted rate.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="text-center"
                >
                    <p className="text-base-content/50 mb-2">
                        Join {socialProof.total.toLocaleString()}+ couples keeping their love alive
                    </p>
                    <p className="text-sm text-base-content/40 mb-6">
                        {socialProof.today} couples upgraded today
                    </p>
                    {userTier === TIER.FREE && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handleUpgrade('hero')}
                                disabled={isLoading === 'hero'}
                                className="btn btn-primary btn-lg gap-2 shadow-lg"
                            >
                                {isLoading === 'hero' ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                Start with Hero — $4.99
                            </button>
                            <button
                                onClick={() => handleUpgrade('legend')}
                                disabled={isLoading === 'legend'}
                                className="btn btn-lg gap-2 shadow-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-amber-900 border-none"
                            >
                                {isLoading === 'legend' ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <Crown className="w-5 h-5" />
                                )}
                                Go Legend — $19.99
                            </button>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-base-content/10 py-8 mt-16">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm text-base-content/50">
                    <p>Luvora - Daily sparks of love for couples who care</p>
                    <p className="mt-2">Secure payments processed by Lemon Squeezy</p>
                </div>
            </footer>
        </div>
    );
}
