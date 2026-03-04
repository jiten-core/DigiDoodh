'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Sun,
    Sunset,
    Users,
    Check,
    ChevronDown,
    RefreshCw,
    Plus,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// 🎯 PAPER-LIKE MILK ENTRY
// Philosophy: "UI mirrors paper, not Excel"
// - Large numbers like writing in a register
// - Minimal fields visible at once
// - One-thumb operation
// - Hindi-first labels

interface Farmer {
    id: string;
    name: string;
    phone?: string;
    ratePerLiter?: number;
}

interface MilkEntry {
    id: string;
    farmerId: string;
    farmerName: string;
    shift: 'morning' | 'evening';
    quantity: number;
    fat?: number;
    rate: number;
    total: number;
    time: string;
}

// Mock farmers data
const MOCK_FARMERS: Farmer[] = [
    { id: 'f1', name: 'रामेश पटेल', phone: '9876543210', ratePerLiter: 45 },
    { id: 'f2', name: 'सुरेश कुमार', phone: '9876543211', ratePerLiter: 42 },
    { id: 'f3', name: 'महेश यादव', phone: '9876543212', ratePerLiter: 48 },
    { id: 'f4', name: 'राजेश शर्मा', phone: '9876543213', ratePerLiter: 44 },
    { id: 'f5', name: 'दिनेश गुप्ता', phone: '9876543214', ratePerLiter: 46 },
];

export default function PaperMilkEntry() {
    const [shift, setShift] = useState<'morning' | 'evening'>(() => {
        const hour = new Date().getHours();
        return hour < 12 ? 'morning' : 'evening';
    });
    const [step, setStep] = useState<'farmer' | 'quantity' | 'confirm'>('farmer');
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [quantity, setQuantity] = useState('');
    const [fat, setFat] = useState('');
    const [todayEntries, setTodayEntries] = useState<MilkEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const quantityInputRef = useRef<HTMLInputElement>(null);

    // Calculate rate and total
    const rate = selectedFarmer?.ratePerLiter || 45;
    const total = parseFloat(quantity || '0') * rate;

    // Filter farmers by search
    const filteredFarmers = MOCK_FARMERS.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone?.includes(searchQuery)
    );

    // Today's stats
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.quantity, 0);
    const todayAmount = todayEntries.reduce((sum, e) => sum + e.total, 0);

    const handleFarmerSelect = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        setStep('quantity');
        // Focus quantity input after a short delay
        setTimeout(() => quantityInputRef.current?.focus(), 100);
    };

    const handleQuantityChange = (value: string) => {
        // Only allow numbers and decimal
        const cleaned = value.replace(/[^0-9.]/g, '');
        // Prevent multiple decimals
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        if (parts[1]?.length > 1) return; // Only 1 decimal place
        setQuantity(cleaned);
    };

    const handleSubmit = () => {
        if (!selectedFarmer || !quantity) return;

        const newEntry: MilkEntry = {
            id: Date.now().toString(),
            farmerId: selectedFarmer.id,
            farmerName: selectedFarmer.name,
            shift,
            quantity: parseFloat(quantity),
            fat: fat ? parseFloat(fat) : undefined,
            rate,
            total,
            time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        };

        setTodayEntries(prev => [newEntry, ...prev]);
        toast.success(`✓ ${selectedFarmer.name} - ${quantity} L दर्ज`);

        // Reset for next entry
        setSelectedFarmer(null);
        setQuantity('');
        setFat('');
        setStep('farmer');
        setSearchQuery('');
    };

    const handleBack = () => {
        if (step === 'quantity') {
            setStep('farmer');
        } else if (step === 'confirm') {
            setStep('quantity');
        }
    };

    // Numpad for quantity entry
    const NumpadKey = ({ value, wide = false }: { value: string; wide?: boolean }) => (
        <button
            type="button"
            onClick={() => {
                if (value === '⌫') {
                    setQuantity(prev => prev.slice(0, -1));
                } else if (value === '.') {
                    if (!quantity.includes('.')) {
                        setQuantity(prev => prev + '.');
                    }
                } else {
                    setQuantity(prev => prev + value);
                }
            }}
            className={cn(
                'h-16 rounded-2xl text-2xl font-bold transition-all active:scale-95',
                'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                wide ? 'col-span-2' : ''
            )}
        >
            {value}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        {step !== 'farmer' && (
                            <button onClick={handleBack} className="p-2 -ml-2">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-lg font-bold">
                            {step === 'farmer' ? 'दूध एंट्री' : step === 'quantity' ? selectedFarmer?.name : 'पुष्टि करें'}
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-2 text-gray-500"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Shift Selector */}
            <div className="p-4">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                    <button
                        onClick={() => setShift('morning')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
                            shift === 'morning'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600'
                                : 'text-gray-500'
                        )}
                    >
                        <Sun className="w-5 h-5" />
                        सुबह
                    </button>
                    <button
                        onClick={() => setShift('evening')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
                            shift === 'evening'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600'
                                : 'text-gray-500'
                        )}
                    >
                        <Sunset className="w-5 h-5" />
                        शाम
                    </button>
                </div>
            </div>

            {/* Today's Summary (Always Visible) */}
            <div className="px-4 mb-4">
                <div className="flex gap-4">
                    <div className="flex-1 bg-green-100 dark:bg-green-900/30 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-green-700 dark:text-green-400">
                            {todayTotal.toFixed(1)} L
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">आज का दूध</p>
                    </div>
                    <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
                            ₹{todayAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">आज की राशि</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: Select Farmer */}
                {step === 'farmer' && (
                    <motion.div
                        key="farmer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-4 space-y-4"
                    >
                        {/* Search */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 किसान खोजें..."
                            className="w-full h-14 px-4 text-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
                            autoFocus
                        />

                        {/* Recent Farmers (Quick Access) */}
                        {!searchQuery && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">हाल के</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {MOCK_FARMERS.slice(0, 4).map(farmer => (
                                        <button
                                            key={farmer.id}
                                            onClick={() => handleFarmerSelect(farmer)}
                                            className="flex-shrink-0 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            {farmer.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Farmers List */}
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">सभी किसान</p>
                            {filteredFarmers.map(farmer => (
                                <button
                                    key={farmer.id}
                                    onClick={() => handleFarmerSelect(farmer)}
                                    className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {farmer.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-lg">{farmer.name}</p>
                                        <p className="text-sm text-gray-500">₹{farmer.ratePerLiter}/L</p>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: Enter Quantity (Paper-like) */}
                {step === 'quantity' && selectedFarmer && (
                    <motion.div
                        key="quantity"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="px-4 space-y-6"
                    >
                        {/* Farmer Card */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {selectedFarmer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{selectedFarmer.name}</p>
                                    <p className="text-green-100">Rate: ₹{rate}/L</p>
                                </div>
                            </div>
                        </div>

                        {/* 📝 PAPER-LIKE QUANTITY DISPLAY */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-gray-500 text-sm mb-2">दूध (लीटर)</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-7xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {quantity || '0'}
                                </span>
                                <span className="text-3xl text-gray-400">L</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 text-sm">कुल राशि</p>
                                <p className="text-4xl font-black text-green-600">
                                    ₹{total.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* 🔢 LARGE NUMPAD */}
                        <div className="grid grid-cols-3 gap-3">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(key => (
                                <NumpadKey key={key} value={key} />
                            ))}
                        </div>

                        {/* Optional FAT Input */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">FAT % (optional)</label>
                                <input
                                    type="number"
                                    value={fat}
                                    onChange={(e) => setFat(e.target.value)}
                                    placeholder="4.5"
                                    step="0.1"
                                    className="w-full h-14 px-4 text-xl text-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!quantity || parseFloat(quantity) === 0}
                            className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                        >
                            <Check className="w-6 h-6 mr-2" />
                            एंट्री सेव करें
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Today's Entries History (Slide-up) */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="p-4">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    आज की एंट्रीज़ ({todayEntries.length})
                                </h3>
                                {todayEntries.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>अभी कोई एंट्री नहीं</p>
                                        <p className="text-sm mt-1">पहली एंट्री करें!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {todayEntries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'w-10 h-10 rounded-full flex items-center justify-center',
                                                        entry.shift === 'morning'
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-indigo-100 text-indigo-600'
                                                    )}>
                                                        {entry.shift === 'morning' ? <Sun className="w-5 h-5" /> : <Sunset className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{entry.farmerName}</p>
                                                        <p className="text-xs text-gray-500">{entry.time}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{entry.quantity} L</p>
                                                    <p className="text-sm text-green-600">₹{entry.total.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="w-full mt-4 py-3 text-center text-gray-500"
                                >
                                    बंद करें
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
