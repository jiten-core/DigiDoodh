import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'DigiDhoodh - Smart Dairy Management | Made in India 🇮🇳',
    description: 'Complete dairy management SaaS for Indian dairy businesses. Milk collection, farmer management, billing, and more.',
    keywords: 'dairy management, milk collection, farmer app, dairy software, India, दूध डेयरी',
    authors: [{ name: 'DigiDhoodh Technologies' }],
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.ico',
        apple: '/icons/icon-192x192.png',
    },
    openGraph: {
        title: 'DigiDhoodh - Smart Dairy Management',
        description: 'Transform your dairy business with India\'s most trusted dairy management platform.',
        type: 'website',
        locale: 'en_IN',
        siteName: 'DigiDhoodh',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DigiDhoodh - Smart Dairy Management',
        description: 'Transform your dairy business with India\'s most trusted dairy management platform.',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#22c55e' },
        { media: '(prefers-color-scheme: dark)', color: '#15803d' },
    ],
}

import { ThemeProvider } from '@/components/ThemeProvider'
import I18nProvider from '@/components/I18nProvider'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="DigiDhoodh" />
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <I18nProvider>
                        <AuthProvider>
                            {children}
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: 'var(--background)',
                                        color: 'var(--foreground)',
                                        border: '1px solid var(--border)',
                                    },
                                }}
                            />
                        </AuthProvider>
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
