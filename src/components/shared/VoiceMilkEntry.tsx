'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Droplets, Check, Edit3, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceInput, ParsedVoiceData, VoiceFieldButton } from './VoiceInput';
import { CalculationBreakdown } from './CalculationBreakdown';
import { cn } from '@/lib/utils';
import { getCurrentShift } from '@/lib/designSystem';

interface MilkEntryData {
    quantity: number;
    fat: number;
    snf: number;
    shift: 'Morning' | 'Evening';
    rate?: number;
    amount?: number;
}

interface VoiceMilkEntryProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MilkEntryData) => void;
    farmerName?: string;
    defaultRate?: number;
    language?: 'hi' | 'en' | 'gu';
}

export function VoiceMilkEntry({
    isOpen,
    onClose,
    onSubmit,
    farmerName = 'Farmer',
    defaultRate = 52,
    language = 'hi'
}: VoiceMilkEntryProps) {
    const [step, setStep] = useState<'voice' | 'confirm' | 'edit'>('voice');
    const [entryData, setEntryData] = useState<Partial<MilkEntryData>>({
        shift: getCurrentShift()
    });

    const labels = {
        hi: {
            title: 'दूध जोड़ें',
            speakPrompt: 'बोलिए: "5 लीटर, फैट 4.5"',
            quantity: 'लीटर',
            fat: 'फैट',
            snf: 'SNF',
            morning: 'सुबह',
            evening: 'शाम',
            confirm: 'पक्का करें',
            edit: 'बदलें',
            cancel: 'रद्द करें',
            amount: 'राशि',
            calculated: 'गणना डेयरी दर के अनुसार',
            success: 'एंट्री सफल!'
        },
        en: {
            title: 'Add Milk',
            speakPrompt: 'Say: "5 liter, fat 4.5"',
            quantity: 'Liters',
            fat: 'FAT',
            snf: 'SNF',
            morning: 'Morning',
            evening: 'Evening',
            confirm: 'Confirm',
            edit: 'Edit',
            cancel: 'Cancel',
            amount: 'Amount',
            calculated: 'Calculated as per dairy rate',
            success: 'Entry Saved!'
        },
        gu: {
            title: 'દૂધ ઉમેરો',
            speakPrompt: 'બોલો: "5 લિટર, ફેટ 4.5"',
            quantity: 'લિટર',
            fat: 'ફેટ',
            snf: 'SNF',
            morning: 'સવાર',
            evening: 'સાંજ',
            confirm: 'પક્કો કરો',
            edit: 'બદલો',
            cancel: 'રદ કરો',
            amount: 'રકમ',
            calculated: 'ડેરીના દર મુજબ',
            success: 'એન્ટ્રી સફળ!'
        }
    };

    const t = labels[language];

    // Auto-detect shift on mount
    useEffect(() => {
        if (isOpen) {
            setEntryData(prev => ({
                ...prev,
                shift: getCurrentShift()
            }));
            setStep('voice');
        }
    }, [isOpen]);

    // Calculate amount
    const calculateAmount = () => {
        if (entryData.quantity && entryData.fat) {
            // Simple FAT-based calculation (can be enhanced with rate charts)
            const baseFat = 4.0;
            const FatBonus = ((entryData.fat - baseFat) * 2); // ₹2 per 0.1% FAT above 4.0
            const effectiveRate = defaultRate + FatBonus;
            return Math.round(entryData.quantity * effectiveRate * 100) / 100;
        }
        return 0;
    };

    const handleVoiceResult = (data: ParsedVoiceData) => {
        setEntryData(prev => ({
            ...prev,
            quantity: data.liters || prev.quantity,
            fat: data.fat || prev.fat,
            snf: data.snf || prev.snf || 8.5, // Default SNF
            shift: data.shift || prev.shift
        }));

        // If we got enough data, go to confirm
        if (data.liters && data.fat) {
            setStep('confirm');
        } else {
            setStep('edit');
        }
    };

    const handleSubmit = () => {
        if (entryData.quantity && entryData.fat && entryData.shift) {
            const amount = calculateAmount();
            onSubmit({
                quantity: entryData.quantity,
                fat: entryData.fat,
                snf: entryData.snf || 8.5,
                shift: entryData.shift,
                rate: defaultRate,
                amount
            });
        }
    };

    if (!isOpen) return null;

    const amount = calculateAmount();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-3xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">{t.title}</h2>
                                <p className="text-emerald-200 text-sm">{farmerName}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Shift Toggle */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setEntryData(prev => ({ ...prev, shift: 'Morning' }))}
                                className={cn(
                                    "flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors",
                                    entryData.shift === 'Morning'
                                        ? "bg-white text-emerald-700 font-medium"
                                        : "bg-white/10 text-white/70"
                                )}
                            >
                                <Sun className="w-4 h-4" />
                                {t.morning}
                            </button>
                            <button
                                onClick={() => setEntryData(prev => ({ ...prev, shift: 'Evening' }))}
                                className={cn(
                                    "flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors",
                                    entryData.shift === 'Evening'
                                        ? "bg-white text-emerald-700 font-medium"
                                        : "bg-white/10 text-white/70"
                                )}
                            >
                                <Moon className="w-4 h-4" />
                                {t.evening}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {step === 'voice' && (
                                <motion.div
                                    key="voice"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="py-8"
                                >
                                    <VoiceInput
                                        onResult={handleVoiceResult}
                                        onCancel={() => setStep('edit')}
                                        language={language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN'}
                                        placeholder={t.speakPrompt}
                                    />

                                    <div className="text-center mt-6">
                                        <button
                                            onClick={() => setStep('edit')}
                                            className="text-neutral-500 text-sm underline"
                                        >
                                            या टाइप करें →
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {(step === 'edit' || step === 'confirm') && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {/* Quantity */}
                                    <div>
                                        <label className="text-sm font-medium text-neutral-600 mb-2 block">
                                            🥛 {t.quantity}
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={entryData.quantity || ''}
                                                onChange={e => setEntryData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                                                className="h-14 text-2xl font-bold pr-20 rounded-xl"
                                                placeholder="0.0"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <span className="text-neutral-400">L</span>
                                                <VoiceFieldButton
                                                    onResult={val => setEntryData(prev => ({ ...prev, quantity: parseFloat(val) }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FAT & SNF Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-neutral-600 mb-2 block">
                                                📊 {t.fat} %
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={entryData.fat || ''}
                                                    onChange={e => setEntryData(prev => ({ ...prev, fat: parseFloat(e.target.value) }))}
                                                    className="h-14 text-xl font-bold pr-12 rounded-xl"
                                                    placeholder="4.5"
                                                />
                                                <VoiceFieldButton
                                                    onResult={val => setEntryData(prev => ({ ...prev, fat: parseFloat(val) }))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-neutral-600 mb-2 block">
                                                📊 {t.snf} %
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={entryData.snf || ''}
                                                    onChange={e => setEntryData(prev => ({ ...prev, snf: parseFloat(e.target.value) }))}
                                                    className="h-14 text-xl font-bold pr-12 rounded-xl"
                                                    placeholder="8.5"
                                                />
                                                <VoiceFieldButton
                                                    onResult={val => setEntryData(prev => ({ ...prev, snf: parseFloat(val) }))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount Preview */}
                                    {amount > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6"
                                        >
                                            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                                                <p className="text-sm text-emerald-600 mb-1">{t.amount}</p>
                                                <p className="text-4xl font-bold text-emerald-700">
                                                    ₹{amount.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-xs text-emerald-500 mt-1">{t.calculated}</p>
                                            </div>

                                            {/* Mini Calculation */}
                                            <div className="mt-3 text-center text-sm text-neutral-500 font-mono">
                                                {entryData.quantity}L × ₹{defaultRate} = ₹{amount}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep('voice')}
                                            className="flex-1 h-14 rounded-xl"
                                        >
                                            <Mic className="w-5 h-5 mr-2" />
                                            Voice
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!entryData.quantity || !entryData.fat}
                                            className="flex-1 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Check className="w-5 h-5 mr-2" />
                                            {t.confirm}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
