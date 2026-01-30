'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { SEO_CATEGORIES } from '@/lib/seo-categories';
import {
    Sun,
    Moon,
    Heart,
    Sparkles,
    ArrowLeft,
    Search,
    X,
    ArrowRight,
    MessageCircle,
    Users
} from 'lucide-react';

export const dynamic = 'force-static';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Group categories by type
function groupCategories() {
    const morningHer = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'feminine');
    const morningHim = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'masculine');
    const morningNeutral = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'neutral');
    const nightHer = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'feminine');
    const nightHim = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'masculine');
    const nightNeutral = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'neutral');
    const general = SEO_CATEGORIES.filter(c => c.timeOfDay === 'both');

    return { morningHer, morningHim, morningNeutral, nightHer, nightHim, nightNeutral, general };
}

const sectionConfig = {
    morningHer: {
        title: 'Morning Messages for Her',
        icon: Sun,
        gradient: 'from-amber-500/10 to-rose-500/10',
        iconColor: 'text-amber-500',
        borderColor: 'border-amber-200/50'
    },
    morningHim: {
        title: 'Morning Messages for Him',
        icon: Sun,
        gradient: 'from-amber-500/10 to-orange-500/10',
        iconColor: 'text-amber-500',
        borderColor: 'border-amber-200/50'
    },
    morningNeutral: {
        title: 'Morning Messages',
        icon: Sun,
        gradient: 'from-yellow-500/10 to-amber-500/10',
        iconColor: 'text-yellow-500',
        borderColor: 'border-yellow-200/50'
    },
    nightHer: {
        title: 'Goodnight Messages for Her',
        icon: Moon,
        gradient: 'from-indigo-500/10 to-purple-500/10',
        iconColor: 'text-indigo-400',
        borderColor: 'border-indigo-200/50'
    },
    nightHim: {
        title: 'Goodnight Messages for Him',
        icon: Moon,
        gradient: 'from-violet-500/10 to-indigo-500/10',
        iconColor: 'text-violet-400',
        borderColor: 'border-violet-200/50'
    },
    nightNeutral: {
        title: 'Goodnight Messages',
        icon: Moon,
        gradient: 'from-blue-500/10 to-indigo-500/10',
        iconColor: 'text-blue-400',
        borderColor: 'border-blue-200/50'
    },
    general: {
        title: 'General Love Messages',
        icon: Heart,
        gradient: 'from-rose-500/10 to-pink-500/10',
        iconColor: 'text-rose-500',
        borderColor: 'border-rose-200/50'
    },
};

function CategoryCard({ category }: { category: typeof SEO_CATEGORIES[0] }) {
    return (
        <motion.div variants={itemVariants}>
            <Link
                href={`/sparks/${category.slug}`}
                className="group block h-full"
            >
                <div className="h-full bg-base-100 border border-base-content/5 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
                    {/* Icon & Count */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs text-base-content/40 bg-base-200 px-2 py-1 rounded-full">
                            10+ messages
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors duration-200 mb-2 line-clamp-2">
                        {category.h1}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-base-content/50 line-clamp-2 mb-4">
                        {category.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-base-content/5">
                        <span className="text-xs text-base-content/30">
                            Free to browse
                        </span>
                        <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1">
                            View <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function CategorySection({
    sectionKey,
    categories,
    searchQuery
}: {
    sectionKey: keyof typeof sectionConfig;
    categories: typeof SEO_CATEGORIES;
    searchQuery: string;
}) {
    const config = sectionConfig[sectionKey];
    const Icon = config.icon;

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter(cat =>
            cat.h1.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    if (filteredCategories.length === 0) return null;

    return (
        <section className="mb-14">
            {/* Section Header */}
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-base-content/5`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-base-content">
                        {config.title}
                    </h2>
                    <p className="text-sm text-base-content/50">
                        {filteredCategories.length} categories
                    </p>
                </div>
            </div>

            {/* Category Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
                {filteredCategories.map((cat) => (
                    <CategoryCard key={cat.slug} category={cat} />
                ))}
            </motion.div>
        </section>
    );
}

export default function SparksIndexPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const groups = groupCategories();

    // JSON-LD for the index page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Love Message Categories',
        description: 'Browse romantic messages for every occasion',
        url: 'https://luvora.love/sparks',
        publisher: {
            '@type': 'Organization',
            name: 'Luvora',
        },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: SEO_CATEGORIES.map((cat, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: cat.h1,
                url: `https://luvora.love/sparks/${cat.slug}`,
            })),
        },
    };

    // Total categories count
    const totalCategories = SEO_CATEGORIES.length;

    // Check if any results match the search
    const hasResults = useMemo(() => {
        if (!searchQuery) return true;
        return SEO_CATEGORIES.some(cat =>
            cat.h1.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-200/50 to-base-200">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <Link href="/" className="text-xl font-bold text-base-content font-romantic hover:text-primary transition-colors">
                                        Luvora
                                    </Link>
                                    <p className="text-xs text-base-content/50">Message Archive</p>
                                </div>
                            </div>

                            <Link href="/" className="btn btn-primary btn-sm gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Get Daily Sparks
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden py-16 md:py-20 px-4">
                    {/* Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-60" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none opacity-60" />

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-base-100 border border-base-content/10 px-4 py-2 rounded-full text-sm mb-6 shadow-sm"
                        >
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-primary" />
                                <span className="text-base-content font-medium">{totalCategories}+ Categories</span>
                            </div>
                            <span className="text-base-content/30">•</span>
                            <span className="text-base-content/60">Curated with love</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold font-romantic text-base-content mb-6 leading-tight"
                        >
                            Find the Perfect
                            <br />
                            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                Words for Love
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto mb-10 leading-relaxed"
                        >
                            Browse our curated collection of romantic messages for every moment.
                            From sweet good mornings to tender goodnights.
                        </motion.p>

                        {/* Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input input-lg w-full pl-12 pr-12 bg-base-100 border-base-content/10 focus:border-primary/50 shadow-lg"
                                />
                                <AnimatePresence>
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Categories */}
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    {!hasResults ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <Heart className="w-12 h-12 text-base-content/20 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-base-content/60 mb-2">
                                No categories found
                            </h3>
                            <p className="text-base-content/40 mb-6">
                                Try a different search term
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="btn btn-primary btn-sm"
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <CategorySection sectionKey="morningHer" categories={groups.morningHer} searchQuery={searchQuery} />
                            <CategorySection sectionKey="morningHim" categories={groups.morningHim} searchQuery={searchQuery} />
                            <CategorySection sectionKey="morningNeutral" categories={groups.morningNeutral} searchQuery={searchQuery} />
                            <CategorySection sectionKey="nightHer" categories={groups.nightHer} searchQuery={searchQuery} />
                            <CategorySection sectionKey="nightHim" categories={groups.nightHim} searchQuery={searchQuery} />
                            <CategorySection sectionKey="nightNeutral" categories={groups.nightNeutral} searchQuery={searchQuery} />
                            <CategorySection sectionKey="general" categories={groups.general} searchQuery={searchQuery} />
                        </>
                    )}
                </div>

                {/* CTA Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="py-16 px-4"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 md:p-12 text-center">
                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                            <div className="relative">
                                {/* Stats */}
                                <div className="flex flex-wrap justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl font-bold text-primary-content">
                                            {totalCategories}+
                                        </div>
                                        <div className="text-primary-content/70 text-sm">Categories</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl font-bold text-primary-content">
                                            500+
                                        </div>
                                        <div className="text-primary-content/70 text-sm">Messages</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl font-bold text-primary-content">
                                            Daily
                                        </div>
                                        <div className="text-primary-content/70 text-sm">Delivery</div>
                                    </div>
                                </div>

                                <Heart className="w-12 h-12 text-primary-content/80 mx-auto mb-4" />
                                <h3 className="text-2xl md:text-3xl font-bold text-primary-content mb-4 font-romantic">
                                    Never Run Out of Words
                                </h3>
                                <p className="text-primary-content/80 mb-8 max-w-lg mx-auto">
                                    Get a fresh, personalized romantic message delivered to your partner every day.
                                    Start your free spark streak today!
                                </p>
                                <Link
                                    href="/"
                                    className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none shadow-lg"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Try Luvora Free
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="border-t border-base-content/5 py-8">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-base-content/50">
                            <p className="font-romantic text-base-content/60">
                                Luvora — Daily sparks of love
                            </p>
                            <div className="flex gap-6">
                                <Link href="/" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                                <Link href="/blog" className="hover:text-primary transition-colors">
                                    Blog
                                </Link>
                                <Link href="/pricing" className="hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    Privacy
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
