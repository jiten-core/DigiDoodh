// src/app/bills/page.tsx - Bills List View with Bulk Generation
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    Download,
    IndianRupee,
    Users,
    Ban,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    useBills,
    useFarmers,
    useMilkEntries,
    useLedgerEntries,
    useInitializeDB,
} from '@/db/hooks';
import { generateBill, cancelBill } from '@/db/operations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Bill } from '@/db/schema';

export default function BillsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all data
    const allBills = useBills(dairyId);
    const allFarmers = useFarmers(dairyId);
    const allMilkEntries = useMilkEntries(dairyId);
    const allLedgerEntries = useLedgerEntries(dairyId);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'pending' | 'paid' | 'cancelled'
    >('all');
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkCycle, setBulkCycle] = useState<
        '10-day' | '15-day' | 'monthly'
    >('monthly');

    // Filter bills
    const filteredBills = useMemo(() => {
        let filtered = [...allBills];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(
                (bill) => bill.status === statusFilter
            );
        }

        if (searchTerm) {
            filtered = filtered.filter((bill) => {
                const farmer = allFarmers.find(
                    (f) => f.id === bill.farmer_id
                );
                const farmerName =
                    farmer?.name.toLowerCase() || '';
                const billNumber =
                    bill.bill_number?.toLowerCase() || '';

                return (
                    farmerName.includes(
                        searchTerm.toLowerCase()
                    ) ||
                    billNumber.includes(
                        searchTerm.toLowerCase()
                    )
                );
            });
        }

        filtered.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        return filtered;
    }, [allBills, allFarmers, statusFilter, searchTerm]);

    // Calculate totals
    const totals = useMemo(() => {
        const pending = allBills.filter(
            (b) => b.status === 'pending'
        );
        const paid = allBills.filter(
            (b) => b.status === 'paid'
        );

        return {
            totalBills: allBills.length,
            pendingCount: pending.length,
            pendingAmount: pending.reduce(
                (sum, b) =>
                    sum + (b.net_payable - b.paid_amount),
                0
            ),
            paidCount: paid.length,
            paidAmount: paid.reduce(
                (sum, b) => sum + b.paid_amount,
                0
            ),
        };
    }, [allBills]);

    // Get farmer name by ID
    const getFarmerName = (farmerId: string) => {
        const farmer = allFarmers.find(
            (f) => f.id === farmerId
        );
        return farmer?.name || 'Unknown';
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        PAID
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        PENDING
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        CANCELLED
                    </span>
                );
            default:
                return null;
        }
    };

    // Handle bulk bill generation
    const handleBulkGenerate = useCallback(async () => {
        if (!confirm('Generate bills for ALL farmers with milk entries in this period?'))
            return;

        setIsBulkGenerating(true);
        const today = new Date();
        let periodStart: Date;
        let periodEnd: Date;

        if (bulkCycle === '10-day') {
            periodStart = new Date(today);
            periodStart.setDate(today.getDate() - 10);
            periodEnd = new Date(today);
            periodEnd.setDate(today.getDate() - 1);
        } else if (bulkCycle === '15-day') {
            periodStart = new Date(today);
            periodStart.setDate(today.getDate() - 15);
            periodEnd = new Date(today);
            periodEnd.setDate(today.getDate() - 1);
        } else {
            periodStart = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            );
            periodEnd = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );
        }

        let generated = 0;
        let skipped = 0;

        try {
            // Process each farmer
            for (const farmer of allFarmers.filter(
                (f) => f.is_active
            )) {
                // Check milk entries in period
                const farmerMilk = allMilkEntries.filter(
                    (entry) => {
                        const entryDate = new Date(
                            entry.entry_date
                        );
                        return (
                            entry.farmer_id === farmer.id &&
                            entryDate >= periodStart &&
                            entryDate <= periodEnd
                        );
                    }
                );

                if (farmerMilk.length === 0) {
                    skipped++;
                    continue;
                }

                const milkAmount = farmerMilk.reduce(
                    (sum, e) => sum + e.amount,
                    0
                );

                // Get ledger debits
                const farmerDebits = allLedgerEntries
                    .filter((entry) => {
                        const entryDate = new Date(
                            entry.entry_date
                        );
                        return (
                            entry.farmer_id === farmer.id &&
                            entry.type === 'debit' &&
                            entryDate >= periodStart &&
                            entryDate <= periodEnd
                        );
                    })
                    .reduce((sum, e) => sum + e.amount, 0);

                const netAmount = milkAmount - farmerDebits;

                if (netAmount <= 0) {
                    skipped++;
                    continue;
                }

                // Check for duplicate bills
                const existingBill = allBills.find(
                    (b) =>
                        b.farmer_id === farmer.id &&
                        b.status !== 'cancelled' &&
                        new Date(
                            b.period_start
                        ).toDateString() ===
                        periodStart.toDateString() &&
                        new Date(
                            b.period_end
                        ).toDateString() ===
                        periodEnd.toDateString()
                );

                if (existingBill) {
                    skipped++;
                    continue;
                }

                await generateBill(
                    dairyId,
                    farmer.id,
                    periodStart,
                    periodEnd,
                    netAmount,
                    userId,
                    farmerDebits
                );
                generated++;
            }

            toast({
                title: 'Bulk Bill Generation Complete!',
                description: `${generated} bill(s) generated, ${skipped} skipped (no entries or duplicate)`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error.message || 'Failed to generate bills',
                variant: 'destructive',
            });
        } finally {
            setIsBulkGenerating(false);
            setShowBulkModal(false);
        }
    }, [
        allFarmers,
        allMilkEntries,
        allLedgerEntries,
        allBills,
        bulkCycle,
        dairyId,
        userId,
        toast,
    ]);

    // Handle CSV export
    const handleExportCSV = useCallback(() => {
        const headers = [
            'Bill #',
            'Farmer',
            'Period Start',
            'Period End',
            'Total Milk (L)',
            'Gross Amount',
            'Deductions',
            'Net Payable',
            'Paid',
            'Due',
            'Status',
            'Generated On',
        ];

        const rows = filteredBills.map((bill) => [
            bill.bill_number,
            getFarmerName(bill.farmer_id),
            new Date(bill.period_start).toLocaleDateString(
                'en-IN'
            ),
            new Date(bill.period_end).toLocaleDateString(
                'en-IN'
            ),
            bill.total_milk.toFixed(2),
            bill.total_amount.toFixed(2),
            bill.deductions.toFixed(2),
            bill.net_payable.toFixed(2),
            bill.paid_amount.toFixed(2),
            (bill.net_payable - bill.paid_amount).toFixed(2),
            bill.status.toUpperCase(),
            new Date(bill.created_at).toLocaleDateString(
                'en-IN'
            ),
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.join(','))
            .join('\n');
        const blob = new Blob([csvContent], {
            type: 'text/csv',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bills_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'CSV Exported',
            description: `${filteredBills.length} bills exported`,
        });
    }, [filteredBills, toast]);

    // Handle cancel bill
    const handleCancelBill = useCallback(
        async (billId: string, billNumber: string) => {
            if (
                !confirm(
                    `Cancel Bill #${billNumber}? This cannot be undone.`
                )
            )
                return;

            try {
                await cancelBill(billId, userId);
                toast({
                    title: 'Bill Cancelled',
                    description: `Bill #${billNumber} cancelled`,
                });
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description:
                        error.message ||
                        'Failed to cancel bill',
                    variant: 'destructive',
                });
            }
        },
        [userId, toast]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">
                        Loading...
                    </div>
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
                            <FileText className="h-8 w-8 text-saffron-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Bills
                                </h1>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredBills.length} bill
                                    {filteredBills.length !== 1
                                        ? 's'
                                        : ''}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                disabled={filteredBills.length === 0}
                                className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setShowBulkModal(true)
                                }
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Zap className="h-4 w-4 mr-1" />
                                Bulk Generate
                            </Button>
                            <Button
                                onClick={() =>
                                    router.push(
                                        '/bills/generate'
                                    )
                                }
                                className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New Bill
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by farmer or bill number..."
                                className="pl-10"
                            />
                        </div>

                        <div className="flex gap-2">
                            {(
                                [
                                    'all',
                                    'pending',
                                    'paid',
                                    'cancelled',
                                ] as const
                            ).map((status) => (
                                <Button
                                    key={status}
                                    variant={
                                        statusFilter === status
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setStatusFilter(
                                            status
                                        )
                                    }
                                    size="sm"
                                    className={cn(
                                        'capitalize',
                                        statusFilter ===
                                        status &&
                                        'bg-saffron-500 hover:bg-saffron-600 text-white'
                                    )}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Bulk Generate Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Bulk Generate Bills
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Generate bills for all
                                    farmers with milk entries
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Billing Cycle
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        '10-day',
                                        '15-day',
                                        'monthly',
                                    ] as const
                                ).map((cycle) => (
                                    <button
                                        key={cycle}
                                        onClick={() =>
                                            setBulkCycle(
                                                cycle
                                            )
                                        }
                                        className={cn(
                                            'p-3 rounded-lg border-2 transition-all text-sm font-semibold capitalize',
                                            bulkCycle ===
                                                cycle
                                                ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/30 text-saffron-900 dark:text-saffron-100'
                                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 hover:border-saffron-400'
                                        )}
                                    >
                                        {cycle.replace(
                                            '-',
                                            ' '
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-6 border border-amber-200 dark:border-amber-800">
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                                ⚠️ Bills will be generated
                                for all active farmers who
                                have milk entries in the
                                selected period. Duplicate
                                bills are automatically
                                skipped.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                    setShowBulkModal(false)
                                }
                                disabled={isBulkGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-saffron-500 hover:bg-saffron-600 text-white"
                                onClick={handleBulkGenerate}
                                disabled={isBulkGenerating}
                            >
                                {isBulkGenerating ? (
                                    <>
                                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Generate All
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5">
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Total Bills
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {totals.totalBills}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 p-5">
                        <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                            Pending
                        </div>
                        <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                            {totals.pendingCount}
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                            ₹
                            {totals.pendingAmount.toLocaleString(
                                'en-IN'
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-5">
                        <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                            Paid
                        </div>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                            {totals.paidCount}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                            ₹
                            {totals.paidAmount.toLocaleString(
                                'en-IN'
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-5">
                        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                            Total Amount
                        </div>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                            ₹
                            {(
                                totals.pendingAmount +
                                totals.paidAmount
                            ).toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Bills List */}
                {filteredBills.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No bills found
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 mb-6">
                            {searchTerm ||
                                statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Generate your first bill to get started'}
                        </div>
                        {!searchTerm &&
                            statusFilter === 'all' && (
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                '/bills/generate'
                                            )
                                        }
                                        className="bg-saffron-500 hover:bg-saffron-600"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Generate Bill
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowBulkModal(
                                                true
                                            )
                                        }
                                    >
                                        <Zap className="h-5 w-5 mr-2" />
                                        Bulk Generate
                                    </Button>
                                </div>
                            )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredBills.map((bill) => (
                            <div
                                key={bill.id}
                                className={cn(
                                    'bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 hover:shadow-lg transition-all',
                                    bill.status === 'cancelled'
                                        ? 'border-red-200 dark:border-red-800 opacity-70'
                                        : bill.status === 'paid'
                                            ? 'border-green-200 dark:border-green-700'
                                            : 'border-gray-200 dark:border-gray-700'
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Bill #
                                            {bill.bill_number ||
                                                'N/A'}
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {getFarmerName(
                                                bill.farmer_id
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {new Date(
                                                bill.period_start
                                            ).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                }
                                            )}{' '}
                                            -{' '}
                                            {new Date(
                                                bill.period_end
                                            ).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {getStatusBadge(
                                        bill.status
                                    )}
                                </div>

                                {/* Amounts */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Milk:{' '}
                                            {bill.total_milk.toFixed(
                                                1
                                            )}{' '}
                                            L
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            ₹
                                            {bill.net_payable.toLocaleString(
                                                'en-IN'
                                            )}
                                        </span>
                                    </div>
                                    {bill.deductions > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">
                                                Deductions:
                                            </span>
                                            <span className="text-red-500 font-medium">
                                                -₹
                                                {bill.deductions.toLocaleString(
                                                    'en-IN'
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {bill.paid_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Paid:
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                ₹
                                                {bill.paid_amount.toLocaleString(
                                                    'en-IN'
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {bill.net_payable -
                                        bill.paid_amount >
                                        0 &&
                                        bill.status !==
                                        'cancelled' && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Due:
                                                </span>
                                                <span className="font-bold text-red-600 dark:text-red-400">
                                                    ₹
                                                    {(
                                                        bill.net_payable -
                                                        bill.paid_amount
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() =>
                                            router.push(
                                                `/bills/view?id=${bill.id}`
                                            )
                                        }
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>

                                    {bill.status ===
                                        'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                                    onClick={() =>
                                                        router.push(
                                                            `/bills/payment?id=${bill.id}`
                                                        )
                                                    }
                                                >
                                                    <IndianRupee className="h-4 w-4 mr-1" />
                                                    Pay
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-300 text-red-500 hover:bg-red-50"
                                                    onClick={() =>
                                                        handleCancelBill(
                                                            bill.id,
                                                            bill.bill_number
                                                        )
                                                    }
                                                >
                                                    <Ban className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
