// src/app/bills/generate/page.tsx - Generate New Bill
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Save, ArrowLeft, Calculator, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateBill } from '@/db/operations';
import { useFarmers, useMilkEntries, useLedgerEntries, useInitializeDB } from '@/db/hooks';
import { FarmerSearch } from '@/components/farmer-search';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/db/schema';

export default function GenerateBillPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all data
    const allMilkEntries = useMilkEntries(dairyId);
    const allLedgerEntries = useLedgerEntries(dairyId);

    // Form state
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [billingCycle, setBillingCycle] = useState<'daily' | 'weekly' | '10-day' | '15-day' | 'monthly' | 'custom'>('monthly');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Auto-set period based on cycle
    useEffect(() => {
        const today = new Date();
        let start: Date;
        let end: Date;

        if (billingCycle === 'daily') {
            // Yesterday
            start = new Date(today);
            start.setDate(today.getDate() - 1);
            end = new Date(start);
        } else if (billingCycle === 'weekly') {
            // Last 7 days
            start = new Date(today);
            start.setDate(today.getDate() - 7);
            end = new Date(today);
            end.setDate(today.getDate() - 1);
        } else if (billingCycle === '10-day') {
            // Last 10 days
            start = new Date(today);
            start.setDate(today.getDate() - 10);
            end = new Date(today);
            end.setDate(today.getDate() - 1);
        } else if (billingCycle === '15-day') {
            // Last 15 days
            start = new Date(today);
            start.setDate(today.getDate() - 15);
            end = new Date(today);
            end.setDate(today.getDate() - 1);
        } else if (billingCycle === 'custom') {
            // Don't auto-set for custom
            return;
        } else {
            // Monthly - first to last day of previous month
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        }

        setPeriodStart(start.toISOString().split('T')[0]);
        setPeriodEnd(end.toISOString().split('T')[0]);
    }, [billingCycle]);

    // Calculate bill preview
    const billPreview = useMemo(() => {
        if (!selectedFarmer || !periodStart || !periodEnd) {
            return null;
        }

        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);

        // Get milk entries for this farmer in this period
        const farmerMilkEntries = allMilkEntries.filter((entry) => {
            const entryDate = new Date(entry.entry_date);
            return (
                entry.farmer_id === selectedFarmer.id &&
                entryDate >= startDate &&
                entryDate <= endDate
            );
        });

        // Calculate milk totals
        const totalMilk = farmerMilkEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const totalMilkAmount = farmerMilkEntries.reduce((sum, entry) => sum + entry.amount, 0);

        // Get ledger entries for this farmer in this period
        const farmerLedgerEntries = allLedgerEntries.filter((entry) => {
            const entryDate = new Date(entry.entry_date);
            return (
                entry.farmer_id === selectedFarmer.id &&
                entryDate >= startDate &&
                entryDate <= endDate
            );
        });

        // Calculate ledger totals (excluding milk entries - those are already calculated above)
        const credits = farmerLedgerEntries
            .filter((entry) => entry.type === 'credit' && entry.category !== 'milk')
            .reduce((sum, entry) => sum + entry.amount, 0);

        const debits = farmerLedgerEntries
            .filter((entry) => entry.type === 'debit')
            .reduce((sum, entry) => sum + entry.amount, 0);

        // Calculate final amount
        // Total = Milk Amount + Other Credits - Debits
        const grossAmount = totalMilkAmount + credits;
        const netAmount = grossAmount - debits;

        return {
            entries: farmerMilkEntries.length,
            totalMilk,
            milkAmount: totalMilkAmount,
            credits,
            debits,
            grossAmount,
            netAmount,
        };
    }, [selectedFarmer, periodStart, periodEnd, allMilkEntries, allLedgerEntries]);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!selectedFarmer) {
                toast({
                    title: 'Farmer Required',
                    description: 'Please select a farmer',
                    variant: 'destructive',
                });
                return;
            }

            if (!periodStart || !periodEnd) {
                toast({
                    title: 'Period Required',
                    description: 'Please select billing period',
                    variant: 'destructive',
                });
                return;
            }

            if (!billPreview || billPreview.netAmount <= 0) {
                toast({
                    title: 'Invalid Bill',
                    description: 'Bill amount must be greater than zero',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                // Generate bill with proper deductions
                const bill = await generateBill(
                    dairyId,
                    selectedFarmer.id,
                    new Date(periodStart),
                    new Date(periodEnd),
                    billPreview.netAmount,
                    userId,
                    billPreview.debits
                );

                // Success!
                toast({
                    title: 'Bill Generated!',
                    description: `Bill #${bill.bill_number} created for ${selectedFarmer.name}`,
                });

                // Redirect to view bill
                router.push(`/bills/view?id=${bill.id}`);
            } catch (error: any) {
                console.error('Failed to generate bill:', error);
                toast({
                    title: 'Generation Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [selectedFarmer, periodStart, periodEnd, billPreview, dairyId, userId, router, toast]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
                                Generate Bill
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Create a new billing cycle
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Farmer Search */}
                        <FarmerSearch
                            dairyId={dairyId}
                            onSelect={setSelectedFarmer}
                            selectedFarmer={selectedFarmer}
                        />

                        {/* Billing Cycle Selector */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Billing Cycle <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['daily', 'weekly', '10-day', '15-day', 'monthly', 'custom'] as const).map((cycle) => (
                                    <button
                                        key={cycle}
                                        type="button"
                                        onClick={() => setBillingCycle(cycle)}
                                        className={cn(
                                            'p-3 rounded-lg border-2 transition-all text-sm font-semibold capitalize',
                                            billingCycle === cycle
                                                ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/30 text-saffron-900 dark:text-saffron-100'
                                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 hover:border-saffron-400'
                                        )}
                                    >
                                        {cycle.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Period Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="periodStart" className="text-base font-semibold">
                                    Period Start <span className="text-red-500">*</span>
                                </Label>
                                <input
                                    id="periodStart"
                                    type="date"
                                    value={periodStart}
                                    onChange={(e) => setPeriodStart(e.target.value)}
                                    className="w-full h-12 px-4 rounded-md border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800 text-base"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="periodEnd" className="text-base font-semibold">
                                    Period End <span className="text-red-500">*</span>
                                </Label>
                                <input
                                    id="periodEnd"
                                    type="date"
                                    value={periodEnd}
                                    onChange={(e) => setPeriodEnd(e.target.value)}
                                    className="w-full h-12 px-4 rounded-md border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800 text-base"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bill Preview */}
                    {billPreview && (
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Calculator className="h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Bill Preview
                                </h3>
                            </div>

                            {billPreview.entries === 0 ? (
                                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                        No milk entries found for this farmer in the selected period.
                                        Please select a different period or farmer.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Milk Summary */}
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                            Milk Collection
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-700 dark:text-gray-300">Total Entries:</span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                                {billPreview.entries}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-700 dark:text-gray-300">Total Milk:</span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                                {billPreview.totalMilk.toFixed(2)} Liters
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 dark:text-gray-300">Milk Amount:</span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                ₹{billPreview.milkAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Credits & Debits */}
                                    {(billPreview.credits > 0 || billPreview.debits > 0) && (
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                                Adjustments
                                            </div>
                                            {billPreview.credits > 0 && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-700 dark:text-gray-300">Other Credits:</span>
                                                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                        +₹{billPreview.credits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                            {billPreview.debits > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 dark:text-gray-300">Debits:</span>
                                                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                                                        -₹{billPreview.debits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Final Amount */}
                                    <div className="bg-gradient-to-r from-saffron-50 to-white dark:from-saffron-900/20 dark:to-gray-800 rounded-lg p-6 border-2 border-saffron-200 dark:border-saffron-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                                Net Payable Amount:
                                            </span>
                                            <span className="text-3xl font-bold text-saffron-600 dark:text-saffron-400">
                                                ₹{billPreview.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/bills')}
                            className="flex-1 h-14 text-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isSaving ||
                                !selectedFarmer ||
                                !billPreview ||
                                billPreview.entries === 0 ||
                                billPreview.netAmount <= 0
                            }
                            className="flex-1 h-14 text-lg bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <FileText className="h-5 w-5 mr-2 animate-pulse" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Generate Bill
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-sm text-gray-500">
                        Bill will be saved offline and synced automatically
                    </div>
                </form>
            </main>
        </div>
    );
}
