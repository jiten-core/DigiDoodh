// next.config.js - Enhanced PWA Configuration with Full Offline Support (Next.js 16)
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',

    // Comprehensive caching strategies for offline support
    runtimeCaching: [
        // Cache static assets forever
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },

        // Cache images
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-images',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
            },
        },

        // Cache JavaScript and CSS
        {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-resources',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },

        // Cache API responses for offline
        {
            urlPattern: /^\/api\/(?!auth).*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 10,
                backgroundSync: {
                    name: 'api-queue',
                    options: {
                        maxRetentionTime: 24 * 60, // 24 hours in minutes
                    },
                },
            },
        },

        // Cache pages
        {
            urlPattern: /^\/(?!api).*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'pages-cache',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 5,
            },
        },

        // Offline fallback page
        {
            urlPattern: /.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'offline-cache',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60,
                },
            },
        },
    ],

    // Precache important pages and assets
    additionalManifestEntries: [
        { url: '/offline', revision: '1' },
        { url: '/dashboard', revision: '1' },
        { url: '/dashboard/milk', revision: '1' },
        { url: '/dashboard/farmers', revision: '1' },
    ],

    // Fallback pages for offline
    fallbacks: {
        document: '/offline',
    },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,

    // Turbopack configuration for Next.js 16
    turbopack: {},

    // Image optimization for Next.js 16
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'localhost',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'supabase.co',
            },
        ],
        unoptimized: true, // For Electron compatibility
    },

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
    },

    // Compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Headers for PWA and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
        ]
    },
}

module.exports = withPWA(nextConfig)
