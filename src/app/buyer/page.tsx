'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Droplets, Calendar, ChevronDown, CreditCard, FileText, ShoppingBag, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion';
import { ROLE_THEMES, UI_TOKENS, ANIMATIONS, formatINR } from '@/lib/designSystem';
import { CalculationBreakdown, MiniCalculation } from '@/components/shared/CalculationBreakdown';
import { cn } from '@/lib/utils';

// Mobile-First "Milk Buyer Wallet" Interface (BLUE THEME)
export default function BuyerDashboard() {
    const { user, profile, logout, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('month');
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const theme = ROLE_THEMES.BUYER;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        // Strict Role Enforcement (Allow Super Admin to view)
        if (profile && profile.role !== 'BUYER' && profile.role !== 'PLATFORM_SUPER_ADMIN') {
            if (profile.role === 'DAIRY_OWNER') router.push('/dashboard');
            if (profile.role === 'FARMER') router.push('/farmer');
        }

        if (user && profile) {
            fetchMyPurchases();
        }
    }, [user, loading, profile, router, filter]);

    const fetchMyPurchases = async () => {
        setLoadingEntries(true);
        try {
            // For now, we'll use a placeholder table: buyer_sales
            // In production, this would be a real table
            let query = supabase
                .from('buyer_sales')
                .select('*')
                .eq('buyer_id', profile?.id)
                .order('date', { ascending: false });

            // Date Filtering Logic
            const now = new Date();
            if (filter === 'today') {
                query = query.eq('date', now.toISOString().split('T')[0]);
            } else if (filter === 'week') {
                const lastWeek = new Date(now.setDate(now.getDate() - 7));
                query = query.gte('date', lastWeek.toISOString().split('T')[0]);
            } else if (filter === 'month') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                query = query.gte('date', firstDay.toISOString().split('T')[0]);
            }

            const { data, error } = await query;

            // If table doesn't exist yet (demo mode), use empty array
            if (error) {
                console.log('Buyer sales table not available, showing demo state');
                setEntries([]);
            } else if (data) {
                setEntries(data);
            }
        } catch (e) {
            console.error(e);
            setEntries([]);
        } finally {
            setLoadingEntries(false);
        }
    };

    // Calculate Summary Stats
    const totalMilk = entries.reduce((sum, e) => sum + (Number(e.liters) || 0), 0).toFixed(1);
    const totalAmount = entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const avgRate = entries.length > 0
        ? (entries.reduce((sum, e) => sum + (Number(e.price_per_liter) || 0), 0) / entries.length).toFixed(1)
        : '0.0';

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-blue-50">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-blue-600 font-medium">Loading your wallet...</p>
        </div>
    );

    // Check if user also has farmer role (dual role support)
    const hasDualRole = profile?.role === 'BUYER'; // In future, check for actual dual role flag

    return (
        <div className="min-h-screen bg-neutral-50 pb-24 font-sans">
            {/* 1. Header Section (Blue Theme) */}
            <div className={cn(
                "text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden",
                "bg-gradient-to-br from-blue-600 to-blue-900"
            )}>
                {/* Abstract Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

                <div className="p-6 pt-12 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back,</p>
                            <h1 className="text-2xl font-bold tracking-tight">{profile?.name?.split(' ')[0] || 'Buyer'} Ji 🛒</h1>
                        </div>
                        <div className="flex gap-2">
                            {/* Role Switcher (if dual role) */}
                            {hasDualRole && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/farmer')}
                                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
                                    title="Switch to Farmer View"
                                >
                                    <ArrowRightLeft className="w-5 h-5" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Total Amount Payable Card */}
                    <div className="mb-6">
                        <div className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                            Amount You Must Pay
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/10 rounded-full text-[10px]">
                                ✓ Verified
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={cn(
                                "text-4xl font-bold",
                                totalAmount > 0 ? "text-red-300" : "text-white"
                            )}>
                                {totalAmount > 0 && '-'}₹ {Math.round(totalAmount).toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-blue-300 font-medium">.00</span>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-blue-200">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-xs font-medium">Milk Taken</span>
                                </div>
                                <div className="text-lg font-bold">{totalMilk} <span className="text-xs font-medium">Ltr</span></div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-blue-200">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-xs font-medium">Avg Rate</span>
                                </div>
                                <div className="text-lg font-bold">₹{avgRate} <span className="text-xs font-medium">/Ltr</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Actions & Filters */}
            <div className="px-6 mt-8 flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Purchase History
                </h2>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full px-4 border-blue-200 text-blue-700 bg-white">
                            {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => setFilter('today')}>Today</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('week')}>This Week</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('month')}>This Month</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 3. Transaction List with Glass Ledger */}
            <div className="px-4 space-y-3">
                {loadingEntries ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-neutral-200">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-blue-300" />
                        </div>
                        <p className="text-neutral-500 font-medium">No purchases yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Your milk purchases will appear here</p>

                        {/* Demo Info */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center max-w-sm">
                            <p className="text-sm text-blue-700 font-medium mb-1">🛒 Buyer View Active</p>
                            <p className="text-xs text-blue-600">
                                This view shows milk you purchase FROM the dairy.
                                Your transaction records will appear here once the dairy adds sales entries.
                            </p>
                        </div>
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={entry.id}
                            className="bg-white rounded-2xl shadow-sm border border-neutral-100/50 overflow-hidden"
                        >
                            {/* Main Entry Row */}
                            <div
                                className="p-4 flex justify-between items-center active:bg-neutral-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    setSelectedEntry(selectedEntry?.id === entry.id ? null : entry);
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-xl">
                                        🥛
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-800 text-base">
                                            {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        {/* Mini Calculation Preview */}
                                        <MiniCalculation
                                            quantity={entry.liters}
                                            rate={entry.price_per_liter}
                                            total={Math.round(entry.amount)}
                                        />
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <div className="font-bold text-red-600 text-lg">-₹{Math.round(entry.amount)}</div>
                                        <div className="text-xs font-medium text-neutral-400">{entry.liters} Ltr</div>
                                    </div>
                                    {selectedEntry?.id === entry.id ? (
                                        <EyeOff className="w-4 h-4 text-neutral-400" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-neutral-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expandable Calculation Breakdown */}
                            {selectedEntry?.id === entry.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-neutral-100"
                                >
                                    <CalculationBreakdown
                                        title="How this was calculated"
                                        steps={[
                                            { label: 'Milk Type', calculation: entry.milk_type || 'Mixed', result: null },
                                            { label: 'Quantity', calculation: `${entry.liters} Liters`, result: null },
                                            { label: 'Rate Charged', calculation: `₹${entry.price_per_liter}/L`, result: null },
                                            { label: 'Amount', calculation: `${entry.liters}L × ₹${entry.price_per_liter}`, result: entry.amount }
                                        ]}
                                        netAmount={entry.amount}
                                        isCredit={false}
                                        showByDefault={true}
                                        className="m-0 rounded-none border-0"
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* 4. Bottom Tab Bar (Floating) */}
            <div className="fixed bottom-6 left-6 right-6">
                <div className="bg-neutral-900/90 backdrop-blur-lg text-white rounded-2xl p-4 shadow-2xl flex justify-around items-center border border-white/10">
                    <button className="flex flex-col items-center gap-1 text-blue-400">
                        <ShoppingBag className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Purchases</span>
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Invoices</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
