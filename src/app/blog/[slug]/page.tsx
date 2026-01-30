import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { getArticleBySlug, getAllArticleSlugs, BLOG_ARTICLES } from '@/lib/blog-data';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return { title: 'Article Not Found | Luvora' };
    }

    return {
        title: `${article.title} | Luvora Blog`,
        description: article.description,
        keywords: article.keywords,
        openGraph: {
            title: article.title,
            description: article.description,
            type: 'article',
            siteName: 'Luvora',
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt,
            authors: ['Luvora'],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description,
        },
        alternates: {
            canonical: `/blog/${slug}`,
        },
    };
}

function generateArticleJsonLd(article: NonNullable<ReturnType<typeof getArticleBySlug>>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        author: {
            '@type': 'Organization',
            name: 'Luvora',
            url: 'https://luvora.love',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Luvora',
            url: 'https://luvora.love',
            logo: {
                '@type': 'ImageObject',
                url: 'https://luvora.love/icon.png',
            },
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://luvora.love/blog/${article.slug}`,
        },
        keywords: article.keywords.join(', '),
        articleSection: article.category,
        wordCount: article.content.split(/\s+/).length,
    };
}

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

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const jsonLd = generateArticleJsonLd(article);
    const breadcrumbItems = [
        { name: 'Home', url: 'https://luvora.love' },
        { name: 'Blog', url: 'https://luvora.love/blog' },
        { name: article.title, url: `https://luvora.love/blog/${article.slug}` },
    ];

    // Get related articles (same category, excluding current)
    const relatedArticles = BLOG_ARTICLES.filter(
        (a) => a.category === article.category && a.slug !== article.slug
    ).slice(0, 2);

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            <div className="min-h-screen bg-base-200">
                {/* Header */}
                <header className="bg-base-100 border-b border-base-content/10">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <Link href="/blog" className="btn btn-ghost btn-circle btn-sm">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <Link href="/" className="text-xl font-bold text-base-content font-romantic">
                                    Luvora
                                </Link>
                                <p className="text-xs text-base-content/60">Blog</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-4 py-12">
                    {/* Article Header */}
                    <article>
                        <header className="mb-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
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
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4 leading-tight">
                                {article.title}
                            </h1>
                            <p className="text-lg text-base-content/70">{article.description}</p>
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none">
                            {article.content.split('\n\n').map((paragraph, idx) => {
                                if (paragraph.startsWith('## ')) {
                                    return (
                                        <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-base-content">
                                            {paragraph.replace('## ', '')}
                                        </h2>
                                    );
                                }
                                if (paragraph.startsWith('### ')) {
                                    return (
                                        <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-base-content">
                                            {paragraph.replace('### ', '')}
                                        </h3>
                                    );
                                }
                                if (paragraph.startsWith('#### ')) {
                                    return (
                                        <h4 key={idx} className="text-lg font-bold mt-4 mb-2 text-base-content">
                                            {paragraph.replace('#### ', '')}
                                        </h4>
                                    );
                                }
                                if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                                    const items = paragraph.split('\n').filter(Boolean);
                                    const isOrdered = paragraph.startsWith('1. ');
                                    const ListTag = isOrdered ? 'ol' : 'ul';
                                    return (
                                        <ListTag key={idx} className={`my-4 ${isOrdered ? 'list-decimal' : 'list-disc'} pl-6`}>
                                            {items.map((item, i) => (
                                                <li key={i} className="text-base-content/80 mb-2">
                                                    {item.replace(/^[-\d]+[\.\)]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                                                </li>
                                            ))}
                                        </ListTag>
                                    );
                                }
                                if (paragraph.trim()) {
                                    return (
                                        <p
                                            key={idx}
                                            className="text-base-content/80 mb-4 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                                            }}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {/* Share */}
                        <div className="mt-12 pt-8 border-t border-base-content/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-base-content/60">Share this article</span>
                                <div className="flex gap-2">
                                    <button className="btn btn-ghost btn-sm gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Related Articles */}
                    {relatedArticles.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
                            <div className="grid gap-4">
                                {relatedArticles.map((related) => (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="card bg-base-100 border border-base-content/10 hover:border-primary/30 transition-all"
                                    >
                                        <div className="card-body p-4">
                                            <h3 className="font-medium">{related.title}</h3>
                                            <p className="text-sm text-base-content/60 line-clamp-2">
                                                {related.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-16">
                        <div className="card bg-primary/10 border border-primary/20">
                            <div className="card-body text-center">
                                <h3 className="text-xl font-bold mb-2">Put These Tips into Practice</h3>
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
                    <div className="max-w-3xl mx-auto px-4 text-center text-sm text-base-content/50">
                        <p>Luvora - Daily sparks of love for couples who care</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
