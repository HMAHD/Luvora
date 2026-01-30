import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Image optimization for Core Web Vitals
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },

    // Enable compression (Brotli/Gzip handled by Vercel automatically)
    compress: true,

    // Optimize bundle size
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    // Security headers for SEO and performance
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
            {
                // Cache static assets aggressively
                source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Redirects for SEO
    async redirects() {
        return [
            // Redirect www to non-www
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'www.luvora.love' }],
                destination: 'https://luvora.love/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
