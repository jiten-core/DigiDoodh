// src/app/bills/[id]/payment/page.tsx - Record Payment
'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    IndianRupee,
    Save,
    ArrowLeft,
    Wallet,
    Building2,
    Smartphone,
    FileText as Receipt,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { recordPayment } from '@/db/operations';
import { useBills, useFarmers, useInitializeDB } from '@/db/hooks';
import { cn } from '@/lib/utils';

// Payment modes
const PAYMENT_MODES = [
    { value: 'cash', label: 'Cash', icon: Wallet, color: 'green' },
    { value: 'bank', label: 'Bank Transfer', icon: Building2, color: 'blue' },
    { value: 'upi', label: 'UPI', icon: Smartphone, color: 'purple' },
    { value: 'cheque', label: 'Cheque', icon: Receipt, color: 'orange' },
] as const;

export default function RecordPaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <IndianRupee className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        }>
            <RecordPaymentContent />
        </Suspense>
    );
}

function RecordPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    const billId = searchParams.get('id');

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get bill and farmer
    const allBills = useBills(dairyId);
    const allFarmers = useFarmers(dairyId);

    const bill = allBills.find((b: any) => b.id === billId);
    const farmer = bill ? allFarmers.find((f: any) => f.id === bill.farmer_id) : null;

    // Calculate remaining amount
    const remainingAmount = bill ? bill.net_payable - bill.paid_amount : 0;

    // Form state
    const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'upi' | 'cheque'>('cash');
    const [amount, setAmount] = useState(remainingAmount.toString());
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Handle quick amount buttons
    const setQuickAmount = (value: number) => {
        setAmount(value.toString());
    };

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!bill || !farmer) {
                toast({
                    title: 'Bill Not Found',
                    description: 'Unable to find bill details',
                    variant: 'destructive',
                });
                return;
            }

            const paymentAmount = parseFloat(amount);

            // Validation
            if (!amount || paymentAmount <= 0) {
                toast({
                    title: 'Amount Required',
                    description: 'Please enter a valid payment amount',
                    variant: 'destructive',
                });
                return;
            }

            if (paymentAmount > remainingAmount) {
                toast({
                    title: 'Amount Too High',
                    description: `Payment amount cannot exceed ₹${remainingAmount.toLocaleString('en-IN')}`,
                    variant: 'destructive',
                });
                return;
            }

            // Reference number required for non-cash payments
            if (paymentMode !== 'cash' && !referenceNumber.trim()) {
                toast({
                    title: 'Reference Number Required',
                    description: `Please enter ${paymentMode === 'cheque' ? 'cheque number' : 'transaction reference'}`,
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                // Record payment
                await recordPayment(
                    bill.id,
                    paymentAmount,
                    paymentMode,
                    new Date(paymentDate),
                    userId,
                    referenceNumber.trim() || undefined,
                    notes.trim() || undefined
                );

                // Success!
                toast({
                    title: 'Payment Recorded!',
                    description: `₹${paymentAmount.toLocaleString('en-IN')} payment recorded for ${farmer.name}`,
                });

                // Redirect back to bill view
                router.push(`/bills/view?id=${bill.id}`);
            } catch (error: any) {
                console.error('Failed to record payment:', error);
                toast({
                    title: 'Payment Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [bill, farmer, amount, remainingAmount, paymentMode, paymentDate, referenceNumber, notes, userId, router, toast]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <IndianRupee className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!bill || !farmer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <IndianRupee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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

    if (bill.status === 'paid') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <div className="text-xl font-semibold text-gray-900 mb-2">
                        Bill Already Paid
                    </div>
                    <div className="text-gray-600 mb-6">
                        This bill has been fully paid
                    </div>
                    <Button onClick={() => router.push(`/bills/view?id=${bill.id}`)}>
                        View Bill
                    </Button>
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
                            onClick={() => router.push(`/bills/view?id=${bill.id}`)}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <IndianRupee className="h-8 w-8 text-green-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Record Payment
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Bill #{bill.bill_number} - {farmer.name}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bill Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                                    Total Bill Amount
                                </div>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    ₹{bill.total_amount.toLocaleString('en-IN')}
                                </div>
                            </div>
                            {bill.paid_amount > 0 && (
                                <div>
                                    <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                                        Already Paid
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ₹{bill.paid_amount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-xs text-red-700 dark:text-red-300 mb-1">
                                    Amount Due
                                </div>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    ₹{remainingAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Payment Mode Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Payment Mode <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {PAYMENT_MODES.map((mode) => {
                                    const Icon = mode.icon;
                                    return (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setPaymentMode(mode.value)}
                                            className={cn(
                                                'p-4 rounded-lg border-2 transition-all',
                                                paymentMode === mode.value
                                                    ? `border-${mode.color}-500 bg-${mode.color}-50 dark:bg-${mode.color}-900/30`
                                                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400'
                                            )}
                                        >
                                            <Icon className={cn(
                                                'h-8 w-8 mx-auto mb-2',
                                                paymentMode === mode.value
                                                    ? `text-${mode.color}-600`
                                                    : 'text-gray-400'
                                            )} />
                                            <div className={cn(
                                                'text-sm font-semibold',
                                                paymentMode === mode.value
                                                    ? `text-${mode.color}-900 dark:text-${mode.color}-100`
                                                    : 'text-gray-600'
                                            )}>
                                                {mode.label}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-base font-semibold">
                                Payment Amount (₹) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                                    ₹
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={remainingAmount}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="h-16 pl-10 pr-4 text-2xl font-bold"
                                    required
                                />
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickAmount(remainingAmount)}
                                    className="text-xs"
                                >
                                    Full Amount
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickAmount(remainingAmount / 2)}
                                    className="text-xs"
                                >
                                    Half
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickAmount(Math.round(remainingAmount / 1000) * 1000)}
                                    className="text-xs"
                                >
                                    Round Off
                                </Button>
                            </div>
                        </div>

                        {/* Payment Date */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentDate" className="text-base font-semibold">
                                Payment Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="h-12 text-lg"
                                required
                            />
                        </div>

                        {/* Reference Number (for non-cash) */}
                        {paymentMode !== 'cash' && (
                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber" className="text-base font-semibold">
                                    {paymentMode === 'cheque' ? 'Cheque Number' :
                                        paymentMode === 'upi' ? 'UPI Transaction ID' :
                                            'Transaction Reference'} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="referenceNumber"
                                    type="text"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder={
                                        paymentMode === 'cheque' ? 'Enter cheque number' :
                                            paymentMode === 'upi' ? 'Enter UPI transaction ID' :
                                                'Enter transaction reference'
                                    }
                                    className="h-12 text-lg"
                                    required
                                />
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-base font-semibold">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this payment..."
                                rows={3}
                                className="text-base"
                            />
                        </div>
                    </div>

                    {/* Payment Preview */}
                    {amount && parseFloat(amount) > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Payment Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                                        {PAYMENT_MODES.find((m) => m.value === paymentMode)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Payment Amount:</span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining After Payment:</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        ₹{(remainingAmount - parseFloat(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(bill ? `/bills/view?id=${bill.id}` : '/bills')}
                            className="flex-1 h-14 text-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isSaving ||
                                !amount ||
                                parseFloat(amount) <= 0 ||
                                parseFloat(amount) > remainingAmount ||
                                (paymentMode !== 'cash' && !referenceNumber.trim())
                            }
                            className="flex-1 h-14 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <IndianRupee className="h-5 w-5 mr-2 animate-pulse" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Record Payment
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-sm text-gray-500">
                        Payment will be saved offline and synced automatically
                    </div>
                </form>
            </main>
        </div>
    );
}
