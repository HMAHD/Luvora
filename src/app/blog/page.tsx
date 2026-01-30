import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/lib/blog-data';
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Relationship Advice Blog | Luvora',
    description: 'Expert relationship advice, romantic tips, and communication guides for couples. Learn how to strengthen your bond and keep the spark alive.',
    keywords: ['relationship advice', 'romantic tips', 'couple communication', 'love languages', 'relationship blog'],
    openGraph: {
        title: 'Relationship Advice Blog | Luvora',
        description: 'Expert relationship advice and romantic tips for couples.',
        type: 'website',
        siteName: 'Luvora',
    },
    alternates: {
        canonical: '/blog',
    },
};

const categoryColors = {
    relationships: 'badge-primary',
    communication: 'badge-secondary',
    tips: 'badge-accent',
    'love-languages': 'badge-warning',
};

const categoryLabels = {
    relationships: 'Relationships',
    communication: 'Communication',
    tips: 'Tips & Ideas',
    'love-languages': 'Love Languages',
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <header className="bg-base-100 border-b border-base-content/10">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/" className="btn btn-ghost btn-circle btn-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-base-content font-romantic">Luvora Blog</h1>
                            <p className="text-sm text-base-content/60">Relationship advice & romantic tips</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                        Expert Advice for <span className="text-primary">Stronger Relationships</span>
                    </h2>
                    <p className="text-base-content/70 max-w-2xl mx-auto">
                        Discover tips, guides, and insights to deepen your connection and keep the romance alive.
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <span key={key} className={`badge ${categoryColors[key as keyof typeof categoryColors]} badge-lg`}>
                            {label}
                        </span>
                    ))}
                </div>

                {/* Articles Grid */}
                <div className="grid gap-6">
                    {BLOG_ARTICLES.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="card bg-base-100 border border-base-content/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="card-body">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`badge ${categoryColors[article.category]} badge-sm`}>
                                        {categoryLabels[article.category]}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-base-content/50">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime} min read
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-base-content/50">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <h3 className="card-title text-lg">{article.title}</h3>
                                <p className="text-base-content/70 text-sm">{article.description}</p>
                                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-2">
                                    Read more <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <div className="card bg-primary/10 border border-primary/20">
                        <div className="card-body">
                            <h3 className="text-xl font-bold mb-2">Ready to Put These Tips into Action?</h3>
                            <p className="text-base-content/70 mb-4">
                                Get a daily romantic message delivered to your partner automatically.
                            </p>
                            <Link href="/" className="btn btn-primary">
                                Try Luvora Free
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-base-content/10 py-8 mt-16">
                <div className="max-w-4xl mx-auto px-4 text-center text-sm text-base-content/50">
                    <p>Luvora - Daily sparks of love for couples who care</p>
                </div>
            </footer>
        </div>
    );
}
