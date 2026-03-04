// src/app/ledger/debit/page.tsx - Add Debit Entry
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownCircle, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addLedgerEntry } from '@/db/operations';
import { useInitializeDB } from '@/db/hooks';
import { FarmerSearch } from '@/components/farmer-search';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/db/schema';

// Common debit categories (must match LedgerEntry schema)
const DEBIT_CATEGORIES = [
    { value: 'product' as const, label: 'Product Purchase', icon: '🌾' },
    { value: 'loan' as const, label: 'Loan/Advance', icon: '💰' },
    { value: 'correction' as const, label: 'Correction Entry', icon: '✏️' },
] as const;

export default function AddDebitPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Form state
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [category, setCategory] = useState<'milk' | 'payment' | 'advance' | 'loan' | 'product' | 'correction'>('product');
    const [amount, setAmount] = useState('');
    const [entryDate, setEntryDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // Validation
            if (!selectedFarmer) {
                toast({
                    title: 'Farmer Required',
                    description: 'Please select a farmer',
                    variant: 'destructive',
                });
                return;
            }

            if (!amount || parseFloat(amount) <= 0) {
                toast({
                    title: 'Amount Required',
                    description: 'Please enter a valid amount',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                // Add ledger entry as DEBIT (amount deducted from farmer's balance)
                await addLedgerEntry(
                    dairyId,
                    selectedFarmer.id,
                    new Date(entryDate),
                    'debit',
                    category,
                    parseFloat(amount),
                    undefined, // No reference ID
                    userId,
                    notes.trim() || undefined
                );

                // Success!
                toast({
                    title: 'Debit Added!',
                    description: `₹${amount} debit recorded for ${selectedFarmer.name}`,
                });

                // Redirect back to  ledger
                router.push('/ledger');
            } catch (error: any) {
                console.error('Failed to add debit:', error);
                toast({
                    title: 'Save Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [selectedFarmer, category, amount, entryDate, notes, dairyId, userId, router, toast]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ArrowDownCircle className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
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
                            onClick={() => router.push('/ledger')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <ArrowDownCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Add Debit
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Record debit transaction
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6">
                        <div className="flex items-start gap-3">
                            <ArrowDownCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                                    What is a Debit?
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    A debit is an amount deducted from the farmer's account for purchases,
                                    services, or repayments. It will be <strong>subtracted from their balance</strong>{' '}
                                    and reflected in their next bill.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Farmer Search */}
                        <FarmerSearch
                            dairyId={dairyId}
                            onSelect={setSelectedFarmer}
                            selectedFarmer={selectedFarmer}
                        />

                        {/* Category Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Debit Category <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {DEBIT_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={cn(
                                            'p-4 rounded-lg border-2 transition-all text-left',
                                            category === cat.value
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-400'
                                        )}
                                    >
                                        <div className="text-2xl mb-2">{cat.icon}</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {cat.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-base font-semibold">
                                Debit Amount (₹) <span className="text-red-500">*</span>
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
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="h-16 pl-10 pr-4 text-2xl font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Entry Date */}
                        <div className="space-y-2">
                            <Label htmlFor="entryDate" className="text-base font-semibold">
                                Entry Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="entryDate"
                                type="date"
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                                className="h-12 text-lg"
                                required
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-base font-semibold">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this debit..."
                                rows={4}
                                className="text-base"
                            />
                        </div>
                    </div>

                    {/* Summary Preview */}
                    {selectedFarmer && amount && parseFloat(amount) > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Farmer:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {selectedFarmer.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-bold">
                                        DEBIT
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                        {DEBIT_CATEGORIES.find((c) => c.value === category)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        -₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(entryDate).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
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
                            onClick={() => router.push('/ledger')}
                            className="flex-1 h-14 text-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSaving || !selectedFarmer || !amount || parseFloat(amount) <= 0}
                            className="flex-1 h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <ArrowDownCircle className="h-5 w-5 mr-2 animate-pulse" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Debit
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-sm text-gray-500">
                        Debit will be saved offline and synced automatically
                    </div>
                </form>
            </main>
        </div>
    );
}
