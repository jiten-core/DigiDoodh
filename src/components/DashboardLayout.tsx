'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Milk,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  ChevronRight,
  Sun,
  Moon,
  Gift,
  BarChart3,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import LanguageSwitcher, { LanguageSwitcherCompact } from './LanguageSwitcher';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, notifications } = useUIStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle back button for mobile sidebar
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      if (sidebarOpen) {
        e.preventDefault();
        setSidebarOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleBackButton);
      return () => window.removeEventListener('popstate', handleBackButton);
    }
  }, [sidebarOpen, setSidebarOpen]);

  // Push state when sidebar opens for back button to work
  const handleOpenSidebar = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      window.history.pushState({ sidebar: true }, '', window.location.href);
    }
  };

  const handleCloseSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
      window.history.back();
    }
  };

  const navigation = [
    {
      name: t('nav.dashboard', 'Dashboard'),
      nameHi: 'डैशबोर्ड',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.milkCollection', 'Milk Collection'),
      nameHi: 'दूध संग्रहण',
      href: '/dashboard/milk',
      icon: Milk,
    },
    {
      name: t('nav.farmers', 'Farmers'),
      nameHi: 'किसान',
      href: '/dashboard/farmers',
      icon: Users,
    },
    {
      name: t('nav.buyers', 'Buyers'),
      nameHi: 'खरीदार',
      href: '/dashboard/buyers',
      icon: ShoppingCart,
    },
    {
      name: t('nav.products', 'Products'),
      nameHi: 'उत्पाद',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      name: t('nav.billing', 'Billing'),
      nameHi: 'बिलिंग',
      href: '/dashboard/billing',
      icon: CreditCard,
    },
    {
      name: t('nav.rateChart', 'Rate Charts'),
      nameHi: 'दर चार्ट',
      href: '/dashboard/rate-charts',
      icon: FileText,
    },
    {
      name: t('staff.title', 'Staff'),
      nameHi: 'स्टाफ',
      href: '/dashboard/staff',
      icon: Users,
    },
    {
      name: t('referrals.title', 'Referrals'),
      nameHi: 'रेफरल',
      href: '/dashboard/referrals',
      icon: Gift,
    },
    {
      name: t('nav.reports', 'Reports'),
      nameHi: 'रिपोर्ट',
      href: '/dashboard/reports',
      icon: BarChart3,
    },
    {
      name: t('nav.settings', 'Settings'),
      nameHi: 'सेटिंग्स',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const unreadNotifications = notifications?.filter((n: any) => !n.read).length || 0;
  const isHindi = i18n.language === 'hi';
  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const dairyName = profile?.dairy?.name || 'My Dairy';

  return (
    <div key={i18n.language} className="min-h-screen bg-milk-texture dark:bg-background flex relative overflow-hidden">
      <div className="grain-overlay" />
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "hidden lg:flex flex-col glass-panel fixed left-0 top-0 bottom-0 z-40 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-dairy-premium rounded-2xl flex items-center justify-center shadow-dairy flex-shrink-0">
              <span className="text-xl">🥛</span>
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-lg font-display font-bold text-dairy-700 dark:text-dairy-400">
                  DigiDhoodh
                </span>
              </motion.div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform",
              sidebarOpen ? "rotate-180" : ""
            )} />
          </button>
        </div>

        {/* Dairy Name */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-muted-foreground">{isHindi ? 'डेयरी' : 'Dairy'}</p>
            <p className="font-semibold text-foreground truncate">{dairyName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 tap-target",
                  isActive
                    ? "bg-dairy-500 text-white shadow-dairy"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-muted-foreground"
                )} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium truncate"
                  >
                    {isHindi ? item.nameHi : item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl",
            sidebarOpen ? "" : "justify-center"
          )}>
            <div className="farmer-avatar flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-foreground truncate">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.role || 'Dairy Owner'}
                </p>
              </motion.div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2.5 rounded-xl text-terra-600 hover:bg-terra-50 dark:hover:bg-terra-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">{isHindi ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav">
        <div className="flex justify-around items-center py-2">
          {[
            { icon: Home, href: '/dashboard', label: isHindi ? 'होम' : 'Home' },
            { icon: Milk, href: '/dashboard/milk', label: isHindi ? 'दूध' : 'Milk' },
            { icon: Users, href: '/dashboard/farmers', label: isHindi ? 'किसान' : 'Farmers' },
            { icon: CreditCard, href: '/dashboard/billing', label: isHindi ? 'बिल' : 'Bills' },
            { icon: Settings, href: '/dashboard/settings', label: isHindi ? 'सेटिंग' : 'Settings' },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("bottom-nav-item", isActive && "active")}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen pb-20 lg:pb-0",
        "lg:ml-0"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-border/50">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            {/* Mobile menu button */}
            <button
              onClick={handleOpenSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-muted tap-target"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title - hidden on mobile */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-display font-bold text-foreground">
                {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-xl hover:bg-muted transition-colors tap-target"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-saffron-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-earth-600" />
                  )}
                </button>
              )}

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-muted transition-colors tap-target">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-terra-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Language */}
              <div className="hidden sm:block">
                <LanguageSwitcherCompact />
              </div>

              {/* Quick Add Button */}
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dairy-500 text-white font-medium hover:bg-dairy-600 transition-colors tap-target">
                <Plus className="w-4 h-4" />
                <span>{isHindi ? 'दूध डालें' : 'Add Milk'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 animate-page-enter">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={handleCloseSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-card z-50 flex flex-col"
            >
              {/* Mobile sidebar content */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-dairy-premium rounded-2xl flex items-center justify-center">
                    <span className="text-xl">🥛</span>
                  </div>
                  <span className="text-lg font-display font-bold text-dairy-700 dark:text-dairy-400">
                    DigiDhoodh
                  </span>
                </div>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 rounded-xl hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm text-muted-foreground">{isHindi ? 'डेयरी' : 'Dairy'}</p>
                <p className="font-semibold text-foreground">{dairyName}</p>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleCloseSidebar}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all tap-target",
                        isActive
                          ? "bg-dairy-500 text-white"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{isHindi ? item.nameHi : item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-border safe-area-bottom">
                <div className="flex items-center gap-3 p-2">
                  <div className="farmer-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{profile?.role || 'Dairy Owner'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-3 rounded-xl text-terra-600 hover:bg-terra-50 dark:hover:bg-terra-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">{isHindi ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}