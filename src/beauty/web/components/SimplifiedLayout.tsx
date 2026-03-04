'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Milk,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Plus,
    ChevronDown,
    ChevronUp,
    Sun,
    Moon,
    MoreHorizontal,
    Package,
    FileText,
    MapPin,
    BookOpen,
    Phone,
    Upload,
    Gift,
    ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

interface SimplifiedLayoutProps {
    children: React.ReactNode;
}

export default function SimplifiedLayout({ children }: SimplifiedLayoutProps) {
    const { t, i18n } = useTranslation();
    const { user, profile, logout } = useAuth();
    const { sidebarOpen, setSidebarOpen, notifications } = useUIStore();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isHindi = i18n.language === 'hi';

    // 🎯 SIMPLIFIED: Only 7 Primary Navigation Items
    const primaryNav = [
        {
            name: isHindi ? 'होम' : 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: isHindi ? 'दूध' : 'Milk',
            href: '/dashboard/milk',
            icon: Milk,
            badge: 'NEW',
        },
        {
            name: isHindi ? 'लोग' : 'People',
            href: '/dashboard/farmers',
            icon: Users,
        },
        {
            name: isHindi ? 'भुगतान' : 'Payments',
            href: '/dashboard/billing',
            icon: CreditCard,
        },
        {
            name: isHindi ? 'रिपोर्ट' : 'Reports',
            href: '/dashboard/reports',
            icon: BarChart3,
        },
        {
            name: isHindi ? 'सेटिंग्स' : 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    // 🎯 "More" Menu Items (collapsed by default)
    const moreNav = [
        { name: isHindi ? 'दूध बेचें' : 'Sell Milk', href: '/dashboard/sell-milk', icon: ShoppingCart },
        { name: isHindi ? 'क्लस्टर' : 'Clusters', href: '/dashboard/clusters', icon: MapPin },
        { name: isHindi ? 'खरीदार' : 'Buyers', href: '/dashboard/buyers', icon: Users },
        { name: isHindi ? 'उत्पाद' : 'Products', href: '/dashboard/products', icon: Package },
        { name: isHindi ? 'खाता बही' : 'Ledger', href: '/dashboard/ledger', icon: BookOpen },
        { name: isHindi ? 'दर चार्ट' : 'Rates', href: '/dashboard/rate-charts', icon: FileText },
        { name: isHindi ? 'बल्क अपलोड' : 'Bulk Upload', href: '/dashboard/bulk-upload', icon: Upload },
        { name: isHindi ? 'स्टाफ' : 'Staff', href: '/dashboard/staff', icon: Users },
        { name: isHindi ? 'रेफरल' : 'Referrals', href: '/dashboard/referrals', icon: Gift },
        { name: isHindi ? 'सहायता' : 'Support', href: '/dashboard/contact', icon: Phone },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const unreadNotifications = notifications?.filter((n: any) => !n.read).length || 0;
    const displayName = profile?.name?.split(' ')[0] || 'User';

    // Check if current path matches
    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* 📱 MOBILE BOTTOM NAV (Paper-like, 5 items only) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden safe-area-pb">
                <div className="flex items-center justify-around h-16">
                    {primaryNav.slice(0, 5).map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center h-full w-full min-w-[56px] transition-all',
                                    active
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                )}
                            >
                                <item.icon className={cn('w-6 h-6', active && 'scale-110')} />
                                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                    {/* More Menu */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="flex flex-col items-center justify-center h-full w-full min-w-[56px] text-gray-500 dark:text-gray-400"
                    >
                        <MoreHorizontal className="w-6 h-6" />
                        <span className="text-[10px] mt-1 font-medium">{isHindi ? 'और' : 'More'}</span>
                    </button>
                </div>
            </nav>

            {/* 📱 MOBILE MORE MENU (Slide up sheet) */}
            <AnimatePresence>
                {showMore && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMore(false)}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[70vh] overflow-y-auto md:hidden"
                        >
                            <div className="p-4">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                                <h3 className="text-lg font-bold mb-4">{isHindi ? 'और विकल्प' : 'More Options'}</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {moreNav.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMore(false)}
                                            className={cn(
                                                'flex flex-col items-center p-4 rounded-2xl transition-all',
                                                isActive(item.href)
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            )}
                                        >
                                            <item.icon className="w-6 h-6 mb-2" />
                                            <span className="text-xs text-center">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                {/* Quick Settings in More */}
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {isHindi ? 'डार्क मोड' : 'Dark Mode'}
                                        </span>
                                        <button
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                                        >
                                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMore(false)}
                                    className="w-full mt-4 py-3 text-center text-gray-500 dark:text-gray-400"
                                >
                                    {isHindi ? 'बंद करें' : 'Close'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 💻 DESKTOP SIDEBAR (Compact, clean) */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-20 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40">
                {/* Logo */}
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Milk className="w-6 h-6 text-white" />
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-lg">DigiDhoodh</span>
                </div>

                {/* Primary Nav */}
                <nav className="flex-1 p-2 lg:p-4 space-y-1">
                    {primaryNav.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl transition-all group',
                                    active
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                )}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="hidden lg:block ml-3 font-medium">{item.name}</span>
                                {item.badge && (
                                    <span className="hidden lg:inline ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* More Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="flex items-center justify-center lg:justify-between w-full px-3 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                        >
                            <div className="flex items-center">
                                <MoreHorizontal className="w-5 h-5" />
                                <span className="hidden lg:block ml-3 font-medium">{isHindi ? 'और' : 'More'}</span>
                            </div>
                            <ChevronDown className={cn(
                                'hidden lg:block w-4 h-4 transition-transform',
                                showMore && 'rotate-180'
                            )} />
                        </button>

                        {/* Desktop More Items */}
                        <AnimatePresence>
                            {showMore && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="py-2 space-y-1">
                                        {moreNav.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center justify-center lg:justify-start px-3 py-2 rounded-xl transition-all text-sm',
                                                    isActive(item.href)
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                )}
                                            >
                                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                                <span className="hidden lg:block ml-3">{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-2 lg:p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-center lg:justify-start p-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden lg:block ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{profile?.role || 'Owner'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden lg:block p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:pl-20 lg:pl-64 pb-20 md:pb-0">
                {/* Top Header (Mobile) */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 md:hidden">
                    <div className="flex items-center justify-between h-14 px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Milk className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold">DigiDhoodh</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>

            {/* 🎯 FLOATING ACTION BUTTON (Add Milk - Primary Action) */}
            <Link
                href="/dashboard/milk"
                className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
            >
                <Plus className="w-7 h-7 text-white" />
            </Link>
        </div>
    );
}
