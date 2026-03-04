// src/app/rate-charts/edit/page.tsx - Edit Rate Chart
'use client';

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calculator, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateRateChart } from '@/db/operations';
import { useRateCharts, useInitializeDB } from '@/db/hooks';
import { cn } from '@/lib/utils';
import type { FatSlab, SnfSlab } from '@/db/schema';

export default function EditRateChartPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Calculator className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        }>
            <EditRateChartContent />
        </Suspense>
    );
}

function EditRateChartContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    const rateChartId = searchParams.get('id');
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all rate charts and find the one we're editing
    const allRateCharts = useRateCharts(dairyId, false);
    const existingChart = useMemo(
        () => allRateCharts.find(rc => rc.id === rateChartId),
        [allRateCharts, rateChartId]
    );

    // Form state
    const [cattleType, setCattleType] = useState<'cow' | 'buffalo' | 'goat'>('buffalo');
    const [pricingMode, setPricingMode] = useState<'linear' | 'slab'>('linear');
    const [baseRate, setBaseRate] = useState('');
    const [fatRate, setFatRate] = useState('');
    const [snfRate, setSnfRate] = useState('');
    const [fatSlabs, setFatSlabs] = useState<FatSlab[]>([]);
    const [snfSlabs, setSnfSlabs] = useState<SnfSlab[]>([]);
    const [effectiveFrom, setEffectiveFrom] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Pre-fill form when existingChart loads
    useEffect(() => {
        if (existingChart && !isLoaded) {
            setCattleType(existingChart.cattle_type);
            setBaseRate(existingChart.base_rate?.toString() || '');
            setFatRate(existingChart.fat_rate?.toString() || '');
            setSnfRate(existingChart.snf_rate?.toString() || '');
            setIsActive(existingChart.is_active);
            setEffectiveFrom(
                new Date(existingChart.effective_from).toISOString().split('T')[0]
            );

            // Determine pricing mode
            const hasSlabs = (existingChart.fat_slabs && existingChart.fat_slabs.length > 0) ||
                (existingChart.snf_slabs && existingChart.snf_slabs.length > 0);
            setPricingMode(hasSlabs ? 'slab' : 'linear');
            setFatSlabs(existingChart.fat_slabs || []);
            setSnfSlabs(existingChart.snf_slabs || []);
            setIsLoaded(true);
        }
    }, [existingChart, isLoaded]);

    // Example calculation
    const [exampleFat, setExampleFat] = useState('5.0');
    const [exampleSnf, setExampleSnf] = useState('9.0');
    const calculatedRate = useMemo(() => {
        const base = parseFloat(baseRate) || 0;
        const fat = parseFloat(fatRate) || 0;
        const snf = parseFloat(snfRate) || 0;
        const exF = parseFloat(exampleFat) || 0;
        const exS = parseFloat(exampleSnf) || 0;

        if (pricingMode === 'linear') {
            return base + exF * fat + exS * snf;
        }

        // Slab mode
        let rate = base;
        if (fatSlabs.length > 0) {
            const slab = fatSlabs.find(s => exF >= s.fat_min && exF <= s.fat_max);
            if (slab) rate = slab.rate;
        }
        return rate;
    }, [baseRate, fatRate, snfRate, exampleFat, exampleSnf, pricingMode, fatSlabs]);

    // FAT slab management
    const addFatSlab = () => {
        const lastMax = fatSlabs.length > 0 ? fatSlabs[fatSlabs.length - 1].fat_max : 0;
        setFatSlabs([...fatSlabs, { fat_min: lastMax, fat_max: lastMax + 1, rate: parseFloat(baseRate) || 0 }]);
    };

    const updateFatSlab = (index: number, field: keyof FatSlab, value: number) => {
        const newSlabs = [...fatSlabs];
        newSlabs[index] = { ...newSlabs[index], [field]: value };
        setFatSlabs(newSlabs);
    };

    const removeFatSlab = (index: number) => {
        setFatSlabs(fatSlabs.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!rateChartId || !existingChart) {
                toast({
                    title: 'Error',
                    description: 'Rate chart not found',
                    variant: 'destructive',
                });
                return;
            }

            if (!baseRate || parseFloat(baseRate) <= 0) {
                toast({
                    title: 'Base Rate Required',
                    description: 'Please enter a valid base rate',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                const pricingType = snfRate && parseFloat(snfRate) > 0 ? 'combined' : 'fat_based';

                await updateRateChart(
                    rateChartId,
                    {
                        cattle_type: cattleType,
                        pricing_type: pricingType,
                        base_rate: parseFloat(baseRate),
                        fat_rate: parseFloat(fatRate) || 0,
                        snf_rate: snfRate ? parseFloat(snfRate) : undefined,
                        fat_slabs: pricingMode === 'slab' ? fatSlabs : [],
                        snf_slabs: pricingMode === 'slab' ? snfSlabs : undefined,
                        is_active: isActive,
                        effective_from: new Date(effectiveFrom),
                    },
                    userId
                );

                toast({
                    title: 'Rate Chart Updated!',
                    description: `${cattleType.charAt(0).toUpperCase() + cattleType.slice(1)} rate chart has been updated`,
                });

                router.push('/rate-charts');
            } catch (error: any) {
                console.error('Failed to update rate chart:', error);
                toast({
                    title: 'Update Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [rateChartId, existingChart, cattleType, baseRate, fatRate, snfRate, pricingMode, fatSlabs, snfSlabs, isActive, effectiveFrom, userId, router, toast]
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

    if (isInitialized && allRateCharts.length > 0 && !existingChart) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-semibold text-gray-600 mb-2">
                        Rate Chart Not Found
                    </div>
                    <Button onClick={() => router.push('/rate-charts')}>
                        Go Back
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
                            onClick={() => router.push('/rate-charts')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Calculator className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Edit Rate Chart
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {existingChart?.name || 'Loading...'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cattle Type */}
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
                                    {type === 'cow' ? '🐄 Cow' : type === 'buffalo' ? '🐃 Buffalo' : '🐐 Goat'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">Active Status</div>
                            <div className="text-sm text-gray-500">
                                {isActive ? 'This rate chart is currently active' : 'This rate chart is inactive'}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={cn(
                                'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                                isActive ? 'bg-green-500' : 'bg-gray-300'
                            )}
                        >
                            <span className={cn(
                                'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                                isActive ? 'translate-x-7' : 'translate-x-1'
                            )} />
                        </button>
                    </div>

                    {/* Base Rate */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="baseRate" className="text-base font-semibold">
                                Base Rate (₹) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                                    ₹
                                </span>
                                <Input
                                    id="baseRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={baseRate}
                                    onChange={(e) => setBaseRate(e.target.value)}
                                    placeholder="0.00"
                                    className="h-14 pl-10 pr-4 text-2xl font-bold"
                                    required
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Starting rate per liter before FAT/SNF adjustments
                            </p>
                        </div>

                        {/* FAT Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="fatRate" className="text-base font-semibold">
                                FAT Increment (₹ per %) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                                    +₹
                                </span>
                                <Input
                                    id="fatRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={fatRate}
                                    onChange={(e) => setFatRate(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 pl-12 pr-4 text-xl font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* SNF Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="snfRate" className="text-base font-semibold">
                                SNF Increment (₹ per %) — Optional
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                                    +₹
                                </span>
                                <Input
                                    id="snfRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={snfRate}
                                    onChange={(e) => setSnfRate(e.target.value)}
                                    placeholder="0.00"
                                    className="h-12 pl-12 pr-4 text-xl font-bold"
                                />
                            </div>
                        </div>

                        {/* Effective From */}
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
                        </div>
                    </div>

                    {/* FAT Slabs Section (Collapsible) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    FAT Slabs (Advanced)
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Optional: Define specific rate slabs for different FAT ranges
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addFatSlab}>
                                <Plus className="h-4 w-4 mr-1" /> Add Slab
                            </Button>
                        </div>

                        {fatSlabs.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 px-1">
                                    <div>Min FAT %</div>
                                    <div>Max FAT %</div>
                                    <div>Rate ₹/L</div>
                                    <div></div>
                                </div>
                                {fatSlabs.map((slab, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={slab.fat_min}
                                            onChange={(e) => updateFatSlab(index, 'fat_min', parseFloat(e.target.value) || 0)}
                                            className="h-10"
                                        />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={slab.fat_max}
                                            onChange={(e) => updateFatSlab(index, 'fat_max', parseFloat(e.target.value) || 0)}
                                            className="h-10"
                                        />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={slab.rate}
                                            onChange={(e) => updateFatSlab(index, 'rate', parseFloat(e.target.value) || 0)}
                                            className="h-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFatSlab(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {fatSlabs.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-sm">
                                No FAT slabs defined. Using linear pricing (Base + FAT% × FAT Rate).
                            </div>
                        )}
                    </div>

                    {/* Live Calculation Preview */}
                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
                            Live Rate Preview
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label className="text-sm text-blue-700 dark:text-blue-300">
                                    Example FAT %
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={exampleFat}
                                    onChange={(e) => setExampleFat(e.target.value)}
                                    className="h-10 mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-blue-700 dark:text-blue-300">
                                    Example SNF %
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={exampleSnf}
                                    onChange={(e) => setExampleSnf(e.target.value)}
                                    className="h-10 mt-1"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                Calculated Rate
                            </div>
                            <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                                ₹{calculatedRate.toFixed(2)} / liter
                            </div>
                            <div className="text-xs text-blue-600 mt-2">
                                ₹{baseRate || '0'} + ({exampleFat} × ₹{fatRate || '0'})
                                {snfRate ? ` + (${exampleSnf} × ₹${snfRate})` : ''}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
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
                            disabled={!baseRate || !fatRate || isSaving}
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
                                    Update Rate Chart
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
