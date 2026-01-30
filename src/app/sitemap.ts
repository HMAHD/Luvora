import { MetadataRoute } from 'next';
import { getAllCategorySlugs } from '@/lib/seo-categories';
import { getAllArticleSlugs, getArticleBySlug } from '@/lib/blog-data';

const BASE_URL = 'https://luvora.love';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/sparks`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic SEO category pages (50+ pages)
    const categorySlugs = getAllCategorySlugs();
    const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
        url: `${BASE_URL}/sparks/${slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // Blog article pages
    const articleSlugs = getAllArticleSlugs();
    const blogPages: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
        const article = getArticleBySlug(slug);
        return {
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: article ? new Date(article.updatedAt) : now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        };
    });

    return [...staticPages, ...categoryPages, ...blogPages];
}
