'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Milk,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  BarChart3,
  Home,
  BookOpen,
  Plus,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get dairy name from localStorage (set in /settings)
  const dairyName =
    typeof window !== 'undefined'
      ? localStorage.getItem('dd_dairy_name') || 'My Dairy'
      : 'My Dairy';
  const ownerName =
    typeof window !== 'undefined'
      ? localStorage.getItem('dd_owner_name') || 'Dairy Owner'
      : 'Dairy Owner';

  // 🎯 Primary Navigation — 6 Core Routes
  const primaryNavigation = [
    {
      name: 'Dashboard',
      nameHi: 'होम',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Milk Entry',
      nameHi: 'दूध',
      href: '/milk-entry',
      icon: Milk,
    },
    {
      name: 'Farmers',
      nameHi: 'किसान',
      href: '/farmers',
      icon: Users,
    },
    {
      name: 'Bills',
      nameHi: 'बिल',
      href: '/bills',
      icon: CreditCard,
    },
    {
      name: 'Ledger',
      nameHi: 'खाता',
      href: '/ledger',
      icon: BookOpen,
    },
    {
      name: 'Rate Charts',
      nameHi: 'दरें',
      href: '/rate-charts',
      icon: FileText,
    },
    {
      name: 'Reports',
      nameHi: 'रिपोर्ट',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      nameHi: 'सेटिंग्स',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-milk-texture dark:bg-background flex relative overflow-hidden">
      <div className="grain-overlay" />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col glass-panel fixed inset-y-0 left-0 z-40 transition-all duration-300',
          sidebarOpen ? 'w-[260px]' : 'w-[70px]'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-dairy-premium rounded-2xl flex items-center justify-center shadow-dairy flex-shrink-0">
              <span className="text-xl">🥛</span>
            </div>
            {sidebarOpen && (
              <span className="text-lg font-display font-bold text-dairy-700 dark:text-dairy-400">
                DigiDhoodh
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform',
                sidebarOpen ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>

        {/* Dairy Name */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-muted-foreground">Dairy</p>
            <p className="font-semibold text-foreground truncate">
              {dairyName}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {primaryNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 tap-target',
                  active
                    ? 'bg-dairy-500 text-white shadow-dairy'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    active ? 'text-white' : 'text-muted-foreground'
                  )}
                />
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl',
              sidebarOpen ? '' : 'justify-center'
            )}
          >
            <div className="farmer-avatar flex-shrink-0">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {ownerName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  Dairy Owner
                </p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2.5 rounded-xl text-terra-600 hover:bg-terra-50 dark:hover:bg-terra-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav">
        <div className="flex justify-around items-center py-2">
          {[
            { icon: Home, href: '/dashboard', label: 'Home' },
            { icon: Milk, href: '/milk-entry', label: 'Milk' },
            { icon: Users, href: '/farmers', label: 'Farmers' },
            { icon: CreditCard, href: '/bills', label: 'Bills' },
            { icon: Settings, href: '/settings', label: 'Settings' },
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('bottom-nav-item', active && 'active')}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300'
        )}
        style={{
          marginLeft:
            typeof window !== 'undefined' && window.innerWidth >= 1024
              ? sidebarOpen
                ? '260px'
                : '70px'
              : '0px',
        }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-border/50">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted tap-target"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-display font-bold text-foreground">
                {primaryNavigation.find((n) => isActive(n.href))?.name ||
                  'Dashboard'}
              </h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() =>
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                  }
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
              </button>

              {/* Quick Add Button */}
              <Link
                href="/milk-entry"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dairy-500 text-white font-medium hover:bg-dairy-600 transition-colors tap-target"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milk</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 animate-page-enter">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-card z-50 flex flex-col">
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
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-muted-foreground">Dairy</p>
              <p className="font-semibold text-foreground">{dairyName}</p>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {primaryNavigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all tap-target',
                      active
                        ? 'bg-dairy-500 text-white'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border safe-area-bottom">
              <div className="flex items-center gap-3 p-2">
                <div className="farmer-avatar">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {ownerName}
                  </p>
                  <p className="text-sm text-muted-foreground">Dairy Owner</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-3 rounded-xl text-terra-600 hover:bg-terra-50 dark:hover:bg-terra-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}