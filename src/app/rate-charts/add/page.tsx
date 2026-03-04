// src/app/rate-charts/add/page.tsx - Add New Rate Chart
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addRateChart } from '@/db/operations';
import { useInitializeDB } from '@/db/hooks';
import { cn } from '@/lib/utils';

export default function AddRateChartPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Form state
    const [cattleType, setCattleType] = useState<'cow' | 'buffalo' | 'goat'>('buffalo');
    const [baseRate, setBaseRate] = useState('');
    const [fatRate, setFatRate] = useState('');
    const [snfRate, setSnfRate] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [isSaving, setIsSaving] = useState(false);

    // Example calculation state
    const [exampleFat, setExampleFat] = useState('5.0');
    const [exampleSnf, setExampleSnf] = useState('9.0');
    const [calculatedRate, setCalculatedRate] = useState(0);

    // Calculate example rate
    useEffect(() => {
        const base = parseFloat(baseRate) || 0;
        const fat = parseFloat(fatRate) || 0;
        const snf = parseFloat(snfRate) || 0;
        const exampleF = parseFloat(exampleFat) || 0;
        const exampleS = parseFloat(exampleSnf) || 0;

        const total = base + exampleF * fat + exampleS * snf;
        setCalculatedRate(total);
    }, [baseRate, fatRate, snfRate, exampleFat, exampleSnf]);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // Validation
            if (!baseRate || parseFloat(baseRate) <= 0) {
                toast({
                    title: 'Base Rate Required',
                    description: 'Please enter a valid base rate',
                    variant: 'destructive',
                });
                return;
            }

            if (!fatRate || parseFloat(fatRate) <= 0) {
                toast({
                    title: 'FAT Rate Required',
                    description: 'Please enter a valid FAT increment rate',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                // Add rate chart (saves offline, queues for sync)
                await addRateChart(
                    dairyId,
                    {
                        name: `${cattleType.charAt(0).toUpperCase() + cattleType.slice(1)} Rate Chart`,
                        cattle_type: cattleType,
                        pricing_type: snfRate ? 'combined' : 'fat_based',
                        base_rate: parseFloat(baseRate),
                        fat_rate: parseFloat(fatRate),
                        snf_rate: snfRate ? parseFloat(snfRate) : undefined,
                        fat_slabs: [], // Keep empty slabs if needed for compatibility
                        snf_slabs: snfRate ? [] : undefined,
                        is_active: true,
                        effective_from: new Date(effectiveFrom),
                    },
                    userId
                );

                // Success!
                toast({
                    title: 'Rate Chart Added!',
                    description: `${cattleType.charAt(0).toUpperCase() + cattleType.slice(1)} rate chart has been created`,
                });

                // Redirect back to rate charts list
                router.push('/rate-charts');
            } catch (error: any) {
                console.error('Failed to add rate chart:', error);
                toast({
                    title: 'Save Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [cattleType, baseRate, fatRate, snfRate, effectiveFrom, dairyId, userId, router, toast]
    );

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Calculator className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
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
                            onClick={() => router.push('/rate-charts')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Calculator className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Add New Rate Chart
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Configure milk rate calculation
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Cattle Type Selector */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Cattle Type <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['cow', 'buffalo', 'goat'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setCattleType(type)}
                                        className={cn(
                                            'p-4 rounded-lg border-2 transition-all capitalize text-lg font-semibold',
                                            cattleType === type
                                                ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/30 text-saffron-900 dark:text-saffron-100'
                                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 hover:border-saffron-400'
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Base Rate (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="baseRate" className="text-base font-semibold">
                                Base Rate (₹/liter) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="baseRate"
                                type="number"
                                step="0.01"
                                min="0"
                                value={baseRate}
                                onChange={(e) => setBaseRate(e.target.value)}
                                placeholder="e.g., 20.00"
                                className="h-12 text-lg"
                                required
                            />
                            <p className="text-sm text-gray-500">
                                Starting rate before FAT/SNF adjustments
                            </p>
                        </div>

                        {/* FAT Rate (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="fatRate" className="text-base font-semibold">
                                FAT Increment (₹ per 1% FAT) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="fatRate"
                                type="number"
                                step="0.01"
                                min="0"
                                value={fatRate}
                                onChange={(e) => setFatRate(e.target.value)}
                                placeholder="e.g., 2.00"
                                className="h-12 text-lg"
                                required
                            />
                            <p className="text-sm text-gray-500">
                                Rate added for each 1% of FAT content
                            </p>
                        </div>

                        {/* SNF Rate (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="snfRate" className="text-base font-semibold">
                                SNF Increment (₹ per 1% SNF) - Optional
                            </Label>
                            <Input
                                id="snfRate"
                                type="number"
                                step="0.01"
                                min="0"
                                value={snfRate}
                                onChange={(e) => setSnfRate(e.target.value)}
                                placeholder="e.g., 1.00 (leave empty if not used)"
                                className="h-12 text-lg"
                            />
                            <p className="text-sm text-gray-500">
                                Rate added for each 1% of SNF content
                            </p>
                        </div>

                        {/* Effective From Date */}
                        <div className="space-y-2">
                            <Label htmlFor="effectiveFrom" className="text-base font-semibold">
                                Effective From <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="effectiveFrom"
                                type="date"
                                value={effectiveFrom}
                                onChange={(e) => setEffectiveFrom(e.target.value)}
                                className="h-12 text-lg"
                                required
                            />
                            <p className="text-sm text-gray-500">
                                This rate chart will be used from this date onwards
                            </p>
                        </div>
                    </div>

                    {/* Live Rate Calculator Preview */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Live Rate Preview
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Example FAT Input */}
                            <div className="space-y-2">
                                <Label htmlFor="exampleFat" className="text-sm font-semibold">
                                    Example FAT %
                                </Label>
                                <Input
                                    id="exampleFat"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="15"
                                    value={exampleFat}
                                    onChange={(e) => setExampleFat(e.target.value)}
                                    className="h-10"
                                />
                            </div>

                            {/* Example SNF Input */}
                            <div className="space-y-2">
                                <Label htmlFor="exampleSnf" className="text-sm font-semibold">
                                    Example SNF %
                                </Label>
                                <Input
                                    id="exampleSnf"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="15"
                                    value={exampleSnf}
                                    onChange={(e) => setExampleSnf(e.target.value)}
                                    className="h-10"
                                    disabled={!snfRate}
                                />
                            </div>
                        </div>

                        {/* Calculation Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Calculation:
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <div>Base Rate: ₹{parseFloat(baseRate) || 0}</div>
                                <div>
                                    + FAT ({exampleFat}% × ₹{parseFloat(fatRate) || 0}) = ₹
                                    {((parseFloat(exampleFat) || 0) * (parseFloat(fatRate) || 0)).toFixed(2)}
                                </div>
                                {snfRate && (
                                    <div>
                                        + SNF ({exampleSnf}% × ₹{parseFloat(snfRate)}) = ₹
                                        {((parseFloat(exampleSnf) || 0) * parseFloat(snfRate)).toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    Final Rate:
                                </div>
                                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                    ₹{calculatedRate.toFixed(2)} / liter
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/rate-charts')}
                            className="flex-1 h-14 text-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSaving || !baseRate || !fatRate}
                            className="flex-1 h-14 text-lg bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <Calculator className="h-5 w-5 mr-2 animate-pulse" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Rate Chart
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-sm text-gray-500">
                        Rate chart will be saved offline and synced automatically
                    </div>
                </form>
            </main>
        </div>
    );
}
