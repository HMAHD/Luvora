'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Clock,
    Calendar,
    Share2,
    Heart,
    MessageCircle,
    Sparkles,
    BookOpen,
    Check,
    Copy,
    ChevronUp,
    ArrowRight,
} from 'lucide-react';
import { BLOG_ARTICLES, type BlogArticle } from '@/lib/blog-data';

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

// Parse markdown content into structured elements
function parseContent(content: string) {
    const lines = content.trim().split('\n');
    const elements: Array<{ type: string; content: string; level?: number; items?: string[] }> = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) {
            i++;
            continue;
        }

        // Headers
        if (line.startsWith('#### ')) {
            elements.push({ type: 'h4', content: line.replace('#### ', '') });
            i++;
        } else if (line.startsWith('### ')) {
            elements.push({ type: 'h3', content: line.replace('### ', '') });
            i++;
        } else if (line.startsWith('## ')) {
            elements.push({ type: 'h2', content: line.replace('## ', '') });
            i++;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            // Unordered list
            const items: string[] = [];
            while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
                items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
                i++;
            }
            elements.push({ type: 'ul', content: '', items });
        } else if (/^\d+\.\s/.test(line)) {
            // Ordered list
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
                i++;
            }
            elements.push({ type: 'ol', content: '', items });
        } else if (line.startsWith('**') && line.endsWith(':**')) {
            // Bold label (like "Sweet & Simple:")
            elements.push({ type: 'label', content: line.replace(/\*\*/g, '').replace(/:$/, '') });
            i++;
        } else {
            // Paragraph
            elements.push({ type: 'p', content: line });
            i++;
        }
    }

    return elements;
}

// Format text with markdown bold
function formatText(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-base-content">$1</strong>');
}

interface BlogArticleClientProps {
    article: BlogArticle;
}

export default function BlogArticleClient({ article }: BlogArticleClientProps) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / scrollHeight) * 100;
            setScrollProgress(Math.min(progress, 100));
            setShowScrollTop(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers that don't support clipboard
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const config = categoryConfig[article.category];
    const Icon = config.icon;

    const relatedArticles = BLOG_ARTICLES.filter(
        (a) => a.category === article.category && a.slug !== article.slug
    ).slice(0, 3);

    const parsedContent = useMemo(() => parseContent(article.content), [article.content]);

    return (
        <>
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-base-200">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary"
                    style={{ width: `${scrollProgress}%` }}
                    initial={{ width: 0 }}
                />
            </div>

            {/* Scroll to Top Button */}
            <motion.button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-50 btn btn-circle btn-primary shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
                style={{ pointerEvents: showScrollTop ? 'auto' : 'none' }}
            >
                <ChevronUp className="w-5 h-5" />
            </motion.button>

            <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-200/30 to-base-200">
                {/* Elegant Header */}
                <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/blog"
                                    className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <Link
                                        href="/"
                                        className="text-xl font-bold text-base-content font-romantic hover:text-primary transition-colors"
                                    >
                                        Luvora
                                    </Link>
                                    <p className="text-xs text-base-content/50">Love & Relationship Blog</p>
                                </div>
                            </div>

                            <button
                                onClick={handleShare}
                                className="btn btn-ghost btn-sm gap-2 hover:bg-primary/10"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-success" />
                                        <span className="text-success">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Share</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
                    <article>
                        {/* Article Hero */}
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative mb-12"
                        >
                            {/* Decorative elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />

                            <div className="relative">
                                {/* Category & Meta */}
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className={`badge ${config.color} border gap-1.5 px-3 py-2`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {config.label}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-base-content/50">
                                        <Clock className="w-4 h-4" />
                                        {article.readingTime} min read
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-base-content/50">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-6 leading-tight font-romantic">
                                    {article.title}
                                </h1>

                                {/* Description */}
                                <p className="text-lg md:text-xl text-base-content/70 leading-relaxed max-w-3xl">
                                    {article.description}
                                </p>

                                {/* Divider */}
                                <div className="mt-10 flex items-center gap-4">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
                                    <Heart className="w-5 h-5 text-primary/50" />
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
                                </div>
                            </div>
                        </motion.header>

                        {/* Article Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="prose prose-lg max-w-none"
                        >
                            {parsedContent.map((element, idx) => {
                                switch (element.type) {
                                    case 'h2':
                                        return (
                                            <h2
                                                key={idx}
                                                className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-base-content font-romantic bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text"
                                            >
                                                {element.content}
                                            </h2>
                                        );
                                    case 'h3':
                                        return (
                                            <h3
                                                key={idx}
                                                className="text-xl md:text-2xl font-bold mt-10 mb-4 text-base-content"
                                            >
                                                {element.content}
                                            </h3>
                                        );
                                    case 'h4':
                                        return (
                                            <h4
                                                key={idx}
                                                className="text-lg md:text-xl font-bold mt-8 mb-3 text-base-content flex items-center gap-2"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {element.content}
                                            </h4>
                                        );
                                    case 'label':
                                        return (
                                            <p
                                                key={idx}
                                                className="text-base font-semibold text-primary mt-6 mb-2"
                                            >
                                                {element.content}:
                                            </p>
                                        );
                                    case 'ul':
                                        return (
                                            <ul key={idx} className="my-4 space-y-3">
                                                {element.items?.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-3 text-base-content/80"
                                                    >
                                                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: formatText(item),
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    case 'ol':
                                        return (
                                            <ol key={idx} className="my-4 space-y-3 counter-reset-item">
                                                {element.items?.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-3 text-base-content/80"
                                                    >
                                                        <span className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: formatText(item),
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </ol>
                                        );
                                    case 'p':
                                        return (
                                            <p
                                                key={idx}
                                                className="text-base-content/80 mb-5 leading-relaxed text-lg"
                                                dangerouslySetInnerHTML={{
                                                    __html: formatText(element.content),
                                                }}
                                            />
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </motion.div>

                        {/* Keywords/Tags */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-12 pt-8 border-t border-base-content/10"
                        >
                            <div className="flex flex-wrap gap-2">
                                {article.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="badge badge-ghost badge-sm bg-base-200"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Share Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mt-8 p-6 rounded-2xl bg-base-200/50 border border-base-content/5"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <p className="font-semibold text-base-content">Enjoyed this article?</p>
                                    <p className="text-sm text-base-content/60">
                                        Share it with someone who might benefit
                                    </p>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="btn btn-primary gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </article>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-16"
                        >
                            <h2 className="text-2xl font-bold mb-8 font-romantic text-base-content">
                                Continue Reading
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedArticles.map((related) => {
                                    const relatedConfig = categoryConfig[related.category];
                                    const RelatedIcon = relatedConfig.icon;
                                    return (
                                        <Link
                                            key={related.slug}
                                            href={`/blog/${related.slug}`}
                                            className="group block"
                                        >
                                            <article className="h-full bg-base-100 rounded-2xl border border-base-content/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-base-content/5 hover:-translate-y-1 hover:border-primary/20">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span
                                                        className={`badge ${relatedConfig.color} border badge-sm gap-1`}
                                                    >
                                                        <RelatedIcon className="w-3 h-3" />
                                                        {relatedConfig.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base-content mb-3 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                                                    {related.title}
                                                </h3>
                                                <p className="text-base-content/60 text-sm leading-relaxed line-clamp-2">
                                                    {related.description}
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-base-content/5 flex items-center justify-between">
                                                    <span className="flex items-center gap-1 text-xs text-base-content/40">
                                                        <Clock className="w-3 h-3" />
                                                        {related.readingTime} min
                                                    </span>
                                                    <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                                        Read <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </article>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="mt-20"
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 md:p-12 text-center">
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNGMwIDItMiA0LTIgNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                            <div className="relative">
                                <Heart className="w-12 h-12 text-primary-content/80 mx-auto mb-4" />
                                <h3 className="text-2xl md:text-3xl font-bold text-primary-content mb-4 font-romantic">
                                    Put These Tips into Action
                                </h3>
                                <p className="text-primary-content/80 mb-6 max-w-lg mx-auto">
                                    Get a personalized romantic message delivered to your partner every day.
                                    Start your free spark streak today!
                                </p>
                                <Link
                                    href="/"
                                    className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none shadow-lg"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Start Free Today
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="border-t border-base-content/5 py-8 mt-8">
                    <div className="max-w-4xl mx-auto px-4">
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
