// src/app/ledger/page.tsx - Immutable Append-Only Ledger View
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Plus,
    Download,
    ArrowUpCircle,
    ArrowDownCircle,
    Search,
    Link2,
    Users,
    ChevronDown,
    ChevronUp,
    Shield,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLedgerEntries, useFarmers, useFarmerBalances, useInitializeDB } from '@/db/hooks';
import { cn } from '@/lib/utils';
import type { LedgerEntry } from '@/db/schema';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

type ViewMode = 'transactions' | 'farmer_balances';

interface LedgerEntryWithBalance extends LedgerEntry {
    runningBalance: number;
    hasCorrectionLinked: boolean;
    correctionEntries: LedgerEntry[];
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    milk: { label: 'Milk', icon: '🥛' },
    payment: { label: 'Payment', icon: '💸' },
    advance: { label: 'Advance', icon: '💰' },
    loan: { label: 'Loan', icon: '🏦' },
    product: { label: 'Product', icon: '🌾' },
    correction: { label: 'Correction', icon: '✏️' },
};

function exportLedgerCSV(
    entries: LedgerEntryWithBalance[],
    getFarmerName: (id: string) => string,
    filename: string = 'ledger_export'
) {
    const headers = ['Date', 'Farmer', 'Type', 'Category', 'Credit (₹)', 'Debit (₹)', 'Balance (₹)', 'Notes', 'Reference'];
    const rows = entries.map(e => [
        new Date(e.entry_date).toLocaleDateString('en-IN'),
        getFarmerName(e.farmer_id),
        e.type.toUpperCase(),
        e.category,
        e.type === 'credit' ? e.amount.toFixed(2) : '',
        e.type === 'debit' ? e.amount.toFixed(2) : '',
        e.runningBalance.toFixed(2),
        e.notes || '',
        e.reference_id || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export default function LedgerPage() {
    const router = useRouter();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';

    // Data hooks
    const allLedgerEntries = useLedgerEntries(dairyId);
    const allFarmers = useFarmers(dairyId, false);
    const farmerBalances = useFarmerBalances(dairyId);

    // UI state
    const [viewMode, setViewMode] = useState<ViewMode>('transactions');
    const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
    const [selectedType, setSelectedType] = useState<'all' | 'credit' | 'debit'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCorrectionId, setExpandedCorrectionId] = useState<string | null>(null);

    // Get farmer name by ID
    const getFarmerName = useCallback(
        (farmerId: string) => {
            const farmer = allFarmers.find(f => f.id === farmerId);
            return farmer?.name || 'Unknown';
        },
        [allFarmers]
    );

    // Build correction lookup maps
    const { correctionMap, correctedByMap } = useMemo(() => {
        // correctionMap: originalId -> correction entries that correct it
        const cMap: Record<string, LedgerEntry[]> = {};
        // correctedByMap: correctionId -> original it references
        const cbMap: Record<string, string> = {};

        for (const entry of allLedgerEntries) {
            if (entry.correction_of_id) {
                if (!cMap[entry.correction_of_id]) {
                    cMap[entry.correction_of_id] = [];
                }
                cMap[entry.correction_of_id].push(entry);
                cbMap[entry.id] = entry.correction_of_id;
            }
        }
        return { correctionMap: cMap, correctedByMap: cbMap };
    }, [allLedgerEntries]);

    // Filter ledger entries
    const filteredEntries = useMemo(() => {
        let filtered = [...allLedgerEntries];

        if (selectedFarmerId) {
            filtered = filtered.filter(entry => entry.farmer_id === selectedFarmerId);
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(entry => entry.type === selectedType);
        }

        if (selectedCategory) {
            filtered = filtered.filter(entry => entry.category === selectedCategory);
        }

        if (dateFrom) {
            filtered = filtered.filter(
                entry => new Date(entry.entry_date) >= new Date(dateFrom)
            );
        }
        if (dateTo) {
            filtered = filtered.filter(
                entry => new Date(entry.entry_date) <= new Date(dateTo)
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(
                entry =>
                    entry.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by date (oldest first for running balance computation)
        filtered.sort(
            (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
        );

        return filtered;
    }, [allLedgerEntries, selectedFarmerId, selectedType, selectedCategory, dateFrom, dateTo, searchTerm]);

    // Running balance + correction linking
    const { totalCredit, totalDebit, runningBalance, entriesWithBalance } = useMemo(() => {
        let credit = 0;
        let debit = 0;
        let balance = 0;

        const withBalance: LedgerEntryWithBalance[] = filteredEntries.map(entry => {
            if (entry.type === 'credit') {
                credit += entry.amount;
                balance += entry.amount;
            } else {
                debit += entry.amount;
                balance -= entry.amount;
            }

            return {
                ...entry,
                runningBalance: balance,
                hasCorrectionLinked: !!(correctionMap[entry.id]?.length),
                correctionEntries: correctionMap[entry.id] || [],
            };
        });

        return {
            totalCredit: credit,
            totalDebit: debit,
            runningBalance: balance,
            entriesWithBalance: withBalance.reverse(), // newest first for display
        };
    }, [filteredEntries, correctionMap]);

    // Farmer balances for the balances view
    const farmerBalanceList = useMemo(() => {
        return allFarmers
            .map(farmer => ({
                farmer,
                ...(farmerBalances[farmer.id] || { credit: 0, debit: 0, balance: 0, lastEntry: new Date(0) }),
            }))
            .filter(fb => fb.credit > 0 || fb.debit > 0) // Only show farmers with transactions
            .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)); // Highest balance first
    }, [allFarmers, farmerBalances]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
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
                            <BookOpen className="h-8 w-8 text-saffron-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Ledger
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Shield className="h-3 w-3 text-green-500" />
                                    Append-only • Immutable • {filteredEntries.length} transactions
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push('/ledger/advance')}
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Advance
                            </Button>
                            <Button
                                onClick={() => router.push('/ledger/debit')}
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Debit
                            </Button>
                            <Button
                                variant="outline"
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                onClick={() => exportLedgerCSV(entriesWithBalance, getFarmerName)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setViewMode('transactions')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                viewMode === 'transactions'
                                    ? 'bg-saffron-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            <BookOpen className="h-4 w-4 inline mr-2" />
                            Transactions
                        </button>
                        <button
                            onClick={() => setViewMode('farmer_balances')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                viewMode === 'farmer_balances'
                                    ? 'bg-saffron-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            <Users className="h-4 w-4 inline mr-2" />
                            Farmer Balances
                        </button>
                    </div>

                    {/* Filters (transactions view only) */}
                    {viewMode === 'transactions' && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search notes..."
                                    className="pl-10"
                                />
                            </div>

                            {/* Farmer Filter */}
                            <select
                                value={selectedFarmerId}
                                onChange={e => setSelectedFarmerId(e.target.value)}
                                className="h-10 px-3 rounded-md border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value="">All Farmers</option>
                                {allFarmers.map(farmer => (
                                    <option key={farmer.id} value={farmer.id}>
                                        {farmer.name} ({farmer.farmer_code})
                                    </option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value as any)}
                                className="h-10 px-3 rounded-md border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="credit">Credit Only</option>
                                <option value="debit">Debit Only</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="h-10 px-3 rounded-md border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value="">All Categories</option>
                                {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                                    <option key={key} value={key}>
                                        {icon} {label}
                                    </option>
                                ))}
                            </select>

                            {/* Date From */}
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                placeholder="From Date"
                            />

                            {/* Date To */}
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                placeholder="To Date"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Credit */}
                    <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                                Total Credit
                            </div>
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                            ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Total Debit */}
                    <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Total Debit
                            </div>
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                            ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Net Balance
                            </div>
                            <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className={cn(
                            'text-3xl font-bold',
                            runningBalance >= 0
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-red-600 dark:text-red-400'
                        )}>
                            ₹{runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* TRANSACTIONS VIEW */}
                {/* ═══════════════════════════════════════════ */}
                {viewMode === 'transactions' && (
                    <>
                        {/* Immutability Notice */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            <span className="text-amber-800 dark:text-amber-200">
                                <strong>Immutable Ledger:</strong> Entries cannot be edited or deleted.
                                Corrections create new linked entries to maintain a full audit trail.
                            </span>
                        </div>

                        {entriesWithBalance.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                                <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No ledger entries found
                                </div>
                                <div className="text-gray-500 dark:text-gray-500 mb-6">
                                    {searchTerm || selectedFarmerId || selectedType !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Ledger entries will appear here automatically'}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Farmer
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Credit (₹)
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Debit (₹)
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Balance (₹)
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Links
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {entriesWithBalance.map(entry => (
                                                <LedgerRow
                                                    key={entry.id}
                                                    entry={entry}
                                                    getFarmerName={getFarmerName}
                                                    correctedByMap={correctedByMap}
                                                    isExpanded={expandedCorrectionId === entry.id}
                                                    onToggleExpand={() =>
                                                        setExpandedCorrectionId(
                                                            expandedCorrectionId === entry.id ? null : entry.id
                                                        )
                                                    }
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* FARMER BALANCES VIEW */}
                {/* ═══════════════════════════════════════════ */}
                {viewMode === 'farmer_balances' && (
                    <>
                        {farmerBalanceList.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No farmer balances yet
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {farmerBalanceList.map(({ farmer, credit, debit, balance, lastEntry }) => (
                                    <div
                                        key={farmer.id}
                                        className={cn(
                                            'bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 transition-all hover:shadow-lg cursor-pointer',
                                            balance > 0
                                                ? 'border-green-200 dark:border-green-800'
                                                : balance < 0
                                                    ? 'border-red-200 dark:border-red-800'
                                                    : 'border-gray-200 dark:border-gray-700'
                                        )}
                                        onClick={() => {
                                            setSelectedFarmerId(farmer.id);
                                            setViewMode('transactions');
                                        }}
                                    >
                                        {/* Farmer Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {farmer.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {farmer.farmer_code}
                                                    {farmer.village ? ` • ${farmer.village}` : ''}
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-2xl font-bold font-mono',
                                                    balance > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : balance < 0
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-gray-500'
                                                )}
                                            >
                                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                            </div>
                                        </div>

                                        {/* Credit / Debit Breakdown */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                                                <div className="text-xs text-green-600 mb-1">Credit</div>
                                                <div className="text-sm font-bold text-green-800 dark:text-green-200">
                                                    ₹{credit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                                                <div className="text-xs text-red-600 mb-1">Debit</div>
                                                <div className="text-sm font-bold text-red-800 dark:text-red-200">
                                                    ₹{debit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Last Activity */}
                                        <div className="mt-3 text-xs text-gray-400 text-right">
                                            Last activity: {lastEntry.getTime() > 0
                                                ? lastEntry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                                : 'Never'
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Footer Info */}
                <div className="text-center text-sm text-gray-500">
                    Showing {entriesWithBalance.length} of {allLedgerEntries.length} total entries
                    {viewMode === 'farmer_balances' && (
                        <span> • {farmerBalanceList.length} farmers with transactions</span>
                    )}
                </div>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════════
// LEDGER ROW with Correction Linking
// ═══════════════════════════════════════════

function LedgerRow({
    entry,
    getFarmerName,
    correctedByMap,
    isExpanded,
    onToggleExpand,
}: {
    entry: LedgerEntryWithBalance;
    getFarmerName: (id: string) => string;
    correctedByMap: Record<string, string>;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    const isCorrection = entry.category === 'correction';
    const hasCorrections = entry.hasCorrectionLinked;
    const correctedOriginalId = correctedByMap[entry.id];
    const catInfo = CATEGORY_LABELS[entry.category] || { label: entry.category, icon: '📝' };

    return (
        <>
            <tr
                className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
                    isCorrection && 'bg-amber-50/50 dark:bg-amber-900/5',
                    hasCorrections && 'border-l-4 border-l-amber-400'
                )}
            >
                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>
                        {new Date(entry.entry_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                        })}
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </td>

                {/* Farmer */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getFarmerName(entry.farmer_id)}
                </td>

                {/* Type Badge */}
                <td className="px-4 py-3 whitespace-nowrap">
                    <span
                        className={cn(
                            'px-2 py-1 rounded-full text-xs font-bold',
                            entry.type === 'credit'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                    >
                        {entry.type.toUpperCase()}
                    </span>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                        <span>{catInfo.icon}</span>
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {catInfo.label}
                        </span>
                    </div>
                    {entry.notes && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={entry.notes}>
                            {entry.notes}
                        </div>
                    )}
                    {/* Correction link badge */}
                    {isCorrection && correctedOriginalId && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Link2 className="h-3 w-3" />
                            Corrects entry
                        </div>
                    )}
                </td>

                {/* Credit */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">
                    {entry.type === 'credit' ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                </td>

                {/* Debit */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600 dark:text-red-400">
                    {entry.type === 'debit' ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                </td>

                {/* Balance */}
                <td className={cn(
                    'px-4 py-3 whitespace-nowrap text-sm text-right font-bold',
                    entry.runningBalance >= 0
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-red-600 dark:text-red-400'
                )}>
                    ₹{entry.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>

                {/* Correction Link */}
                <td className="px-4 py-3 text-center">
                    {hasCorrections ? (
                        <button
                            onClick={onToggleExpand}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors"
                            title={`${entry.correctionEntries.length} correction(s) linked`}
                        >
                            <AlertTriangle className="h-3 w-3" />
                            {entry.correctionEntries.length}
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                        </button>
                    ) : isCorrection ? (
                        <Link2 className="h-4 w-4 mx-auto text-amber-400" />
                    ) : (
                        <span className="text-gray-300">—</span>
                    )}
                </td>
            </tr>

            {/* Expanded Correction Details */}
            {hasCorrections && isExpanded && (
                <tr>
                    <td colSpan={8} className="px-0 py-0">
                        <div className="bg-amber-50/80 dark:bg-amber-900/10 border-l-4 border-l-amber-400 px-8 py-3">
                            <div className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-2">
                                🔗 Linked Corrections
                            </div>
                            <div className="space-y-2">
                                {entry.correctionEntries.map(correction => (
                                    <div
                                        key={correction.id}
                                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'px-2 py-0.5 rounded-full text-xs font-bold',
                                                    correction.type === 'credit'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                )}
                                            >
                                                {correction.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {correction.notes || 'Correction entry'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">
                                                {new Date(correction.entry_date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                })}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-sm font-bold',
                                                    correction.type === 'credit'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                )}
                                            >
                                                {correction.type === 'credit' ? '+' : '-'}₹
                                                {correction.amount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
