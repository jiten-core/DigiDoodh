// src/app/milk-entry/page.tsx - Main Milk Entry Form with History
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Milk, Sun, Moon, Droplets, ThermometerSun, Save,
    History, Pencil, Trash2, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { BigNumericInput } from '@/components/big-numeric-input';
import { FarmerSearch } from '@/components/farmer-search';
import { SyncStatusIndicator } from '@/components/sync-status';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addMilkEntry, editMilkEntry, deleteMilkEntry, calculateRate } from '@/db/operations';
import { useMilkEntries, useFarmers, useInitializeDB } from '@/db/hooks';
import type { Farmer, MilkEntry } from '@/db/schema';
import { cn } from '@/lib/utils';

export default function MilkEntryPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    // Form state
    const [shift, setShift] = useState<'morning' | 'evening'>('morning');
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [cattleType, setCattleType] = useState<'cow' | 'buffalo' | 'goat'>('buffalo');
    const [quantity, setQuantity] = useState('');
    const [fat, setFat] = useState('');
    const [snf, setSnf] = useState('');
    const [clr, setClr] = useState('');
    const [temperature, setTemperature] = useState('');
    const [rate, setRate] = useState(0);
    const [amount, setAmount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Edit mode
    const [editingEntry, setEditingEntry] = useState<MilkEntry | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Mock dairy ID (in real app, get from auth context)
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get today's entries for history
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const tomorrow = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return d;
    }, [today]);

    const todayEntries = useMilkEntries(dairyId, {
        startDate: today,
        endDate: tomorrow,
    });

    const allFarmers = useFarmers(dairyId);

    // Get farmer name by ID
    const getFarmerName = useCallback((farmerId: string) => {
        return allFarmers.find(f => f.id === farmerId)?.name || 'Unknown';
    }, [allFarmers]);

    // Today's stats
    const todayStats = useMemo(() => {
        const morningEntries = todayEntries.filter(e => e.shift === 'morning');
        const eveningEntries = todayEntries.filter(e => e.shift === 'evening');
        return {
            totalEntries: todayEntries.length,
            totalLiters: todayEntries.reduce((sum, e) => sum + e.quantity, 0),
            totalAmount: todayEntries.reduce((sum, e) => sum + e.amount, 0),
            morning: {
                entries: morningEntries.length,
                liters: morningEntries.reduce((sum, e) => sum + e.quantity, 0),
            },
            evening: {
                entries: eveningEntries.length,
                liters: eveningEntries.reduce((sum, e) => sum + e.quantity, 0),
            },
        };
    }, [todayEntries]);

    // Auto-calculate rate when FAT/SNF changes
    useEffect(() => {
        const calculateLiveRate = async () => {
            if (!fat) {
                setRate(0);
                return;
            }

            const calculatedRate = await calculateRate(
                dairyId,
                cattleType,
                parseFloat(fat) || undefined,
                parseFloat(snf) || undefined
            );

            setRate(calculatedRate);
        };

        calculateLiveRate();
    }, [cattleType, fat, snf, dairyId]);

    // Auto-calculate amount when quantity or rate changes
    useEffect(() => {
        const qty = parseFloat(quantity) || 0;
        setAmount(qty * rate);
    }, [quantity, rate]);

    // Load entry into form for editing
    const startEdit = useCallback((entry: MilkEntry) => {
        setEditingEntry(entry);
        const farmer = allFarmers.find(f => f.id === entry.farmer_id);
        if (farmer) setSelectedFarmer(farmer);
        setCattleType(entry.cattle_type);
        setShift(entry.shift);
        setQuantity(entry.quantity.toString());
        setFat(entry.fat?.toString() || '');
        setSnf(entry.snf?.toString() || '');
        setClr(entry.clr?.toString() || '');
        setTemperature(entry.temperature?.toString() || '');
        setRate(entry.rate);
        if (entry.clr || entry.temperature) setShowAdvanced(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [allFarmers]);

    // Cancel edit
    const cancelEdit = useCallback(() => {
        setEditingEntry(null);
        setSelectedFarmer(null);
        setQuantity('');
        setFat('');
        setSnf('');
        setClr('');
        setTemperature('');
        setRate(0);
        setAmount(0);
    }, []);

    // Handle delete
    const handleDelete = useCallback(async (entryId: string) => {
        try {
            await deleteMilkEntry(entryId, userId);
            toast({
                title: 'Entry Deleted',
                description: 'Milk entry has been removed with a correction ledger entry.',
            });
            setShowDeleteConfirm(null);
        } catch (error: any) {
            toast({
                title: 'Delete Failed',
                description: error.message || 'Please try again',
                variant: 'destructive',
            });
        }
    }, [userId, toast]);

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

            if (!quantity || parseFloat(quantity) <= 0) {
                toast({
                    title: 'Quantity Required',
                    description: 'Please enter milk quantity',
                    variant: 'destructive',
                });
                return;
            }

            if (!fat || parseFloat(fat) <= 0) {
                toast({
                    title: 'FAT Required',
                    description: 'Please enter FAT percentage',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                if (editingEntry) {
                    // EDIT MODE
                    await editMilkEntry(
                        editingEntry.id,
                        {
                            quantity: parseFloat(quantity),
                            fat: parseFloat(fat) || undefined,
                            snf: parseFloat(snf) || undefined,
                            clr: parseFloat(clr) || undefined,
                            temperature: parseFloat(temperature) || undefined,
                            cattle_type: cattleType,
                        },
                        rate,
                        userId
                    );

                    toast({
                        title: 'Entry Updated!',
                        description: `${quantity}L milk updated for ${selectedFarmer.name}`,
                    });

                    setEditingEntry(null);
                } else {
                    // ADD MODE
                    await addMilkEntry(
                        dairyId,
                        {
                            farmer_id: selectedFarmer.id,
                            entry_date: new Date(),
                            shift,
                            cattle_type: cattleType,
                            quantity: parseFloat(quantity),
                            fat: parseFloat(fat) || undefined,
                            snf: parseFloat(snf) || undefined,
                            clr: parseFloat(clr) || undefined,
                            temperature: parseFloat(temperature) || undefined,
                            entered_by: userId,
                        },
                        rate,
                        userId
                    );

                    toast({
                        title: 'Entry Saved!',
                        description: `${quantity}L milk added for ${selectedFarmer.name}`,
                        variant: 'default',
                    });
                }

                // Reset form
                setSelectedFarmer(null);
                setQuantity('');
                setFat('');
                setSnf('');
                setClr('');
                setTemperature('');
                setRate(0);
                setAmount(0);
            } catch (error: any) {
                console.error('Failed to save entry:', error);
                toast({
                    title: 'Save Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [selectedFarmer, quantity, fat, snf, clr, temperature, shift, cattleType, rate, dairyId, userId, toast, editingEntry]
    );

    // Auto-set shift based on time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setShift('morning');
        } else {
            setShift('evening');
        }
    }, []);

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
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Milk className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {editingEntry ? 'Edit Milk Entry' : 'Milk Entry'}
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date().toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {editingEntry && (
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel Edit
                            </Button>
                        )}
                        <SyncStatusIndicator />
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Edit Mode Banner */}
                    {editingEntry && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 flex items-center gap-3">
                            <Pencil className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-amber-900 dark:text-amber-100">Editing Entry</div>
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    Changes will create a correction in the ledger for audit trail.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shift Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Shift
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setShift('morning')}
                                className={cn(
                                    'p-5 rounded-xl border-2 transition-all',
                                    shift === 'morning'
                                        ? 'border-saffron-500 bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-saffron-900/30 dark:to-orange-900/30 shadow-lg'
                                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-saffron-400'
                                )}
                            >
                                <Sun
                                    className={cn(
                                        'h-10 w-10 mx-auto mb-2',
                                        shift === 'morning' ? 'text-saffron-600' : 'text-gray-400'
                                    )}
                                />
                                <div
                                    className={cn(
                                        'text-lg font-bold',
                                        shift === 'morning' ? 'text-saffron-900 dark:text-saffron-100' : 'text-gray-600'
                                    )}
                                >
                                    Morning
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {todayStats.morning.entries} entries • {todayStats.morning.liters.toFixed(1)}L
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShift('evening')}
                                className={cn(
                                    'p-5 rounded-xl border-2 transition-all',
                                    shift === 'evening'
                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-lg'
                                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-400'
                                )}
                            >
                                <Moon
                                    className={cn(
                                        'h-10 w-10 mx-auto mb-2',
                                        shift === 'evening' ? 'text-green-600' : 'text-gray-400'
                                    )}
                                />
                                <div
                                    className={cn(
                                        'text-lg font-bold',
                                        shift === 'evening' ? 'text-green-900 dark:text-green-100' : 'text-gray-600'
                                    )}
                                >
                                    Evening
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {todayStats.evening.entries} entries • {todayStats.evening.liters.toFixed(1)}L
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Farmer Search */}
                    <FarmerSearch
                        dairyId={dairyId}
                        onSelect={setSelectedFarmer}
                        selectedFarmer={selectedFarmer}
                    />

                    {/* Cattle Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cattle Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['cow', 'buffalo', 'goat'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setCattleType(type)}
                                    className={cn(
                                        'p-3 rounded-lg border-2 transition-all text-base font-semibold',
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

                    {/* Quantity Input */}
                    <BigNumericInput
                        value={quantity}
                        onChange={setQuantity}
                        label="Quantity (Liters)"
                        placeholder="0.00"
                        maxDecimals={2}
                        maxValue={999}
                        required
                    />

                    {/* FAT Input (Mandatory) */}
                    <BigNumericInput
                        value={fat}
                        onChange={setFat}
                        label="FAT %"
                        placeholder="0.0"
                        maxDecimals={1}
                        maxValue={15}
                        required
                    />

                    {/* SNF Input (Optional) */}
                    <BigNumericInput
                        value={snf}
                        onChange={setSnf}
                        label="SNF % (Optional)"
                        placeholder="0.0"
                        maxDecimals={1}
                        maxValue={15}
                    />

                    {/* Advanced Fields (CLR + Temperature) */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showAdvanced ? 'Hide' : 'Show'} CLR & Temperature
                        </button>

                        {showAdvanced && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Droplets className="h-4 w-4" /> CLR
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="40"
                                        value={clr}
                                        onChange={(e) => setClr(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full h-12 px-4 text-lg font-mono border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:border-saffron-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <ThermometerSun className="h-4 w-4" /> Temp (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="50"
                                        value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full h-12 px-4 text-lg font-mono border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:border-saffron-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rate & Amount Display (Auto-calculated) */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Rate Display */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-800">
                            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                Rate (₹/L)
                            </div>
                            <div className="text-3xl font-bold font-mono text-blue-900 dark:text-blue-100">
                                ₹{rate.toFixed(2)}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Auto-calculated
                            </div>
                        </div>

                        {/* Amount Display */}
                        <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-2 border-green-200 dark:border-green-800">
                            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                Amount (₹)
                            </div>
                            <div className="text-3xl font-bold font-mono text-green-900 dark:text-green-100">
                                ₹{amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Qty × Rate
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        type="submit"
                        disabled={!selectedFarmer || !quantity || !fat || isSaving}
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Droplets className="h-6 w-6 mr-2 animate-pulse" />
                                Saving...
                            </>
                        ) : editingEntry ? (
                            <>
                                <Pencil className="h-6 w-6 mr-2" />
                                Update Entry
                            </>
                        ) : (
                            <>
                                <Save className="h-6 w-6 mr-2" />
                                Save Entry
                            </>
                        )}
                    </Button>

                    <div className="text-center text-sm text-gray-500">
                        Entry will be saved offline and synced automatically
                    </div>
                </form>

                {/* ═══════════════════════════════════════════ */}
                {/* TODAY'S ENTRY HISTORY */}
                {/* ═══════════════════════════════════════════ */}
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Today&apos;s Entries
                            </h2>
                        </div>
                        <div className="text-sm text-gray-500">
                            {todayStats.totalEntries} entries • {todayStats.totalLiters.toFixed(1)}L • ₹{todayStats.totalAmount.toFixed(0)}
                        </div>
                    </div>

                    {/* Today's Summary Bar */}
                    {todayStats.totalEntries > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {todayStats.totalEntries}
                                </div>
                                <div className="text-xs text-blue-600">Entries</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {todayStats.totalLiters.toFixed(1)}L
                                </div>
                                <div className="text-xs text-green-600">Total Liters</div>
                            </div>
                            <div className="bg-saffron-50 dark:bg-saffron-900/20 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-saffron-900 dark:text-saffron-100">
                                    ₹{todayStats.totalAmount.toFixed(0)}
                                </div>
                                <div className="text-xs text-saffron-600">Total Amount</div>
                            </div>
                        </div>
                    )}

                    {todayEntries.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
                            <Milk className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <div className="text-gray-500">No entries yet today</div>
                            <div className="text-sm text-gray-400">Start adding milk entries above</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={cn(
                                        'bg-white dark:bg-gray-800 rounded-xl border-2 p-4 transition-all hover:shadow-md',
                                        editingEntry?.id === entry.id
                                            ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
                                            : 'border-gray-200 dark:border-gray-700'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                                    {getFarmerName(entry.farmer_id)}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                    entry.shift === 'morning'
                                                        ? 'bg-saffron-100 text-saffron-700'
                                                        : 'bg-green-100 text-green-700'
                                                )}>
                                                    {entry.shift === 'morning' ? '☀️ AM' : '🌙 PM'}
                                                </span>
                                                <span className="text-xs text-gray-400 capitalize">
                                                    {entry.cattle_type}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-mono font-bold">{entry.quantity.toFixed(2)}L</span>
                                                {entry.fat && <span>FAT: {entry.fat}%</span>}
                                                {entry.snf && <span>SNF: {entry.snf}%</span>}
                                                {entry.clr && <span>CLR: {entry.clr}</span>}
                                                <span className="text-gray-400">@</span>
                                                <span>₹{entry.rate.toFixed(2)}/L</span>
                                            </div>
                                        </div>

                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400 font-mono">
                                                    ₹{entry.amount.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(entry.entry_date).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>

                                            {/* Edit / Delete buttons */}
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(entry)}
                                                    className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Edit entry"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(entry.id)}
                                                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors"
                                                    title="Delete entry"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Confirmation */}
                                    {showDeleteConfirm === entry.id && (
                                        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800 flex items-center justify-between bg-red-50/50 dark:bg-red-900/10 rounded-lg p-3 -mx-1">
                                            <div className="text-sm text-red-700 dark:text-red-300">
                                                Delete this entry? A correction will be added to the ledger.
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
