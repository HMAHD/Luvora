import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticleSlugs } from '@/lib/blog-data';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';
import BlogArticleClient from './BlogArticleClient';

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

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            <BlogArticleClient article={article} />
        </>
    );
}
