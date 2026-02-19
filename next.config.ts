import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

    // Externalize native modules for messaging channels (server-only)
    serverExternalPackages: [
        'discord.js',
        '@discordjs/ws',
        'zlib-sync',
        'bufferutil',
        'utf-8-validate',
        'whatsapp-web.js',
        'node-telegram-bot-api'
    ],

    // Optimize bundle size
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },

    // Security headers
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
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
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

// Wrap the Next.js config with Sentry
export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: "akash-hasendra",
    project: "luvora",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    // Hides source maps from generated client bundles
    sourcemaps: {
        disable: false,
        deleteSourcemapsAfterUpload: true,
    },
});
