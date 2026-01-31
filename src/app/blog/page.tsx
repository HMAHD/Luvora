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
        color: 'from-rose-500/20 via-rose-500/10 to-transparent',
        badgeColor: 'badge-error',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-200',
        icon: Heart,
        label: 'Relationships',
    },
    communication: {
        color: 'from-violet-500/20 via-violet-500/10 to-transparent',
        badgeColor: 'badge-secondary',
        textColor: 'text-violet-600',
        borderColor: 'border-violet-200',
        icon: MessageCircle,
        label: 'Communication',
    },
    tips: {
        color: 'from-amber-500/20 via-amber-500/10 to-transparent',
        badgeColor: 'badge-warning',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        icon: Sparkles,
        label: 'Tips & Ideas',
    },
    'love-languages': {
        color: 'from-pink-500/20 via-pink-500/10 to-transparent',
        badgeColor: 'badge-primary',
        textColor: 'text-pink-600',
        borderColor: 'border-pink-200',
        icon: BookOpen,
        label: 'Love Languages',
    },
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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
            <motion.div variants={itemVariants} className="mb-12">
                <Link href={`/blog/${article.slug}`} className="group block">
                    <article className="relative overflow-hidden rounded-3xl bg-base-100 border border-base-content/5 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                        {/* Featured Image with Gradient Overlay */}
                        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/60 to-transparent z-10" />
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Floating Badges */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                                <span className="badge badge-lg gap-2 shadow-2xl bg-white/95 dark:bg-white/90 backdrop-blur-md border border-primary/20 text-base-content">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="font-semibold text-gray-900">Featured</span>
                                </span>
                                <span className={`badge ${config.badgeColor} border shadow-2xl gap-1.5 bg-white/95 dark:bg-white/90 backdrop-blur-md ${config.textColor}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="font-medium">{config.label}</span>
                                </span>
                            </div>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-4 leading-tight group-hover:text-primary transition-colors duration-300 font-romantic">
                                {article.title}
                            </h2>

                            <p className="text-base-content/80 text-lg leading-relaxed mb-6 max-w-3xl line-clamp-2">
                                {article.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-sm text-base-content/60">
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

                                <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                                    Read Article
                                    <ArrowRight className="w-4 h-4" />
                                </div>
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
                <article className="h-full bg-base-100 rounded-2xl border border-base-content/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-base-content/5 hover:-translate-y-1 hover:border-primary/20">
                    {/* Article Image */}
                    <div className="relative h-48 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-60 z-10`} />
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20">
                            <span className={`badge gap-1 shadow-lg bg-white/95 dark:bg-white/90 backdrop-blur-sm border ${config.textColor}`}>
                                <Icon className="w-3 h-3" />
                                <span className="font-medium">{config.label}</span>
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-base-content mb-3 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
                            {article.title}
                        </h3>

                        <p className="text-base-content/60 text-sm leading-relaxed mb-4 line-clamp-2">
                            {article.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-base-content/5">
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
        <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-200/30 to-base-100">
            {/* Elegant Floating Header */}
            <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
                <div className="bg-base-100/80 backdrop-blur-2xl border border-base-content/10 rounded-2xl shadow-lg">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 hover:text-primary transition-all hover:scale-105"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <Link href="/" className="text-xl font-bold text-base-content font-romantic hover:text-primary transition-colors">
                                        Luvora
                                    </Link>
                                    <p className="text-xs text-base-content/50">Relationship Blog</p>
                                </div>
                            </div>

                            <Link href="/" className="btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform">
                                <Heart className="w-4 h-4 fill-current" />
                                Get Daily Sparks
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16 md:py-20">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 px-5 py-2 rounded-full text-sm font-semibold mb-8 hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        Relationship Wisdom & Insights
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-base-content mb-6 font-romantic leading-tight">
                        Build Love That
                        <br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary blur-xl opacity-30"></span>
                            <span className="relative bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                Lasts Forever
                            </span>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-base-content/60 max-w-3xl mx-auto leading-relaxed">
                        Expert advice and heartfelt insights to nurture deep connections
                        <br className="hidden md:block" />
                        and keep the romance alive in your relationship
                    </p>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-16"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        {/* Search */}
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/30" />
                            <input
                                type="text"
                                placeholder="Search articles by title, keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered w-full pl-12 pr-12 h-12 bg-base-100 border-base-content/10 focus:border-primary/50 rounded-xl transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`btn btn-sm rounded-xl transition-all hover:scale-105 ${
                                    !selectedCategory ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-ghost'
                                }`}
                            >
                                All Topics
                            </button>
                            {Object.entries(categoryConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                                        className={`btn btn-sm gap-1.5 rounded-xl transition-all hover:scale-105 ${
                                            selectedCategory === key ? `btn-primary shadow-lg shadow-primary/20` : 'btn-ghost'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Count */}
                    {(searchQuery || selectedCategory) && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center mt-4 text-sm text-base-content/60"
                        >
                            Found <span className="font-semibold text-primary">{filteredArticles.length}</span> {filteredArticles.length === 1 ? 'article' : 'articles'}
                        </motion.p>
                    )}
                </motion.div>

                {/* Articles */}
                {filteredArticles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="inline-flex p-8 rounded-full bg-base-200/50 mb-6">
                            <Heart className="w-16 h-16 text-base-content/20" />
                        </div>
                        <h3 className="text-2xl font-semibold text-base-content/60 mb-3">
                            No articles found
                        </h3>
                        <p className="text-base-content/40 mb-6">
                            Try adjusting your search or filter
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory(null);
                            }}
                            className="btn btn-primary gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Featured Article */}
                        {featuredArticle && <ArticleCard article={featuredArticle} featured />}

                        {/* Other Articles Grid */}
                        {otherArticles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {otherArticles.map((article) => (
                                    <ArticleCard key={article.slug} article={article} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Bottom CTA - Blog Card Style */}
                {filteredArticles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-20"
                    >
                        <Link href="/" className="group block relative overflow-hidden rounded-3xl border border-primary/20 bg-base-100 shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2">
                            {/* Background Image with Gradient Overlay */}
                            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600"></div>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-700"></div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                                {/* Featured Badge */}
                                <div className="absolute top-6 left-6">
                                    <span className="badge badge-lg gap-2 shadow-2xl bg-white/95 dark:bg-white/90 backdrop-blur-md border border-primary/20">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-gray-900">Free Forever</span>
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Heart className="w-5 h-5 text-rose-400 fill-current" />
                                        <span className="text-rose-400 font-medium">Transform Your Relationship</span>
                                    </div>

                                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                        Join 10,000+ Couples Getting Daily Sparks
                                    </h3>

                                    <p className="text-white/90 text-lg md:text-xl mb-6 max-w-2xl leading-relaxed">
                                        Don't let another day pass without deepening your connection. Get one personalized message daily—designed to bring you closer, spark meaningful conversations, and keep the romance alive.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-6 text-white/80">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium">100% Free</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium">No Credit Card</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium">Start in 30 Seconds</span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <span className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:gap-4">
                                            Start Your Free Journey
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-base-content/5 mt-20">
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <Link href="/" className="text-2xl font-bold font-romantic hover:text-primary transition-colors inline-block mb-4">
                        Luvora
                    </Link>
                    <p className="text-base-content/50 text-sm">
                        Nurturing relationships, one spark at a time
                    </p>
                </div>
            </footer>
        </div>
    );
}
