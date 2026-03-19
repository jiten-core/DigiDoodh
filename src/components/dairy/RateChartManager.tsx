'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Lock, Clock, AlertTriangle, Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Rate Chart Entry
interface RateEntry {
    id: string;
    fatMin: number;
    fatMax: number;
    snfMin?: number;
    snfMax?: number;
    rate: number;
}

// Rate Chart
interface RateChart {
    id: string;
    name: string;
    type: 'FARMER' | 'BUYER';
    milkType: 'cow' | 'buffalo' | 'mixed';
    entries: RateEntry[];
    isActive: boolean;
    createdAt: Date;
    appliesFrom: Date; // Rate applies only to entries AFTER this date
    isLocked: boolean;
}

interface RateChartManagerProps {
    charts: RateChart[];
    type: 'FARMER' | 'BUYER';
    onSave?: (chart: RateChart) => void;
    onDelete?: (chartId: string) => void;
    language?: 'en' | 'hi' | 'gu';
}

const LABELS = {
    en: {
        farmerTitle: 'Farmer Rate Chart',
        farmerSubtitle: 'Rates applied to farmer milk collection',
        buyerTitle: 'Customer Rate Chart',
        buyerSubtitle: 'Rates applied when selling milk to customers',
        independentNote: 'Customer rates are independent from farmer rates',
        futureOnlyNote: '🔒 Rates apply only to future milk entries',
        futureTooltip: 'Past milk records cannot be changed to avoid disputes',
        addRate: 'Add Rate',
        importChart: 'Import Rate Chart',
        viewHistory: 'View Rate History',
        fat: 'FAT',
        snf: 'SNF',
        rate: 'Rate (₹/L)',
        active: 'Active',
        locked: 'Locked',
        appliesFrom: 'Applies from',
        noCharts: 'No rate charts yet',
        createFirst: 'Create your first rate chart',
        cow: 'Cow Milk',
        buffalo: 'Buffalo Milk',
        mixed: 'Mixed'
    },
    hi: {
        farmerTitle: 'किसान रेट चार्ट',
        farmerSubtitle: 'किसान दूध संग्रह पर लागू दर',
        buyerTitle: 'ग्राहक रेट चार्ट',
        buyerSubtitle: 'दूध बेचते समय लागू दर',
        independentNote: 'ग्राहक दरें किसान दरों से स्वतंत्र हैं',
        futureOnlyNote: '🔒 दरें केवल भविष्य की प्रविष्टियों पर लागू होती हैं',
        futureTooltip: 'विवादों से बचने के लिए पुराने रिकॉर्ड बदले नहीं जा सकते',
        addRate: 'दर जोड़ें',
        importChart: 'चार्ट आयात करें',
        viewHistory: 'इतिहास देखें',
        fat: 'फैट',
        snf: 'SNF',
        rate: 'दर (₹/ली)',
        active: 'सक्रिय',
        locked: 'लॉक',
        appliesFrom: 'से लागू',
        noCharts: 'कोई रेट चार्ट नहीं',
        createFirst: 'अपना पहला रेट चार्ट बनाएं',
        cow: 'गाय का दूध',
        buffalo: 'भैंस का दूध',
        mixed: 'मिश्रित'
    },
    gu: {
        farmerTitle: 'ખેડૂત રેટ ચાર્ટ',
        farmerSubtitle: 'ખેડૂત દૂધ સંગ્રહ પર લાગુ દર',
        buyerTitle: 'ગ્રાહક રેટ ચાર્ટ',
        buyerSubtitle: 'દૂધ વેચતી વખતે લાગુ દર',
        independentNote: 'ગ્રાહક દરો ખેડૂત દરોથી સ્વતંત્ર છે',
        futureOnlyNote: '🔒 દરો ફક્ત ભવિષ્યની એન્ટ્રી પર લાગુ થાય છે',
        futureTooltip: 'વિવાદો ટાળવા જૂના રેકોર્ડ બદલી શકાતા નથી',
        addRate: 'દર ઉમેરો',
        importChart: 'ચાર્ટ આયાત કરો',
        viewHistory: 'ઇતિહાસ જુઓ',
        fat: 'ફેટ',
        snf: 'SNF',
        rate: 'દર (₹/લિ)',
        active: 'સક્રિય',
        locked: 'લૉક',
        appliesFrom: 'થી લાગુ',
        noCharts: 'કોઈ રેટ ચાર્ટ નથી',
        createFirst: 'તમારો પ્રથમ રેટ ચાર્ટ બનાવો',
        cow: 'ગાયનું દૂધ',
        buffalo: 'ભેંસનું દૂધ',
        mixed: 'મિશ્રિત'
    }
};

export function RateChartManager({
    charts,
    type,
    onSave,
    onDelete,
    language = 'en'
}: RateChartManagerProps) {
    const [selectedChart, setSelectedChart] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const t = LABELS[language];
    const isFarmer = type === 'FARMER';

    // Color theme based on type (NEVER mix Farmer & Buyer on same screen)
    const theme = isFarmer
        ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'emerald' }
        : { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'blue' };

    return (
        <div className="min-h-screen bg-neutral-50 pb-24">
            {/* Header */}
            <div className={cn(
                "p-6 border-b",
                isFarmer ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-blue-600",
                "text-white"
            )}>
                <h1 className="text-xl font-bold">
                    {isFarmer ? t.farmerTitle : t.buyerTitle}
                </h1>
                <p className="text-sm opacity-80 mt-1">
                    {isFarmer ? t.farmerSubtitle : t.buyerSubtitle}
                </p>
            </div>

            {/* Important Notice */}
            <div className={cn(
                "mx-4 mt-4 p-3 rounded-xl border flex items-start gap-3",
                theme.bg, theme.border
            )}>
                <Lock className={cn("w-5 h-5 flex-shrink-0 mt-0.5", theme.text)} />
                <div>
                    <p className={cn("text-sm font-medium", theme.text)}>
                        {t.futureOnlyNote}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                        {t.futureTooltip}
                    </p>
                </div>
            </div>

            {/* Buyer-specific note */}
            {!isFarmer && (
                <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t.independentNote}
                    </p>
                </div>
            )}

            {/* Rate Charts List */}
            <div className="p-4 space-y-4">
                {charts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                        <div className={cn(
                            "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                            theme.bg
                        )}>
                            <Plus className={cn("w-8 h-8", theme.text)} />
                        </div>
                        <p className="text-neutral-500 font-medium">{t.noCharts}</p>
                        <p className="text-sm text-neutral-400 mt-1">{t.createFirst}</p>
                    </div>
                ) : (
                    charts.map((chart) => (
                        <motion.div
                            key={chart.id}
                            layout
                            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
                        >
                            {/* Chart Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => setSelectedChart(selectedChart === chart.id ? null : chart.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                                        theme.bg
                                    )}>
                                        {chart.milkType === 'cow' ? '🐄' : chart.milkType === 'buffalo' ? '🐃' : '🥛'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-800">{chart.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            {chart.isActive ? (
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <Check className="w-3 h-3" /> {t.active}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-neutral-400">
                                                    <Clock className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                            {chart.isLocked && (
                                                <span className="flex items-center gap-1 text-amber-600">
                                                    <Lock className="w-3 h-3" /> {t.locked}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    "w-5 h-5 text-neutral-400 transition-transform",
                                    selectedChart === chart.id && "rotate-180"
                                )} />
                            </div>

                            {/* Expanded Rate Table */}
                            <AnimatePresence>
                                {selectedChart === chart.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-neutral-100"
                                    >
                                        {/* Rate Table */}
                                        <div className="p-4 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-neutral-500">
                                                        <th className="text-left py-2 font-medium">{t.fat}</th>
                                                        <th className="text-left py-2 font-medium">{t.snf}</th>
                                                        <th className="text-right py-2 font-medium">{t.rate}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chart.entries.map((entry) => (
                                                        <tr key={entry.id} className="border-t border-neutral-50">
                                                            <td className="py-3 font-mono">
                                                                {entry.fatMin}% - {entry.fatMax}%
                                                            </td>
                                                            <td className="py-3 font-mono text-neutral-500">
                                                                {entry.snfMin && entry.snfMax
                                                                    ? `${entry.snfMin}% - ${entry.snfMax}%`
                                                                    : '-'
                                                                }
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    theme.text
                                                                )}>
                                                                    ₹{entry.rate}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Actions */}
                                        {!chart.isLocked && (
                                            <div className="p-4 pt-0 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 rounded-xl"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
                                                    onClick={() => onDelete?.(chart.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {chart.isLocked && (
                                            <div className="p-4 pt-0">
                                                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                                                    <Lock className="w-4 h-4 inline mr-2" />
                                                    This chart is locked because it's used in closed billing cycles.
                                                    Changes will create a new version.
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="fixed bottom-6 left-4 right-4 flex gap-3">
                <Button
                    className={cn(
                        "flex-1 h-14 rounded-2xl shadow-lg",
                        isFarmer ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                    )}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {t.addRate}
                </Button>
                <Button
                    variant="outline"
                    className="h-14 rounded-2xl bg-white shadow-lg"
                >
                    <Clock className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

// Simple Rate Card for display (no editing)
interface RateDisplayCardProps {
    fatPercent: number;
    rate: number;
    bonusLabel?: string;
    language?: 'en' | 'hi' | 'gu';
}

export function RateDisplayCard({
    fatPercent,
    rate,
    bonusLabel,
    language = 'en'
}: RateDisplayCardProps) {
    const labels = {
        en: { base: 'Base', bonus: 'FAT Bonus', youGet: 'You Get' },
        hi: { base: 'मूल', bonus: 'फैट बोनस', youGet: 'आपको मिलेगा' },
        gu: { base: 'બેઝ', bonus: 'ફેટ બોનસ', youGet: 'તમને મળશે' }
    };
    const t = labels[language];

    // Calculate FAT bonus (simple example: ₹2 per 0.5% above 4.0)
    const baseFat = 4.0;
    const bonus = Math.max(0, (fatPercent - baseFat) * 4);
    const totalRate = rate + bonus;

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-100">
            <div className="text-center">
                <p className="text-xs text-emerald-600 font-medium mb-1">
                    FAT {fatPercent}%
                </p>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">{t.base}:</span>
                        <span className="font-medium">₹{rate}/L</span>
                    </div>
                    {bonus > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>+ {t.bonus}:</span>
                            <span className="font-medium">₹{bonus.toFixed(1)}</span>
                        </div>
                    )}
                    <div className="border-t border-emerald-100 pt-2 mt-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-600 font-medium">{t.youGet}:</span>
                            <span className="text-emerald-700 font-bold text-lg">₹{totalRate.toFixed(1)}/L</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
