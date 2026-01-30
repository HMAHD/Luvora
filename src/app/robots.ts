import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://luvora.love';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/auth/',
                    '/_next/',
                    '/private/',
                ],
            },
            {
                // Googlebot-specific rules
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/admin/', '/dashboard/', '/auth/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
