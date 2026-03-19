'use client';

import { motion } from 'framer-motion';
import { Droplets, Calendar, ChevronDown, LogOut, CreditCard, TrendingUp, ShoppingBag, Wallet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_THEMES, UI_TOKENS, ANIMATIONS, formatINR, getGreeting } from '@/lib/designSystem';
import { cn } from '@/lib/utils';

interface PassbookEntry {
    id: string;
    date: string;
    time?: string; // Morning/Evening for Farmer
    milk_type?: string; // For Buyer
    quantity?: number; // Farmer: quantity, Buyer: liters
    liters?: number;
    fat?: number;
    snf?: number;
    rate?: number;
    price_per_liter?: number;
    total_amount?: number;
    amount?: number;
}

interface UnifiedPassbookProps {
    role: 'FARMER' | 'BUYER';
    userName: string;
    entries: PassbookEntry[];
    filter: 'today' | 'week' | 'month';
    onFilterChange: (filter: 'today' | 'week' | 'month') => void;
    onLogout: () => void;
    loading?: boolean;
    lang?: 'en' | 'hi';
}

export function UnifiedPassbook({
    role,
    userName,
    entries,
    filter,
    onFilterChange,
    onLogout,
    loading = false,
    lang = 'en'
}: UnifiedPassbookProps) {
    const theme = ROLE_THEMES[role];
    const isFarmer = role === 'FARMER';

    // Calculate Summary Stats
    const totalMilk = entries.reduce((sum, e) => sum + (Number(e.quantity || e.liters) || 0), 0).toFixed(1);
    const totalAmount = entries.reduce((sum, e) => sum + (Number(e.total_amount || e.amount) || 0), 0);
    const avgValue = entries.length > 0
        ? isFarmer
            ? (entries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) / entries.length).toFixed(1)
            : (entries.reduce((sum, e) => sum + (Number(e.price_per_liter || e.rate) || 0), 0) / entries.length).toFixed(1)
        : '0.0';

    const filterLabels = {
        today: lang === 'hi' ? 'आज' : 'Today',
        week: lang === 'hi' ? 'इस सप्ताह' : 'This Week',
        month: lang === 'hi' ? 'इस महीने' : 'This Month'
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-24 font-sans">
            {/* 1. Header Section (Role-Themed) */}
            <div className={cn(
                "text-white",
                UI_TOKENS.header.gradient,
                `bg-gradient-to-br ${theme.gradient}`
            )}>
                {/* Abstract Shapes */}
                <div className={UI_TOKENS.header.shape1} />
                <div className={cn(
                    UI_TOKENS.header.shape2,
                    isFarmer ? 'bg-saffron-500/10' : 'bg-cyan-400/10'
                )} />

                <div className="p-6 pt-12 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-white/70 text-sm font-medium mb-1">
                                {lang === 'hi' ? 'नमस्ते,' : 'Welcome back,'}
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {userName?.split(' ')[0] || (isFarmer ? 'Farmer' : 'Buyer')} Ji {theme.icon}
                            </h1>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onLogout}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Total Balance Card */}
                    <div className="mb-6">
                        <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                            {theme.amountLabel[lang]}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={cn(
                                "text-4xl font-bold",
                                !isFarmer && totalAmount > 0 && "text-red-300"
                            )}>
                                {!isFarmer && totalAmount > 0 && '-'}₹ {Math.round(totalAmount).toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-white/50 font-medium">.00</span>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className={UI_TOKENS.card.glass}>
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-1 text-white/70">
                                        <Droplets className="w-4 h-4" />
                                        <span className="text-xs font-medium">{theme.milkAction[lang]}</span>
                                    </div>
                                    <div className="text-lg font-bold">
                                        {totalMilk} <span className="text-xs font-medium">Ltr</span>
                                    </div>
                                </div>
                            </div>
                            <div className={UI_TOKENS.card.glass}>
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-1 text-white/70">
                                        {isFarmer ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : (
                                            <CreditCard className="w-4 h-4" />
                                        )}
                                        <span className="text-xs font-medium">
                                            {isFarmer ? (lang === 'hi' ? 'औसत फैट' : 'Avg Fat') : (lang === 'hi' ? 'औसत दर' : 'Avg Rate')}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold">
                                        {isFarmer ? `${avgValue}%` : `₹${avgValue}/L`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Actions & Filters */}
            <div className="px-6 mt-8 flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <Calendar className={cn("w-5 h-5", `text-${theme.primary}-600`)} />
                    {theme.dashboardTitle[lang]}
                </h2>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "rounded-full px-4 bg-white",
                                `border-${theme.primary}-200 text-${theme.primary}-700`
                            )}
                        >
                            {filterLabels[filter]}
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => onFilterChange('today')}>{filterLabels.today}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFilterChange('week')}>{filterLabels.week}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFilterChange('month')}>{filterLabels.month}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 3. Transaction List */}
            <div className="px-4 space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-neutral-200">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                            `bg-${theme.primary}-50`
                        )}>
                            {isFarmer ? (
                                <Droplets className={cn("w-8 h-8", `text-${theme.primary}-300`)} />
                            ) : (
                                <ShoppingBag className={cn("w-8 h-8", `text-${theme.primary}-300`)} />
                            )}
                        </div>
                        <p className="text-neutral-500 font-medium">
                            {isFarmer
                                ? (lang === 'hi' ? 'अभी तक दूध नहीं डाला' : 'No milk poured yet')
                                : (lang === 'hi' ? 'अभी तक खरीदारी नहीं' : 'No purchases yet')
                            }
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                            {lang === 'hi' ? 'आपकी एंट्री यहां दिखेगी' : 'Your entries will appear here'}
                        </p>
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <motion.div
                            {...ANIMATIONS.fadeInUp}
                            transition={{ delay: index * 0.05 }}
                            key={entry.id}
                            className={cn(
                                UI_TOKENS.card.base,
                                UI_TOKENS.transaction.base,
                                "active:scale-[0.98] transition-transform"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-xl",
                                    isFarmer
                                        ? (entry.time === 'Morning' ? 'bg-orange-50' : 'bg-indigo-50')
                                        : `bg-${theme.primary}-50`
                                )}>
                                    {isFarmer
                                        ? (entry.time === 'Morning' ? '☀️' : '🌙')
                                        : '🥛'
                                    }
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-800 text-base">
                                        {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="text-xs text-neutral-500 font-medium flex gap-2">
                                        {isFarmer ? (
                                            <>
                                                <span>{entry.fat}% Fat</span>
                                                <span className="text-neutral-300">•</span>
                                                <span>{entry.snf}% SNF</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{entry.milk_type || 'Mixed'}</span>
                                                <span className="text-neutral-300">•</span>
                                                <span>₹{entry.price_per_liter || entry.rate}/L</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    "font-bold text-lg",
                                    isFarmer ? UI_TOKENS.transaction.credit : UI_TOKENS.transaction.debit
                                )}>
                                    {isFarmer ? '+' : '-'}₹{Math.round(entry.total_amount || entry.amount || 0)}
                                </div>
                                <div className="text-xs font-medium text-neutral-400">
                                    {entry.quantity || entry.liters} Ltr
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* 4. Bottom Tab Bar (Floating) */}
            <div className={UI_TOKENS.bottomNav.base}>
                <div className={UI_TOKENS.bottomNav.container}>
                    <button className={cn(
                        "flex flex-col items-center gap-1",
                        `text-${theme.primary}-400`
                    )}>
                        {isFarmer ? <Droplets className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                        <span className="text-[10px] font-medium">
                            {isFarmer ? (lang === 'hi' ? 'दूध' : 'Pouring') : (lang === 'hi' ? 'खरीद' : 'Purchases')}
                        </span>
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors">
                        {isFarmer ? <Wallet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        <span className="text-[10px] font-medium">
                            {isFarmer ? (lang === 'hi' ? 'भुगतान' : 'Payments') : (lang === 'hi' ? 'बिल' : 'Invoices')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
