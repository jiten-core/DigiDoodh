// src/app/bills/view/page.tsx - View Bill Details (print-friendly + PDF)
'use client';

import { Suspense, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FileText,
    ArrowLeft,
    Download,
    Printer,
    IndianRupee,
    CheckCircle,
    Clock,
    XCircle,
    Share2,
    Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useBills,
    useFarmers,
    useMilkEntries,
    useLedgerEntries,
    useInitializeDB,
} from '@/db/hooks';
import { cancelBill } from '@/db/operations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ViewBillPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <FileText className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                        <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                </div>
            }
        >
            <ViewBillContent />
        </Suspense>
    );
}

function ViewBillContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();
    const billRef = useRef<HTMLDivElement>(null);

    const billId = searchParams.get('id');

    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all data
    const allBills = useBills(dairyId);
    const allFarmers = useFarmers(dairyId);
    const allMilkEntries = useMilkEntries(dairyId);
    const allLedgerEntries = useLedgerEntries(dairyId);

    // Find this bill
    const bill = allBills.find((b: any) => b.id === billId);
    const farmer = bill
        ? allFarmers.find((f: any) => f.id === bill.farmer_id)
        : null;

    // Get bill entries
    const billData = useMemo(() => {
        if (!bill || !farmer) return null;

        const startDate = new Date(bill.period_start);
        const endDate = new Date(bill.period_end);

        // Get milk entries sorted by date
        const milkEntries = allMilkEntries
            .filter((entry) => {
                const entryDate = new Date(entry.entry_date);
                return (
                    entry.farmer_id === farmer.id &&
                    entryDate >= startDate &&
                    entryDate <= endDate
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.entry_date).getTime() -
                    new Date(b.entry_date).getTime()
            );

        // Get ledger entries
        const ledgerEntries = allLedgerEntries.filter((entry) => {
            const entryDate = new Date(entry.entry_date);
            return (
                entry.farmer_id === farmer.id &&
                entryDate >= startDate &&
                entryDate <= endDate
            );
        });

        // Calculate totals
        const totalMilk = milkEntries.reduce(
            (sum, e) => sum + e.quantity,
            0
        );
        const milkAmount = milkEntries.reduce(
            (sum, e) => sum + e.amount,
            0
        );
        const avgRate =
            totalMilk > 0 ? milkAmount / totalMilk : 0;
        const avgFat =
            milkEntries.length > 0
                ? milkEntries.reduce((sum, e) => sum + (e.fat || 0), 0) /
                milkEntries.length
                : 0;

        const credits = ledgerEntries
            .filter(
                (e) => e.type === 'credit' && e.category !== 'milk'
            )
            .reduce((sum, e) => sum + e.amount, 0);

        const debitEntries = ledgerEntries.filter(
            (e) => e.type === 'debit'
        );
        const debits = debitEntries.reduce(
            (sum, e) => sum + e.amount,
            0
        );

        // Morning/Evening summaries
        const morningEntries = milkEntries.filter(
            (e) => e.shift === 'morning'
        );
        const eveningEntries = milkEntries.filter(
            (e) => e.shift === 'evening'
        );

        return {
            milkEntries,
            ledgerEntries,
            debitEntries,
            totalMilk,
            milkAmount,
            avgRate,
            avgFat,
            credits,
            debits,
            morningMilk: morningEntries.reduce(
                (sum, e) => sum + e.quantity,
                0
            ),
            eveningMilk: eveningEntries.reduce(
                (sum, e) => sum + e.quantity,
                0
            ),
            morningAmount: morningEntries.reduce(
                (sum, e) => sum + e.amount,
                0
            ),
            eveningAmount: eveningEntries.reduce(
                (sum, e) => sum + e.amount,
                0
            ),
        };
    }, [bill, farmer, allMilkEntries, allLedgerEntries]);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle CSV export
    const handleExportCSV = useCallback(() => {
        if (!billData || !farmer || !bill) return;

        const headers = [
            'Date',
            'Shift',
            'Quantity (L)',
            'FAT',
            'SNF',
            'Rate (₹/L)',
            'Amount (₹)',
        ];
        const rows = billData.milkEntries.map((entry) => [
            new Date(entry.entry_date).toLocaleDateString('en-IN'),
            entry.shift.charAt(0).toUpperCase() + entry.shift.slice(1),
            entry.quantity.toFixed(2),
            (entry.fat || 0).toFixed(1),
            (entry.snf || 0).toFixed(1),
            entry.rate.toFixed(2),
            entry.amount.toFixed(2),
        ]);

        rows.push(['', '', '', '', '', '', '']);
        rows.push([
            'TOTAL',
            '',
            billData.totalMilk.toFixed(2),
            '',
            '',
            billData.avgRate.toFixed(2),
            billData.milkAmount.toFixed(2),
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
        a.download = `bill_${bill.bill_number}_${farmer.name.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'CSV Exported',
            description: `Bill data exported successfully`,
        });
    }, [billData, farmer, bill, toast]);

    // Handle cancel
    const handleCancel = useCallback(async () => {
        if (
            !bill ||
            !confirm(
                'Are you sure you want to cancel this bill? This action cannot be undone.'
            )
        )
            return;

        try {
            await cancelBill(bill.id, userId);
            toast({
                title: 'Bill Cancelled',
                description: `Bill #${bill.bill_number} has been cancelled`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to cancel bill',
                variant: 'destructive',
            });
        }
    }, [bill, userId, toast]);

    // Handle WhatsApp share
    const handleShare = useCallback(() => {
        if (!bill || !farmer || !billData) return;

        const shareText = [
            `🥛 *DigiDhoodh Bill*`,
            `Bill #${bill.bill_number}`,
            ``,
            `👤 *${farmer.name}*`,
            `📅 ${new Date(bill.period_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(bill.period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
            ``,
            `🥛 Total Milk: ${billData.totalMilk.toFixed(2)} L`,
            `💰 Milk Amount: ₹${billData.milkAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            billData.debits > 0
                ? `➖ Deductions: ₹${billData.debits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '',
            ``,
            `✅ *Net Payable: ₹${bill.net_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}*`,
            bill.paid_amount > 0
                ? `💳 Paid: ₹${bill.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '',
            bill.total_amount - bill.paid_amount > 0 && bill.status !== 'cancelled'
                ? `⏳ Due: ₹${(bill.net_payable - bill.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '',
            ``,
            `— DigiDhoodh`,
        ]
            .filter(Boolean)
            .join('\n');

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }, [bill, farmer, billData]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!bill || !farmer || !billData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-semibold text-gray-600 mb-2">
                        Bill not found
                    </div>
                    <Button onClick={() => router.push('/bills')}>
                        Go Back to Bills
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header - Hide on print */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/bills')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <FileText className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Bill #{bill.bill_number}
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {farmer.name}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                        {bill.status === 'pending' && (
                            <>
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/bills/payment?id=${bill.id}`
                                        )
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    size="sm"
                                >
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    Pay
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Cancel
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                            <Share2 className="h-4 w-4 mr-1" />
                            WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                        </Button>
                    </div>
                </div>
            </header>

            {/* Bill Content - Print-friendly */}
            <main className="max-w-5xl mx-auto px-4 py-6 print:px-8 print:py-4">
                <div
                    ref={billRef}
                    className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 print:border-0 print:shadow-none"
                >
                    {/* Bill Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
                        <div>
                            <div className="text-3xl font-bold text-saffron-600 mb-2">
                                🥛 DigiDhoodh
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Dairy Management System
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                BILL #{bill.bill_number}
                            </div>
                            <div
                                className={cn(
                                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold',
                                    bill.status === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : bill.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                )}
                            >
                                {bill.status === 'paid' && (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                {bill.status === 'pending' && (
                                    <Clock className="h-4 w-4" />
                                )}
                                {bill.status === 'cancelled' && (
                                    <XCircle className="h-4 w-4" />
                                )}
                                {bill.status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Farmer & Period Info */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                BILL TO:
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {farmer.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Code: {farmer.farmer_code}
                                </div>
                                {farmer.phone && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Phone: {farmer.phone}
                                    </div>
                                )}
                                {farmer.village && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Village: {farmer.village}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                BILLING PERIOD:
                            </div>
                            <div className="space-y-1">
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {new Date(
                                        bill.period_start
                                    ).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    to
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {new Date(
                                        bill.period_end
                                    ).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milk Collection Summary Cards */}
                    <div className="mb-6">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Milk Collection Summary
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                    Total Entries
                                </div>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {billData.milkEntries.length}
                                </div>
                            </div>
                            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-800">
                                <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                                    Total Milk
                                </div>
                                <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                                    {billData.totalMilk.toFixed(2)}{' '}
                                    <span className="text-sm">L</span>
                                </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                    Avg. FAT
                                </div>
                                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                    {billData.avgFat.toFixed(1)}%
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                                    Milk Amount
                                </div>
                                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    ₹
                                    {billData.milkAmount.toLocaleString(
                                        'en-IN',
                                        {
                                            minimumFractionDigits: 2,
                                        }
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Morning/Evening split */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="bg-orange-50/60 dark:bg-orange-900/10 rounded-lg p-3 border border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
                                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                    ☀️ Morning
                                </span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {billData.morningMilk.toFixed(2)} L
                                    <span className="text-sm text-gray-500 ml-2">
                                        (₹
                                        {billData.morningAmount.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                        )
                                    </span>
                                </span>
                            </div>
                            <div className="bg-indigo-50/60 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                    🌙 Evening
                                </span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {billData.eveningMilk.toFixed(2)} L
                                    <span className="text-sm text-gray-500 ml-2">
                                        (₹
                                        {billData.eveningAmount.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                        )
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Milk Entries Table */}
                    {billData.milkEntries.length > 0 && (
                        <div className="mb-8">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Daily Milk Entries
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                #
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                Date
                                            </th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                Shift
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                Qty (L)
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                FAT
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                SNF
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                Rate
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {billData.milkEntries.map(
                                            (entry, idx) => (
                                                <tr
                                                    key={entry.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                                >
                                                    <td className="px-3 py-2 text-gray-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                        {new Date(
                                                            entry.entry_date
                                                        ).toLocaleDateString(
                                                            'en-IN',
                                                            {
                                                                day: '2-digit',
                                                                month: 'short',
                                                            }
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span
                                                            className={cn(
                                                                'text-xs font-bold px-2 py-0.5 rounded-full',
                                                                entry.shift ===
                                                                    'morning'
                                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                            )}
                                                        >
                                                            {entry.shift ===
                                                                'morning'
                                                                ? 'AM'
                                                                : 'PM'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                        {entry.quantity.toFixed(
                                                            2
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                                                        {(
                                                            entry.fat || 0
                                                        ).toFixed(1)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                                                        {(
                                                            entry.snf || 0
                                                        ).toFixed(1)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                                                        ₹{entry.rate.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-gray-100">
                                                        ₹
                                                        {entry.amount.toLocaleString(
                                                            'en-IN',
                                                            {
                                                                minimumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-900/50 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                                        <tr>
                                            <td
                                                className="px-3 py-3 text-gray-900 dark:text-gray-100"
                                                colSpan={3}
                                            >
                                                TOTAL
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-900 dark:text-gray-100">
                                                {billData.totalMilk.toFixed(
                                                    2
                                                )}{' '}
                                                L
                                            </td>
                                            <td
                                                className="px-3 py-3"
                                                colSpan={2}
                                            ></td>
                                            <td className="px-3 py-3 text-right text-sm text-gray-500">
                                                avg ₹
                                                {billData.avgRate.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right text-green-600 dark:text-green-400">
                                                ₹
                                                {billData.milkAmount.toLocaleString(
                                                    'en-IN',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Deductions Detail */}
                    {billData.debitEntries.length > 0 && (
                        <div className="mb-6">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Deductions
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                                <table className="w-full text-sm">
                                    <thead className="bg-red-50 dark:bg-red-900/20">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-red-700 dark:text-red-300 uppercase">
                                                Date
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-red-700 dark:text-red-300 uppercase">
                                                Category
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-red-700 dark:text-red-300 uppercase">
                                                Notes
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-red-700 dark:text-red-300 uppercase">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                        {billData.debitEntries.map(
                                            (entry) => (
                                                <tr key={entry.id}>
                                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                                        {new Date(
                                                            entry.entry_date
                                                        ).toLocaleDateString(
                                                            'en-IN',
                                                            {
                                                                day: '2-digit',
                                                                month: 'short',
                                                            }
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 capitalize text-gray-700 dark:text-gray-300">
                                                        {entry.category}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">
                                                        {entry.notes || '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-red-600 dark:text-red-400">
                                                        -₹
                                                        {entry.amount.toLocaleString(
                                                            'en-IN',
                                                            {
                                                                minimumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    <tfoot className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                                        <tr>
                                            <td
                                                className="px-4 py-2 font-bold text-red-700 dark:text-red-300"
                                                colSpan={3}
                                            >
                                                Total Deductions
                                            </td>
                                            <td className="px-4 py-2 text-right font-bold text-red-600 dark:text-red-400">
                                                -₹
                                                {billData.debits.toLocaleString(
                                                    'en-IN',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Bill Breakdown */}
                    <div className="mb-8">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Bill Summary
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        Amount (₹)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                        Milk Collection (
                                        {billData.totalMilk.toFixed(2)}{' '}
                                        Liters)
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                                        ₹
                                        {billData.milkAmount.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </td>
                                </tr>
                                {billData.credits > 0 && (
                                    <tr>
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            Other Credits (Advances,
                                            etc.)
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                                            +₹
                                            {billData.credits.toLocaleString(
                                                'en-IN',
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </td>
                                    </tr>
                                )}
                                {billData.debits > 0 && (
                                    <tr>
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            Deductions (Feed, Medicine,
                                            etc.)
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                                            -₹
                                            {billData.debits.toLocaleString(
                                                'en-IN',
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-saffron-50 dark:bg-saffron-900/20 border-t-2 border-saffron-500">
                                <tr>
                                    <td className="px-4 py-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                                        NET PAYABLE AMOUNT
                                    </td>
                                    <td className="px-4 py-4 text-right text-2xl font-bold text-saffron-600 dark:text-saffron-400">
                                        ₹
                                        {bill.net_payable.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Status */}
                    {bill.paid_amount > 0 && (
                        <div className="mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                        Amount Paid:
                                    </span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ₹
                                        {bill.paid_amount.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                {bill.net_payable - bill.paid_amount >
                                    0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Balance Due:
                                            </span>
                                            <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                                ₹
                                                {(
                                                    bill.net_payable -
                                                    bill.paid_amount
                                                ).toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Cancelled Notice */}
                    {bill.status === 'cancelled' && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 text-center">
                            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                            <div className="text-lg font-bold text-red-700 dark:text-red-300">
                                This bill has been cancelled
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div>
                            Generated on{' '}
                            {new Date(
                                bill.created_at
                            ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                        <div className="mt-2 font-medium text-saffron-500">
                            Thank you for your business! 🙏
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                            Powered by DigiDhoodh — Digital Trust
                            Infrastructure for Dairy
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
