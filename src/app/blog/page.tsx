'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { BLOG_ARTICLES, type BlogArticle } from '@/lib/blog-data';
import {
    ArrowLeft,
    Clock,
    Calendar,
    ArrowRight,
    Heart,
    MessageCircle,
    Sparkles,
    BookOpen,
    Search,
    X,
} from 'lucide-react';

const categoryConfig = {
    relationships: {
        color: 'bg-rose-500/10 text-rose-600 border-rose-200',
        icon: Heart,
        label: 'Relationships',
    },
    communication: {
        color: 'bg-violet-500/10 text-violet-600 border-violet-200',
        icon: MessageCircle,
        label: 'Communication',
    },
    tips: {
        color: 'bg-amber-500/10 text-amber-600 border-amber-200',
        icon: Sparkles,
        label: 'Tips & Ideas',
    },
    'love-languages': {
        color: 'bg-pink-500/10 text-pink-600 border-pink-200',
        icon: BookOpen,
        label: 'Love Languages',
    },
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
    const config = categoryConfig[article.category];
    const Icon = config.icon;

    if (featured) {
        return (
            <motion.div variants={itemVariants}>
                <Link href={`/blog/${article.slug}`} className="group block">
                    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 border border-base-content/5 p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="badge badge-primary badge-lg gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Featured
                                </span>
                                <span className={`badge ${config.color} border gap-1.5`}>
                                    <Icon className="w-3 h-3" />
                                    {config.label}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold text-base-content mb-4 leading-tight group-hover:text-primary transition-colors duration-300 font-romantic">
                                {article.title}
                            </h2>

                            <p className="text-base-content/70 text-lg leading-relaxed mb-6 max-w-2xl">
                                {article.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-sm text-base-content/50">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {article.readingTime} min read
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>

                                <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                                    Read Article
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </article>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div variants={itemVariants}>
            <Link href={`/blog/${article.slug}`} className="group block h-full">
                <article className="h-full bg-base-100 rounded-2xl border border-base-content/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-base-content/5 hover:-translate-y-1 hover:border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`badge ${config.color} border badge-sm gap-1`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-base-content mb-3 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="text-base-content/60 text-sm leading-relaxed mb-4 line-clamp-2">
                        {article.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-base-content/5">
                        <div className="flex items-center gap-3 text-xs text-base-content/40">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readingTime} min
                            </span>
                        </div>

                        <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                            Read <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredArticles = useMemo(() => {
        return BLOG_ARTICLES.filter((article) => {
            const matchesSearch =
                !searchQuery ||
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = !selectedCategory || article.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const featuredArticle = filteredArticles[0];
    const otherArticles = filteredArticles.slice(1);

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-200/50 to-base-200">
            {/* Elegant Header */}
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
                                <p className="text-xs text-base-content/50">Love & Relationship Blog</p>
                            </div>
                        </div>

                        <Link href="/" className="btn btn-primary btn-sm gap-2">
                            <Heart className="w-3.5 h-3.5" />
                            Get Daily Sparks
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" />
                        Relationship Wisdom
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-6 font-romantic leading-tight">
                        Nurture Your Love,
                        <br />
                        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Strengthen Your Bond
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto leading-relaxed">
                        Expert insights and heartfelt advice to help couples build deeper connections
                        and keep the romance alive.
                    </p>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered w-full pl-11 pr-10 bg-base-100 border-base-content/10 focus:border-primary/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`btn btn-sm ${
                                    !selectedCategory ? 'btn-primary' : 'btn-ghost'
                                }`}
                            >
                                All
                            </button>
                            {Object.entries(categoryConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                        className={`btn btn-sm gap-1.5 ${
                                            selectedCategory === key ? 'btn-primary' : 'btn-ghost'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Articles */}
                {filteredArticles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Heart className="w-12 h-12 text-base-content/20 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-base-content/60 mb-2">
                            No articles found
                        </h3>
                        <p className="text-base-content/40">
                            Try adjusting your search or filter
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Featured Article */}
                        {featuredArticle && (
                            <div className="mb-12">
                                <ArticleCard article={featuredArticle} featured />
                            </div>
                        )}

                        {/* Article Grid */}
                        {otherArticles.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {otherArticles.map((article) => (
                                    <ArticleCard key={article.slug} article={article} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Newsletter CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 md:p-12 text-center">
                        {/* Decorative */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                        <div className="relative">
                            <Heart className="w-12 h-12 text-primary-content/80 mx-auto mb-4" />
                            <h3 className="text-2xl md:text-3xl font-bold text-primary-content mb-4 font-romantic">
                                Ready to Spark More Love?
                            </h3>
                            <p className="text-primary-content/80 mb-6 max-w-lg mx-auto">
                                Get a personalized romantic message delivered to your partner every day.
                                Start your free streak today!
                            </p>
                            <Link
                                href="/"
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none shadow-lg"
                            >
                                <Sparkles className="w-5 h-5" />
                                Start Free
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-base-content/5 py-8 mt-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-base-content/50">
                        <p className="font-romantic text-base-content/60">
                            Luvora — Daily sparks of love
                        </p>
                        <div className="flex gap-6">
                            <Link href="/" className="hover:text-primary transition-colors">
                                Home
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
    );
}
