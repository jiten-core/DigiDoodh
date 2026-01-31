'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Droplets, Calendar, ChevronDown, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from 'framer-motion';

// Mobile-First "Milk Passbook" Interface
export default function FarmerDashboard() {
    const { user, profile, logout, loading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('month');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        // Strict Role Enforcement
        if (profile && profile.role !== 'FARMER' && profile.role !== 'PLATFORM_SUPER_ADMIN') {
            if (profile.role === 'DAIRY_OWNER') router.push('/dashboard');
        }

        if (user) {
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

            const { data } = await query;

            if (data) setEntries(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingEntries(false);
        }
    };

    // Calculate Summary Stats
    const totalMilk = entries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0).toFixed(1);
    const totalAmount = entries.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0).toFixed(0);
    const avgFat = entries.length > 0
        ? (entries.reduce((sum, e) => sum + (Number(e.fat) || 0), 0) / entries.length).toFixed(1)
        : '0.0';

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-dairy-50">
            <Loader2 className="w-10 h-10 animate-spin text-dairy-600 mb-4" />
            <p className="text-dairy-600 font-medium">Loading your passbook...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 font-sans">
            {/* 1. Header Section (Banking App Style) */}
            <div className="bg-gradient-to-br from-dairy-700 to-dairy-900 text-white rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl" />

                <div className="p-6 pt-12 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-dairy-200 text-sm font-medium mb-1">Welcome back,</p>
                            <h1 className="text-2xl font-bold tracking-tight">{profile?.name?.split(' ')[0] || 'Farmer'} Ji 🙏</h1>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Total Balance Card */}
                    <div className="mb-6">
                        <div className="text-dairy-200 text-xs font-medium uppercase tracking-wider mb-2">Estimated Earnings</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">₹ {totalAmount}</span>
                            <span className="text-sm text-dairy-300 font-medium">.00</span>
                        </div>

                        {/* Mini Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-dairy-200">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-xs font-medium">Total Milk</span>
                                </div>
                                <div className="text-lg font-bold">{totalMilk} <span className="text-xs font-medium">Ltr</span></div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1 text-dairy-200">
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
                    <Calendar className="w-5 h-5 text-dairy-600" />
                    Passbook
                </h2>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full px-4 border-dairy-200 text-dairy-700 bg-white">
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

            {/* 3. Transaction List */}
            <div className="px-4 space-y-3">
                {loadingEntries ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-neutral-200">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                            <Droplets className="w-8 h-8 text-neutral-300" />
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
                            className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100/50 flex justify-between items-center active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${entry.time === 'Morning' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'
                                    }`}>
                                    {entry.time === 'Morning' ? '☀️' : '🌙'}
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-800 text-base">
                                        {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="text-xs text-neutral-500 font-medium flex gap-2">
                                        <span>{entry.fat}% Fat</span>
                                        <span className="text-neutral-300">•</span>
                                        <span>{entry.snf}% SNF</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-dairy-700 text-lg">₹{Math.round(entry.total_amount)}</div>
                                <div className="text-xs font-medium text-neutral-400">{entry.quantity} Ltr</div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* 4. Bottom Tab Bar (Floating) */}
            <div className="fixed bottom-6 left-6 right-6">
                <div className="bg-neutral-900/90 backdrop-blur-lg text-white rounded-2xl p-4 shadow-2xl flex justify-around items-center border border-white/10">
                    <button className="flex flex-col items-center gap-1 text-saffron-400">
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
