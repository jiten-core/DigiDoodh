'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Droplets, Calendar, ChevronDown, TrendingUp, Wallet, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
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

// Mobile-First "Milk Passbook" Interface (GREEN THEME)
export default function FarmerDashboard() {
    const { user, profile, logout, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('month');
    const [showCalculation, setShowCalculation] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const theme = ROLE_THEMES.FARMER;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        // Strict Role Enforcement (Allow Super Admin to view)
        if (profile && profile.role !== 'FARMER' && profile.role !== 'PLATFORM_SUPER_ADMIN') {
            if (profile.role === 'DAIRY_OWNER') router.push('/dashboard');
            if (profile.role === 'BUYER') router.push('/buyer');
        }

        if (user && profile) {
            fetchMyEntries();
        }
    }, [user, loading, profile, router, filter]);

    const fetchMyEntries = async () => {
        setLoadingEntries(true);
        try {
            let query = supabase
                .from('milk_entries')
                .select('*')
                .eq('farmer_id', profile?.id)
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

            if (error) {
                console.log('Milk entries not available:', error.message);
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
    const totalMilk = entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0).toFixed(1);
    const totalAmount = entries.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0);
    const avgFat = entries.length > 0
        ? (entries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) / entries.length).toFixed(1)
        : '0.0';

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-emerald-50">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-emerald-600 font-medium">Loading your passbook...</p>
        </div>
    );

    // Check if user also has buyer role (dual role support)
    const hasDualRole = profile?.role === 'FARMER'; // In future, check for actual dual role flag

    return (
        <div className="min-h-screen bg-neutral-50 pb-24 font-sans">
            {/* 1. Header Section (Emerald/Green Theme) */}
            <div className={cn(
                "text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden",
                "bg-gradient-to-br from-emerald-600 to-emerald-900"
            )}>
                {/* Abstract Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-lime-400/10 rounded-full blur-3xl" />

                <div className="p-6 pt-12 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-emerald-200 text-sm font-medium mb-1">Welcome back,</p>
                            <h1 className="text-2xl font-bold tracking-tight">{profile?.name?.split(' ')[0] || 'Farmer'} Ji 👨‍🌾</h1>
                        </div>
                        <div className="flex gap-2">
                            {/* Role Switcher (if dual role) */}
                            {hasDualRole && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/buyer')}
                                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
                                    title="Switch to Buyer View"
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

                    {/* Total Balance Card */}
                    <div className="mb-6">
                        <div className="text-emerald-200 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                            Amount Dairy Will Pay You
                            <span className="inline-flex items-center px-2 py-0.5 bg-white/10 rounded-full text-[10px]">
                                ✓ Verified
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">+₹ {Math.round(totalAmount).toLocaleString('en-IN')}</span>
                            <span className="text-sm text-emerald-300 font-medium">.00</span>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-emerald-200">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-xs font-medium">Milk Given</span>
                                </div>
                                <div className="text-lg font-bold">{totalMilk} <span className="text-xs font-medium">Ltr</span></div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-emerald-200">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-medium">Avg Fat</span>
                                </div>
                                <div className="text-lg font-bold">{avgFat} <span className="text-xs font-medium">%</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Actions & Filters */}
            <div className="px-6 mt-8 flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Milk Passbook
                </h2>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full px-4 border-emerald-200 text-emerald-700 bg-white">
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
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <Droplets className="w-8 h-8 text-emerald-300" />
                        </div>
                        <p className="text-neutral-500 font-medium">No milk poured yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Your entries will appear here</p>
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
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${entry.time === 'Morning' ? 'bg-orange-50' : 'bg-indigo-50'
                                        }`}>
                                        {entry.time === 'Morning' ? '☀️' : '🌙'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-800 text-base">
                                            {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        {/* Mini Calculation Preview */}
                                        <MiniCalculation
                                            quantity={entry.quantity}
                                            rate={entry.rate || (entry.total_amount / entry.quantity)}
                                            total={Math.round(entry.total_amount)}
                                        />
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <div className="font-bold text-emerald-600 text-lg">+₹{Math.round(entry.total_amount)}</div>
                                        <div className="text-xs font-medium text-neutral-400">{entry.quantity} Ltr</div>
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
                                            { label: 'Quantity', calculation: `${entry.quantity} Liters`, result: null },
                                            { label: 'FAT', calculation: `${entry.fat}%`, result: null },
                                            { label: 'SNF', calculation: `${entry.snf}%`, result: null },
                                            { label: 'Rate Applied', calculation: `₹${(entry.rate || entry.total_amount / entry.quantity).toFixed(2)}/L`, result: null },
                                            { label: 'Amount', calculation: `${entry.quantity}L × ₹${(entry.rate || entry.total_amount / entry.quantity).toFixed(2)}`, result: entry.total_amount }
                                        ]}
                                        netAmount={entry.total_amount}
                                        isCredit={true}
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
                    <button className="flex flex-col items-center gap-1 text-emerald-400">
                        <Droplets className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Pouring</span>
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors">
                        <Wallet className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Payments</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
