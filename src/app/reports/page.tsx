// src/app/reports/page.tsx - Reports & Analytics (Real Data)
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    ArrowLeft,
    Download,
    TrendingUp,
    TrendingDown,
    Milk,
    IndianRupee,
    Users,
    FileText,
    Sun,
    Moon,
    Calendar,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useMilkEntries,
    useFarmers,
    useBills,
    useLedgerEntries,
    useInitializeDB,
} from '@/db/hooks';
import { cn } from '@/lib/utils';

type Period = '7days' | '15days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';
type Tab = 'overview' | 'collection' | 'financial' | 'farmers';

export default function ReportsPage() {
    const router = useRouter();
    const { isInitialized } = useInitializeDB();

    const dairyId = 'dairy-1';

    // Data hooks
    const allMilkEntries = useMilkEntries(dairyId);
    const allFarmers = useFarmers(dairyId);
    const allBills = useBills(dairyId);
    const allLedger = useLedgerEntries(dairyId);

    // Filter state
    const [period, setPeriod] = useState<Period>('30days');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Compute date range
    const dateRange = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end: Date = new Date(now);
        end.setHours(23, 59, 59, 999);

        switch (period) {
            case '7days':
                start = new Date(now);
                start.setDate(now.getDate() - 7);
                break;
            case '15days':
                start = new Date(now);
                start.setDate(now.getDate() - 15);
                break;
            case '30days':
                start = new Date(now);
                start.setDate(now.getDate() - 30);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case 'custom':
                start = customStart ? new Date(customStart) : new Date(now);
                end = customEnd ? new Date(customEnd) : new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                start = new Date(now);
                start.setDate(now.getDate() - 30);
        }

        start.setHours(0, 0, 0, 0);
        return { start, end };
    }, [period, customStart, customEnd]);

    // Filter entries by date range
    const filteredMilk = useMemo(
        () =>
            allMilkEntries.filter((e) => {
                const d = new Date(e.entry_date);
                return d >= dateRange.start && d <= dateRange.end;
            }),
        [allMilkEntries, dateRange]
    );

    const filteredLedger = useMemo(
        () =>
            allLedger.filter((e) => {
                const d = new Date(e.entry_date);
                return d >= dateRange.start && d <= dateRange.end;
            }),
        [allLedger, dateRange]
    );

    const filteredBills = useMemo(
        () =>
            allBills.filter((b: any) => {
                const d = new Date(b.created_at);
                return d >= dateRange.start && d <= dateRange.end;
            }),
        [allBills, dateRange]
    );

    // Farmer name map
    const farmerMap = useMemo(() => {
        const map: Record<string, string> = {};
        allFarmers.forEach((f) => {
            map[f.id] = f.name;
        });
        return map;
    }, [allFarmers]);

    // =================== OVERVIEW STATS ===================
    const overviewStats = useMemo(() => {
        const totalMilk = filteredMilk.reduce((s, e) => s + e.quantity, 0);
        const totalAmount = filteredMilk.reduce((s, e) => s + e.amount, 0);
        const morningMilk = filteredMilk
            .filter((e) => e.shift === 'morning')
            .reduce((s, e) => s + e.quantity, 0);
        const eveningMilk = filteredMilk
            .filter((e) => e.shift === 'evening')
            .reduce((s, e) => s + e.quantity, 0);
        const avgFat =
            filteredMilk.length > 0
                ? filteredMilk.reduce((s, e) => s + (e.fat || 0), 0) /
                filteredMilk.length
                : 0;
        const avgSnf =
            filteredMilk.length > 0
                ? filteredMilk.reduce((s, e) => s + (e.snf || 0), 0) /
                filteredMilk.length
                : 0;

        const daysDiff = Math.max(
            1,
            Math.ceil(
                (dateRange.end.getTime() - dateRange.start.getTime()) /
                (1000 * 60 * 60 * 24)
            )
        );
        const avgLitersPerDay = totalMilk / daysDiff;

        const credits = filteredLedger
            .filter((e) => e.type === 'credit')
            .reduce((s, e) => s + e.amount, 0);
        const debits = filteredLedger
            .filter((e) => e.type === 'debit')
            .reduce((s, e) => s + e.amount, 0);

        const pendingBills = filteredBills.filter(
            (b: any) => b.status === 'pending'
        );
        const paidBills = filteredBills.filter(
            (b: any) => b.status === 'paid'
        );

        const uniqueFarmers = new Set(filteredMilk.map((e) => e.farmer_id));

        return {
            totalMilk,
            totalAmount,
            morningMilk,
            eveningMilk,
            avgFat,
            avgSnf,
            avgLitersPerDay,
            totalEntries: filteredMilk.length,
            credits,
            debits,
            netFinancial: credits - debits,
            pendingBills: pendingBills.length,
            pendingAmount: pendingBills.reduce(
                (s: number, b: any) => s + (b.net_payable - b.paid_amount),
                0
            ),
            paidBills: paidBills.length,
            paidAmount: paidBills.reduce(
                (s: number, b: any) => s + b.paid_amount,
                0
            ),
            activeFarmers: uniqueFarmers.size,
            totalFarmers: allFarmers.length,
            daysDiff,
        };
    }, [filteredMilk, filteredLedger, filteredBills, allFarmers, dateRange]);

    // =================== DAILY DATA ===================
    const dailyData = useMemo(() => {
        const days: {
            date: string;
            label: string;
            liters: number;
            amount: number;
            entries: number;
        }[] = [];

        const current = new Date(dateRange.start);
        while (current <= dateRange.end) {
            const dayStart = new Date(current);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(current);
            dayEnd.setHours(23, 59, 59, 999);

            const dayEntries = filteredMilk.filter((e) => {
                const d = new Date(e.entry_date);
                return d >= dayStart && d <= dayEnd;
            });

            days.push({
                date: current.toISOString().split('T')[0],
                label: current.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                }),
                liters: dayEntries.reduce((s, e) => s + e.quantity, 0),
                amount: dayEntries.reduce((s, e) => s + e.amount, 0),
                entries: dayEntries.length,
            });

            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [filteredMilk, dateRange]);

    const maxDailyLiters = Math.max(...dailyData.map((d) => d.liters), 1);

    // =================== FARMER-WISE DATA ===================
    const farmerWiseData = useMemo(() => {
        const farmerStats: Record<
            string,
            { name: string; liters: number; amount: number; entries: number; avgFat: number }
        > = {};

        filteredMilk.forEach((entry) => {
            if (!farmerStats[entry.farmer_id]) {
                farmerStats[entry.farmer_id] = {
                    name: farmerMap[entry.farmer_id] || 'Unknown',
                    liters: 0,
                    amount: 0,
                    entries: 0,
                    avgFat: 0,
                };
            }
            farmerStats[entry.farmer_id].liters += entry.quantity;
            farmerStats[entry.farmer_id].amount += entry.amount;
            farmerStats[entry.farmer_id].entries += 1;
            farmerStats[entry.farmer_id].avgFat += entry.fat || 0;
        });

        // Calculate avg fat
        Object.values(farmerStats).forEach((f) => {
            if (f.entries > 0) f.avgFat = f.avgFat / f.entries;
        });

        return Object.values(farmerStats).sort(
            (a, b) => b.liters - a.liters
        );
    }, [filteredMilk, farmerMap]);

    // =================== CSV EXPORT ===================
    const handleExportCSV = useCallback(
        (type: 'daily' | 'farmer' | 'ledger') => {
            let csvContent = '';

            if (type === 'daily') {
                const headers = ['Date', 'Liters', 'Amount (₹)', 'Entries'];
                const rows = dailyData.map((d) => [
                    d.date,
                    d.liters.toFixed(2),
                    d.amount.toFixed(2),
                    d.entries.toString(),
                ]);
                csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
            } else if (type === 'farmer') {
                const headers = [
                    'Farmer',
                    'Liters',
                    'Amount (₹)',
                    'Entries',
                    'Avg FAT',
                ];
                const rows = farmerWiseData.map((f) => [
                    f.name,
                    f.liters.toFixed(2),
                    f.amount.toFixed(2),
                    f.entries.toString(),
                    f.avgFat.toFixed(1),
                ]);
                csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
            } else {
                const headers = ['Date', 'Type', 'Category', 'Amount (₹)', 'Notes'];
                const rows = filteredLedger.map((e) => [
                    new Date(e.entry_date).toLocaleDateString('en-IN'),
                    e.type,
                    e.category,
                    e.amount.toFixed(2),
                    e.notes || '',
                ]);
                csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
            }

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${type}_${dateRange.start.toISOString().split('T')[0]}_to_${dateRange.end.toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        [dailyData, farmerWiseData, filteredLedger, dateRange]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/dashboard')}
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <BarChart3 className="h-8 w-8 text-blue-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Reports & Analytics
                                </h1>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {dateRange.start.toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}{' '}
                                    —{' '}
                                    {dateRange.end.toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportCSV('daily')}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Daily CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportCSV('farmer')}
                                className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Farmer CSV
                            </Button>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {(
                            [
                                { value: '7days', label: '7 Days' },
                                { value: '15days', label: '15 Days' },
                                { value: '30days', label: '30 Days' },
                                { value: 'thisMonth', label: 'This Month' },
                                { value: 'lastMonth', label: 'Last Month' },
                                { value: 'custom', label: 'Custom' },
                            ] as const
                        ).map((p) => (
                            <Button
                                key={p.value}
                                variant={period === p.value ? 'default' : 'outline'}
                                onClick={() => setPeriod(p.value)}
                                size="sm"
                                className={cn(
                                    period === p.value &&
                                    'bg-saffron-500 hover:bg-saffron-600 text-white'
                                )}
                            >
                                {p.label}
                            </Button>
                        ))}

                        {period === 'custom' && (
                            <div className="flex items-center gap-2 ml-2">
                                <Input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="h-8 w-36"
                                />
                                <span className="text-gray-500">to</span>
                                <Input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="h-8 w-36"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                    {(
                        [
                            { value: 'overview', label: 'Overview', icon: BarChart3 },
                            { value: 'collection', label: 'Collection', icon: Milk },
                            { value: 'financial', label: 'Financial', icon: IndianRupee },
                            { value: 'farmers', label: 'Farmer-wise', icon: Users },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2',
                                activeTab === tab.value
                                    ? 'bg-saffron-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* =================== OVERVIEW TAB =================== */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Primary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Milk className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Total Milk
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {overviewStats.totalMilk.toLocaleString('en-IN', {
                                        maximumFractionDigits: 1,
                                    })}
                                    <span className="text-sm text-gray-500 ml-1">L</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Avg {overviewStats.avgLitersPerDay.toFixed(1)} L/day
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <IndianRupee className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                        Milk Revenue
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    ₹
                                    {overviewStats.totalAmount.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {overviewStats.totalEntries} entries
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                        Active Farmers
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {overviewStats.activeFarmers}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    of {overviewStats.totalFarmers} registered
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-yellow-600" />
                                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                        Pending Bills
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {overviewStats.pendingBills}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    ₹
                                    {overviewStats.pendingAmount.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}{' '}
                                    due
                                </div>
                            </div>
                        </div>

                        {/* Morning vs Evening + Quality */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Morning vs Evening
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-orange-600 flex items-center gap-1">
                                                <Sun className="h-4 w-4" /> Morning
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {overviewStats.morningMilk.toFixed(1)} L
                                                <span className="text-gray-400 font-normal ml-1">
                                                    (
                                                    {overviewStats.totalMilk > 0
                                                        ? (
                                                            (overviewStats.morningMilk /
                                                                overviewStats.totalMilk) *
                                                            100
                                                        ).toFixed(0)
                                                        : 0}
                                                    %)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                                                style={{
                                                    width: `${overviewStats.totalMilk > 0 ? (overviewStats.morningMilk / overviewStats.totalMilk) * 100 : 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-indigo-600 flex items-center gap-1">
                                                <Moon className="h-4 w-4" /> Evening
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {overviewStats.eveningMilk.toFixed(1)} L
                                                <span className="text-gray-400 font-normal ml-1">
                                                    (
                                                    {overviewStats.totalMilk > 0
                                                        ? (
                                                            (overviewStats.eveningMilk /
                                                                overviewStats.totalMilk) *
                                                            100
                                                        ).toFixed(0)
                                                        : 0}
                                                    %)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all"
                                                style={{
                                                    width: `${overviewStats.totalMilk > 0 ? (overviewStats.eveningMilk / overviewStats.totalMilk) * 100 : 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Milk Quality
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                                            {overviewStats.avgFat.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Average FAT
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                            {overviewStats.avgSnf.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Average SNF
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                                    <div className="text-sm text-gray-500">
                                        Average Rate
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        ₹
                                        {overviewStats.totalMilk > 0
                                            ? (
                                                overviewStats.totalAmount /
                                                overviewStats.totalMilk
                                            ).toFixed(2)
                                            : '0.00'}
                                        <span className="text-sm text-gray-400 ml-1">
                                            /L
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Farmers */}
                        {farmerWiseData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    🏆 Top Contributing Farmers
                                </h3>
                                <div className="space-y-3">
                                    {farmerWiseData.slice(0, 5).map((farmer, idx) => (
                                        <div
                                            key={farmer.name}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white',
                                                    idx === 0
                                                        ? 'bg-yellow-500'
                                                        : idx === 1
                                                            ? 'bg-gray-400'
                                                            : idx === 2
                                                                ? 'bg-amber-700'
                                                                : 'bg-gray-300'
                                                )}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {farmer.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {farmer.entries} entries • FAT{' '}
                                                    {farmer.avgFat.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900 dark:text-gray-100">
                                                    {farmer.liters.toFixed(1)} L
                                                </div>
                                                <div className="text-xs text-green-600">
                                                    ₹
                                                    {farmer.amount.toLocaleString('en-IN', {
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =================== COLLECTION TAB =================== */}
                {activeTab === 'collection' && (
                    <div className="space-y-6">
                        {/* Daily Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Daily Milk Collection
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportCSV('daily')}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                            </div>

                            <div className="flex items-end gap-1 h-52 overflow-x-auto pb-2">
                                {dailyData.map((day) => (
                                    <div
                                        key={day.date}
                                        className="flex-1 min-w-[16px] max-w-[40px] flex flex-col items-center gap-1"
                                    >
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-t-md relative group cursor-pointer hover:from-blue-600 hover:to-blue-400 transition-all"
                                            style={{
                                                height: `${Math.max((day.liters / maxDailyLiters) * 100, 2)}%`,
                                            }}
                                        >
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {day.label}: {day.liters.toFixed(1)}L •
                                                ₹{day.amount.toFixed(0)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* X-axis labels — show every N days */}
                            <div className="flex gap-1 overflow-x-auto mt-1">
                                {dailyData
                                    .filter(
                                        (_, i) =>
                                            i % Math.max(Math.floor(dailyData.length / 10), 1) ===
                                            0
                                    )
                                    .map((day) => (
                                        <div
                                            key={day.date}
                                            className="text-[10px] text-gray-500 whitespace-nowrap flex-1 text-center"
                                        >
                                            {day.label}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Daily Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 pb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Daily Breakdown
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                                                Date
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                Entries
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                Liters
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                Amount (₹)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {dailyData
                                            .filter((d) => d.entries > 0)
                                            .reverse()
                                            .map((day) => (
                                                <tr
                                                    key={day.date}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                                >
                                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                                        {day.label}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                                                        {day.entries}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-gray-100">
                                                        {day.liters.toFixed(1)} L
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-green-600 dark:text-green-400">
                                                        ₹
                                                        {day.amount.toLocaleString('en-IN', {
                                                            maximumFractionDigits: 0,
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t-2">
                                        <tr>
                                            <td className="px-4 py-3">TOTAL</td>
                                            <td className="px-4 py-3 text-right">
                                                {overviewStats.totalEntries}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {overviewStats.totalMilk.toFixed(1)} L
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                ₹
                                                {overviewStats.totalAmount.toLocaleString(
                                                    'en-IN',
                                                    { maximumFractionDigits: 0 }
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== FINANCIAL TAB =================== */}
                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        {/* Financial Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-6 text-center">
                                <div className="text-sm font-semibold text-green-600 mb-2">
                                    Total Credits
                                </div>
                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                    ₹
                                    {overviewStats.credits.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </div>
                                <div className="text-xs text-green-500 mt-1">
                                    Milk + Advances
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6 text-center">
                                <div className="text-sm font-semibold text-red-600 mb-2">
                                    Total Debits
                                </div>
                                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                                    ₹
                                    {overviewStats.debits.toLocaleString('en-IN', {
                                        maximumFractionDigits: 0,
                                    })}
                                </div>
                                <div className="text-xs text-red-500 mt-1">
                                    Payments + Deductions
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 text-center">
                                <div className="text-sm font-semibold text-blue-600 mb-2">
                                    Net Balance
                                </div>
                                <div
                                    className={cn(
                                        'text-3xl font-bold',
                                        overviewStats.netFinancial >= 0
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                    )}
                                >
                                    ₹
                                    {Math.abs(overviewStats.netFinancial).toLocaleString(
                                        'en-IN',
                                        { maximumFractionDigits: 0 }
                                    )}
                                </div>
                                <div className="text-xs text-blue-500 mt-1">
                                    {overviewStats.netFinancial >= 0
                                        ? 'Payable to Farmers'
                                        : 'Overpaid'}
                                </div>
                            </div>
                        </div>

                        {/* Billing Status */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Billing Status
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {allBills.length}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Bills</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                        {overviewStats.pendingBills}
                                    </div>
                                    <div className="text-sm text-yellow-600">Pending</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {overviewStats.paidBills}
                                    </div>
                                    <div className="text-sm text-green-600">Paid</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                        ₹
                                        {overviewStats.pendingAmount.toLocaleString(
                                            'en-IN',
                                            { maximumFractionDigits: 0 }
                                        )}
                                    </div>
                                    <div className="text-sm text-red-600">Amount Due</div>
                                </div>
                            </div>
                        </div>

                        {/* Ledger Export */}
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => handleExportCSV('ledger')}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Full Ledger for Period
                            </Button>
                        </div>
                    </div>
                )}

                {/* =================== FARMER-WISE TAB =================== */}
                {activeTab === 'farmers' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 pb-3 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Farmer-wise Collection
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportCSV('farmer')}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                            </div>

                            {farmerWiseData.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <div className="text-gray-500">
                                        No milk entries for this period
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Farmer
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Entries
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Total Milk (L)
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Avg FAT
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Avg Rate
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Amount (₹)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {farmerWiseData.map((farmer, idx) => (
                                                <tr
                                                    key={farmer.name}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                                >
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                        {farmer.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                        {farmer.entries}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">
                                                        {farmer.liters.toFixed(1)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">
                                                        {farmer.avgFat.toFixed(1)}%
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                        ₹
                                                        {farmer.liters > 0
                                                            ? (
                                                                farmer.amount / farmer.liters
                                                            ).toFixed(2)
                                                            : '0.00'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                                                        ₹
                                                        {farmer.amount.toLocaleString('en-IN', {
                                                            maximumFractionDigits: 0,
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t-2">
                                            <tr>
                                                <td className="px-4 py-3" colSpan={2}>
                                                    TOTAL ({farmerWiseData.length} farmers)
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {overviewStats.totalEntries}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {overviewStats.totalMilk.toFixed(1)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-amber-600">
                                                    {overviewStats.avgFat.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    ₹
                                                    {overviewStats.totalMilk > 0
                                                        ? (
                                                            overviewStats.totalAmount /
                                                            overviewStats.totalMilk
                                                        ).toFixed(2)
                                                        : '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-green-600">
                                                    ₹
                                                    {overviewStats.totalAmount.toLocaleString(
                                                        'en-IN',
                                                        { maximumFractionDigits: 0 }
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
