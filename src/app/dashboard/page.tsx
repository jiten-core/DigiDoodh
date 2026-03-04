// src/app/dashboard/page.tsx - Today-Focused Dashboard with Full Stats
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Milk,
    Sun,
    Moon,
    Users,
    IndianRupee,
    Plus,
    TrendingUp,
    TrendingDown,
    Calendar,
    FileText,
    BarChart3,
    Clock,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { SyncStatusIndicator } from '@/components/sync-status';
import { Button } from '@/components/ui/button';
import {
    useDailyStats,
    useMilkEntries,
    useFarmers,
    useBills,
    useLedgerEntries,
    useInitializeDB,
} from '@/db/hooks';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const { isInitialized } = useInitializeDB();

    const dairyId = 'dairy-1';

    // Get today's stats (live query)
    const stats = useDailyStats(dairyId, new Date());

    // Get various data
    const allEntries = useMilkEntries(dairyId);
    const allFarmers = useFarmers(dairyId);
    const allBills = useBills(dairyId);
    const allLedger = useLedgerEntries(dairyId);

    // Current shift
    const currentHour = new Date().getHours();
    const currentShift = currentHour >= 5 && currentHour < 14 ? 'morning' : 'evening';

    // Farmer name lookup
    const farmerMap = useMemo(() => {
        const map: Record<string, string> = {};
        allFarmers.forEach((f) => {
            map[f.id] = f.name;
        });
        return map;
    }, [allFarmers]);

    // Recent entries with farmer names
    const recentEntries = allEntries.slice(0, 6);

    // Weekly comparison
    const weeklyStats = useMemo(() => {
        const today = new Date();
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - today.getDay());
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        const thisWeekEntries = allEntries.filter((e) => {
            const d = new Date(e.entry_date);
            return d >= startOfThisWeek && d <= today;
        });

        const lastWeekEntries = allEntries.filter((e) => {
            const d = new Date(e.entry_date);
            return d >= startOfLastWeek && d < startOfThisWeek;
        });

        const thisWeekLiters = thisWeekEntries.reduce((s, e) => s + e.quantity, 0);
        const lastWeekLiters = lastWeekEntries.reduce((s, e) => s + e.quantity, 0);
        const thisWeekAmount = thisWeekEntries.reduce((s, e) => s + e.amount, 0);
        const lastWeekAmount = lastWeekEntries.reduce((s, e) => s + e.amount, 0);

        const litersTrend =
            lastWeekLiters > 0
                ? ((thisWeekLiters - lastWeekLiters) / lastWeekLiters) * 100
                : 0;
        const amountTrend =
            lastWeekAmount > 0
                ? ((thisWeekAmount - lastWeekAmount) / lastWeekAmount) * 100
                : 0;

        return {
            thisWeekLiters,
            lastWeekLiters,
            thisWeekAmount,
            lastWeekAmount,
            litersTrend,
            amountTrend,
            thisWeekEntries: thisWeekEntries.length,
        };
    }, [allEntries]);

    // Billing stats
    const billingStats = useMemo(() => {
        const pending = allBills.filter((b: any) => b.status === 'pending');
        const paid = allBills.filter((b: any) => b.status === 'paid');

        return {
            pendingCount: pending.length,
            pendingAmount: pending.reduce(
                (s: number, b: any) => s + (b.net_payable - b.paid_amount),
                0
            ),
            paidCount: paid.length,
            paidAmount: paid.reduce((s: number, b: any) => s + b.paid_amount, 0),
            totalBills: allBills.length,
        };
    }, [allBills]);

    // Active farmers count (those with entries in last 30 days)
    const activeFarmersCount = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeIds = new Set(
            allEntries
                .filter((e) => new Date(e.entry_date) >= thirtyDaysAgo)
                .map((e) => e.farmer_id)
        );
        return activeIds.size;
    }, [allEntries]);

    // Last 7 days bar data
    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const dayEntries = allEntries.filter((e) => {
                const ed = new Date(e.entry_date);
                return (
                    ed.getFullYear() === d.getFullYear() &&
                    ed.getMonth() === d.getMonth() &&
                    ed.getDate() === d.getDate()
                );
            });

            days.push({
                label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
                date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                liters: dayEntries.reduce((s, e) => s + e.quantity, 0),
                amount: dayEntries.reduce((s, e) => s + e.amount, 0),
                entries: dayEntries.length,
                isToday: i === 0,
            });
        }
        return days;
    }, [allEntries]);

    const maxLiters = Math.max(...last7Days.map((d) => d.liters), 1);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Milk className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Milk className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                DigiDhoodh
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date().toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>

                    <SyncStatusIndicator />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Current Shift + CTA */}
                <div
                    className={cn(
                        'p-6 rounded-2xl border-2',
                        currentShift === 'morning'
                            ? 'bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-700'
                            : 'bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/30 border-indigo-300 dark:border-indigo-700'
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {currentShift === 'morning' ? (
                                <Sun className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                            ) : (
                                <Moon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            )}
                            <div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Current Shift
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                                    {currentShift}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push('/milk-entry')}
                            size="lg"
                            className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-xl"
                        >
                            <Plus className="h-6 w-6 mr-2" />
                            Add Milk Entry
                        </Button>
                    </div>
                </div>

                {/* Today's Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Morning Stats */}
                    <StatCard
                        title="☀️ Morning"
                        stats={[
                            { label: 'Entries', value: stats?.morning.entries || 0 },
                            {
                                label: 'Liters',
                                value: `${(stats?.morning.liters || 0).toFixed(1)}L`,
                            },
                            {
                                label: 'Amount',
                                value: `₹${(stats?.morning.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                            },
                        ]}
                        color="orange"
                    />

                    {/* Evening Stats */}
                    <StatCard
                        title="🌙 Evening"
                        stats={[
                            { label: 'Entries', value: stats?.evening.entries || 0 },
                            {
                                label: 'Liters',
                                value: `${(stats?.evening.liters || 0).toFixed(1)}L`,
                            },
                            {
                                label: 'Amount',
                                value: `₹${(stats?.evening.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                            },
                        ]}
                        color="green"
                    />

                    {/* Total Today */}
                    <StatCard
                        title="📊 Total Today"
                        stats={[
                            { label: 'Entries', value: stats?.totalEntries || 0 },
                            {
                                label: 'Liters',
                                value: `${(stats?.totalLiters || 0).toFixed(1)}L`,
                            },
                            {
                                label: 'Amount',
                                value: `₹${(stats?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                            },
                        ]}
                        color="blue"
                        highlighted
                    />
                </div>

                {/* Weekly Overview + Billing Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 7-Day Collection Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                Last 7 Days
                            </h2>
                            <div className="flex items-center gap-2 text-sm">
                                {weeklyStats.litersTrend !== 0 && (
                                    <span
                                        className={cn(
                                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                                            weeklyStats.litersTrend >= 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        )}
                                    >
                                        {weeklyStats.litersTrend >= 0 ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {Math.abs(weeklyStats.litersTrend).toFixed(1)}%
                                    </span>
                                )}
                                <span className="text-gray-500 dark:text-gray-400">
                                    vs last week
                                </span>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end gap-3 h-44">
                            {last7Days.map((day) => (
                                <div
                                    key={day.label}
                                    className="flex-1 flex flex-col items-center gap-2"
                                >
                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {day.liters > 0
                                            ? `${day.liters.toFixed(0)}L`
                                            : ''}
                                    </div>
                                    <div
                                        className={cn(
                                            'w-full rounded-t-lg transition-all relative group cursor-pointer',
                                            day.isToday
                                                ? 'bg-gradient-to-t from-saffron-500 to-saffron-400'
                                                : 'bg-gradient-to-t from-blue-400 to-blue-300 dark:from-blue-600 dark:to-blue-500'
                                        )}
                                        style={{
                                            height: `${Math.max((day.liters / maxLiters) * 100, 4)}%`,
                                        }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {day.date}: {day.liters.toFixed(1)}L •{' '}
                                            ₹{day.amount.toFixed(0)} •{' '}
                                            {day.entries} entries
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            'text-xs font-semibold',
                                            day.isToday
                                                ? 'text-saffron-600 dark:text-saffron-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        )}
                                    >
                                        {day.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Week totals */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <div className="text-xs text-gray-500">This Week</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {weeklyStats.thisWeekLiters.toFixed(1)}L
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Amount</div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    ₹
                                    {weeklyStats.thisWeekAmount.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Entries</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {weeklyStats.thisWeekEntries}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing & Financial Summary */}
                    <div className="space-y-4">
                        {/* Farmer Count */}
                        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-6 w-6 text-purple-500" />
                                <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                    Farmers
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {activeFarmersCount}
                                </div>
                                <div className="text-sm text-gray-500">
                                    active / {allFarmers.length} total
                                </div>
                            </div>
                        </div>

                        {/* Pending Bills Alert */}
                        {billingStats.pendingCount > 0 && (
                            <div
                                className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 p-5 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => router.push('/bills')}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                    <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                        Pending Bills
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                                    {billingStats.pendingCount}
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                    ₹
                                    {billingStats.pendingAmount.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}{' '}
                                    due
                                </div>
                            </div>
                        )}

                        {/* Paid Bills */}
                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                                    Paid Bills
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {billingStats.paidCount}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                                ₹
                                {billingStats.paidAmount.toLocaleString('en-IN', {
                                    maximumFractionDigits: 0,
                                })}{' '}
                                paid
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Entries */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-saffron-500" />
                            Recent Entries
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/milk-entry')}
                        >
                            View All
                        </Button>
                    </div>

                    {recentEntries.length === 0 ? (
                        <div className="p-12 text-center">
                            <Milk className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                No entries yet
                            </div>
                            <div className="text-gray-500 dark:text-gray-500 mb-6">
                                Start by adding your first milk entry
                            </div>
                            <Button
                                onClick={() => router.push('/milk-entry')}
                                className="bg-saffron-500 hover:bg-saffron-600"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Entry
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recentEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            {entry.shift === 'morning' ? (
                                                <Sun className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                            ) : (
                                                <Moon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                    {farmerMap[entry.farmer_id] ||
                                                        `Farmer #${entry.farmer_id.slice(0, 6)}`}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(
                                                        entry.entry_date
                                                    ).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}{' '}
                                                    •{' '}
                                                    {entry.shift === 'morning'
                                                        ? 'Morning'
                                                        : 'Evening'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {entry.quantity.toFixed(1)}L
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    FAT {(entry.fat || 0).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    ₹{entry.amount.toFixed(0)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    @₹{entry.rate.toFixed(1)}/L
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <QuickActionCard
                        title="Milk Entry"
                        icon={<Milk className="h-6 w-6" />}
                        onClick={() => router.push('/milk-entry')}
                        color="saffron"
                    />
                    <QuickActionCard
                        title="Farmers"
                        icon={<Users className="h-6 w-6" />}
                        onClick={() => router.push('/farmers')}
                        color="purple"
                    />
                    <QuickActionCard
                        title="Ledger"
                        icon={<IndianRupee className="h-6 w-6" />}
                        onClick={() => router.push('/ledger')}
                        color="blue"
                    />
                    <QuickActionCard
                        title="Bills"
                        icon={<FileText className="h-6 w-6" />}
                        onClick={() => router.push('/bills')}
                        color="green"
                    />
                    <QuickActionCard
                        title="Reports"
                        icon={<BarChart3 className="h-6 w-6" />}
                        onClick={() => router.push('/reports')}
                        color="orange"
                    />
                </div>
            </main>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    stats,
    color,
    highlighted = false,
}: {
    title: string;
    stats: { label: string; value: string | number }[];
    color: 'orange' | 'green' | 'blue';
    highlighted?: boolean;
}) {
    const colorClasses = {
        orange: 'bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-orange-200 dark:border-orange-800',
        green: 'bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-green-200 dark:border-green-800',
        blue: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-blue-200 dark:border-blue-800',
    };

    return (
        <div
            className={cn(
                'p-5 rounded-2xl border-2',
                colorClasses[color],
                highlighted && 'ring-4 ring-blue-500/20 shadow-xl'
            )}
        >
            <div className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
                {title}
            </div>

            <div className="space-y-2">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.label}
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Quick Action Card
function QuickActionCard({
    title,
    icon,
    onClick,
    color,
}: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}) {
    return (
        <button
            onClick={onClick}
            className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-saffron-500 dark:hover:border-saffron-500 hover:shadow-lg transition-all text-left"
        >
            <div className="text-gray-600 dark:text-gray-400 mb-2">{icon}</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {title}
            </div>
        </button>
    );
}
