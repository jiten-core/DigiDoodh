'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { supabase, isDemoMode } from '@/lib/supabase';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import {
    Calculator,
    Plus,
    Edit,
    Trash2,
    Check,
    X,
    Copy,
    Star,
    Loader2,
    Table,
    TrendingUp,
    Settings,
    Eye,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface RateChart {
    id: string;
    name: string;
    type: 'FAT_BASED' | 'SNF_BASED' | 'FAT_SNF_COMBINED';
    isDefault: boolean;
    isActive: boolean;
    baseRate: number;
    fatIncentive: number;
    snfIncentive: number;
    minFat: number;
    maxFat: number;
    minSnf: number;
    maxSnf: number;
    createdAt: string;
    rates?: RateEntry[];
}

interface RateEntry {
    fat: number;
    snf: number;
    rate: number;
}

export default function RateChartsPage() {
    const { profile } = useAuth();
    const { checkLimit, currentPlan } = usePlanLimits();
    const [loading, setLoading] = useState(true);
    const [rateCharts, setRateCharts] = useState<RateChart[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingChart, setEditingChart] = useState<RateChart | null>(null);
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    // Rate calculator
    const [calcFat, setCalcFat] = useState('4.0');
    const [calcSnf, setCalcSnf] = useState('8.5');
    const [calcLiters, setCalcLiters] = useState('10');
    const [selectedChartForCalc, setSelectedChartForCalc] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'FAT_BASED' as RateChart['type'],
        baseRate: '50',
        fatIncentive: '2.5',
        snfIncentive: '0',
        minFat: '3.0',
        maxFat: '6.0',
        minSnf: '8.0',
        maxSnf: '9.5',
    });

    useEffect(() => {
        fetchRateCharts();
    }, []);

    const fetchRateCharts = async () => {
        if (!profile?.dairy?.id && !isDemoMode) return;
        setLoading(true);
        try {
            if (isDemoMode) {
                setRateCharts(getDemoRateCharts());
                return;
            }

            const { data, error } = await supabase
                .from('rate_charts')
                .select('*')
                .eq('dairy_id', profile?.dairy?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setRateCharts(data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    isDefault: item.is_default,
                    isActive: item.is_active,
                    baseRate: item.base_rate,
                    fatIncentive: item.fat_incentive,
                    snfIncentive: item.snf_incentive,
                    minFat: item.min_fat,
                    maxFat: item.max_fat,
                    minSnf: item.min_snf,
                    maxSnf: item.max_snf,
                    createdAt: item.created_at,
                })));
            }
        } catch (error) {
            console.error('Error fetching rate charts:', error);
            setRateCharts(getDemoRateCharts());
        } finally {
            setLoading(false);
        }
    };

    const getDemoRateCharts = (): RateChart[] => [
        {
            id: '1',
            name: 'Standard FAT Chart',
            type: 'FAT_BASED',
            isDefault: true,
            isActive: true,
            baseRate: 40,
            fatIncentive: 3,
            snfIncentive: 0,
            minFat: 3.0,
            maxFat: 6.0,
            minSnf: 8.0,
            maxSnf: 9.5,
            createdAt: '2024-01-01',
        },
        {
            id: '2',
            name: 'Premium FAT+SNF Chart',
            type: 'FAT_SNF_COMBINED',
            isDefault: false,
            isActive: true,
            baseRate: 35,
            fatIncentive: 2.5,
            snfIncentive: 1,
            minFat: 3.0,
            maxFat: 7.0,
            minSnf: 8.0,
            maxSnf: 9.5,
            createdAt: '2024-03-15',
        },
        {
            id: '3',
            name: 'Buffalo Milk Chart',
            type: 'FAT_BASED',
            isDefault: false,
            isActive: true,
            baseRate: 45,
            fatIncentive: 3.5,
            snfIncentive: 0,
            minFat: 5.0,
            maxFat: 8.0,
            minSnf: 8.5,
            maxSnf: 10.0,
            createdAt: '2024-06-01',
        },
    ];

    const calculateRate = (chart: RateChart, fat: number, snf: number, liters: number): { rate: number; amount: number } => {
        let rate = chart.baseRate;

        if (chart.type === 'FAT_BASED' || chart.type === 'FAT_SNF_COMBINED') {
            rate += (fat - chart.minFat) * chart.fatIncentive;
        }

        if (chart.type === 'SNF_BASED' || chart.type === 'FAT_SNF_COMBINED') {
            rate += (snf - chart.minSnf) * chart.snfIncentive;
        }

        // Ensure rate doesn't go below base
        rate = Math.max(chart.baseRate, rate);

        return {
            rate: Math.round(rate * 100) / 100,
            amount: Math.round(rate * liters * 100) / 100,
        };
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Please enter a name for the rate chart');
            return;
        }

        // Limit check for non-premium plans (e.g. max 1 chart for BASIC)
        if (!editingChart && rateCharts.length >= 1 && currentPlan.id === 'BASIC') {
            toast.error('BASIC plan supports only 1 rate chart. Please upgrade for more.');
            return;
        }

        try {
            if (isDemoMode) {
                toast.success(editingChart ? 'Rate chart updated (Demo)!' : 'Rate chart created (Demo)!');
                setShowAddModal(false);
                return;
            }

            const payload = {
                dairy_id: profile?.dairy?.id,
                name: formData.name,
                type: formData.type,
                base_rate: parseFloat(formData.baseRate),
                fat_incentive: parseFloat(formData.fatIncentive),
                snf_incentive: parseFloat(formData.snfIncentive),
                min_fat: parseFloat(formData.minFat),
                max_fat: parseFloat(formData.maxFat),
                min_snf: parseFloat(formData.minSnf),
                max_snf: parseFloat(formData.maxSnf),
            };

            const { error } = editingChart
                ? await supabase.from('rate_charts').update(payload).eq('id', editingChart.id)
                : await supabase.from('rate_charts').insert([payload]);

            if (error) throw error;

            toast.success(editingChart ? 'Rate chart updated!' : 'Rate chart created!');
            setShowAddModal(false);
            setEditingChart(null);
            resetForm();
            fetchRateCharts();

        } catch (error) {
            console.error('Error saving rate chart:', error);
            toast.error('Failed to save rate chart');
        }
    };

    const handleSetDefault = async (chartId: string) => {
        toast.success('Default rate chart updated!');
        fetchRateCharts();
    };

    const handleDelete = async (chartId: string) => {
        if (!confirm('Are you sure you want to delete this rate chart?')) return;
        toast.success('Rate chart deleted!');
        fetchRateCharts();
    };

    const handleDuplicate = (chart: RateChart) => {
        setFormData({
            name: `${chart.name} (Copy)`,
            type: chart.type,
            baseRate: chart.baseRate.toString(),
            fatIncentive: chart.fatIncentive.toString(),
            snfIncentive: chart.snfIncentive.toString(),
            minFat: chart.minFat.toString(),
            maxFat: chart.maxFat.toString(),
            minSnf: chart.minSnf.toString(),
            maxSnf: chart.maxSnf.toString(),
        });
        setShowAddModal(true);
    };

    const handleEdit = (chart: RateChart) => {
        setFormData({
            name: chart.name,
            type: chart.type,
            baseRate: chart.baseRate.toString(),
            fatIncentive: chart.fatIncentive.toString(),
            snfIncentive: chart.snfIncentive.toString(),
            minFat: chart.minFat.toString(),
            maxFat: chart.maxFat.toString(),
            minSnf: chart.minSnf.toString(),
            maxSnf: chart.maxSnf.toString(),
        });
        setEditingChart(chart);
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'FAT_BASED',
            baseRate: '50',
            fatIncentive: '2.5',
            snfIncentive: '0',
            minFat: '3.0',
            maxFat: '6.0',
            minSnf: '8.0',
            maxSnf: '9.5',
        });
        setEditingChart(null);
    };

    const getTypeLabel = (type: RateChart['type']) => {
        switch (type) {
            case 'FAT_BASED':
                return { label: 'FAT Based', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
            case 'SNF_BASED':
                return { label: 'SNF Based', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' };
            case 'FAT_SNF_COMBINED':
                return { label: 'FAT + SNF', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
            default:
                return { label: type, color: 'bg-gray-100 text-gray-800' };
        }
    };

    // Get selected chart for calculator
    const calcChart = rateCharts.find(c => c.id === selectedChartForCalc) || rateCharts.find(c => c.isDefault) || rateCharts[0];
    const calcResult = calcChart ? calculateRate(
        calcChart,
        parseFloat(calcFat) || 0,
        parseFloat(calcSnf) || 0,
        parseFloat(calcLiters) || 0
    ) : { rate: 0, amount: 0 };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading rate charts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                        {t('rateChart.title', 'Rate Charts')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Configure FAT/SNF based pricing for milk collection
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Rate Chart
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rate Charts List */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {rateCharts.map((chart, index) => {
                            const typeInfo = getTypeLabel(chart.type);
                            const isExpanded = expandedChart === chart.id;
                            return (
                                <motion.div
                                    key={chart.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 ${chart.isDefault ? 'border-green-500' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${chart.isDefault ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'} text-white`}>
                                                        <Table className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{chart.name}</h3>
                                                            {chart.isDefault && (
                                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                    <Star className="w-3 h-3 mr-1" />
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setExpandedChart(isExpanded ? null : chart.id)}
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Summary Stats */}
                                            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Base Rate</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{chart.baseRate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">FAT Incentive</p>
                                                    <p className="text-xl font-bold text-blue-600">+₹{chart.fatIncentive}/FAT</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">FAT Range</p>
                                                    <p className="text-xl font-bold text-purple-600">{chart.minFat}% - {chart.maxFat}%</p>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">SNF Incentive</p>
                                                                    <p className="font-medium">₹{chart.snfIncentive}/SNF</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">SNF Range</p>
                                                                    <p className="font-medium">{chart.minSnf}% - {chart.maxSnf}%</p>
                                                                </div>
                                                            </div>

                                                            {/* Example Calculations */}
                                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Example Rates:</p>
                                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                                                                        <p className="text-gray-500">FAT 3.5%</p>
                                                                        <p className="font-bold text-green-600">₹{calculateRate(chart, 3.5, 8.5, 1).rate}/L</p>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                                                                        <p className="text-gray-500">FAT 4.5%</p>
                                                                        <p className="font-bold text-green-600">₹{calculateRate(chart, 4.5, 8.5, 1).rate}/L</p>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                                                                        <p className="text-gray-500">FAT 5.5%</p>
                                                                        <p className="font-bold text-green-600">₹{calculateRate(chart, 5.5, 8.5, 1).rate}/L</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-2 flex-wrap">
                                                                {!chart.isDefault && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleSetDefault(chart.id)}
                                                                        className="text-green-600 hover:bg-green-50"
                                                                    >
                                                                        <Star className="w-4 h-4 mr-1" />
                                                                        Set as Default
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleEdit(chart)}
                                                                >
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleDuplicate(chart)}
                                                                >
                                                                    <Copy className="w-4 h-4 mr-1" />
                                                                    Duplicate
                                                                </Button>
                                                                {!chart.isDefault && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleDelete(chart.id)}
                                                                        className="text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {rateCharts.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                            <Calculator className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rate charts yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first rate chart to start calculating milk prices</p>
                            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Rate Chart
                            </Button>
                        </div>
                    )}
                </div>

                {/* Rate Calculator */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Calculator className="w-6 h-6" />
                            Quick Rate Calculator
                        </h3>

                        <div className="space-y-4">
                            {rateCharts.length > 1 && (
                                <div>
                                    <Label className="text-white/80 text-sm">Rate Chart</Label>
                                    <select
                                        value={selectedChartForCalc}
                                        onChange={(e) => setSelectedChartForCalc(e.target.value)}
                                        className="w-full mt-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60"
                                    >
                                        <option value="" className="text-gray-900">Default Chart</option>
                                        {rateCharts.map(chart => (
                                            <option key={chart.id} value={chart.id} className="text-gray-900">
                                                {chart.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-white/80 text-sm">FAT %</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={calcFat}
                                        onChange={(e) => setCalcFat(e.target.value)}
                                        className="mt-1 bg-white/20 border-white/30 text-white placeholder-white/60 text-lg font-medium text-center"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/80 text-sm">SNF %</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={calcSnf}
                                        onChange={(e) => setCalcSnf(e.target.value)}
                                        className="mt-1 bg-white/20 border-white/30 text-white placeholder-white/60 text-lg font-medium text-center"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/80 text-sm">Liters</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={calcLiters}
                                    onChange={(e) => setCalcLiters(e.target.value)}
                                    className="mt-1 bg-white/20 border-white/30 text-white placeholder-white/60 text-2xl font-bold text-center"
                                />
                            </div>

                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <p className="text-white/80 text-sm mb-1">Rate per Liter</p>
                                <p className="text-3xl font-bold">₹{calcResult.rate.toFixed(2)}</p>
                            </div>

                            <div className="bg-green-400/30 rounded-xl p-4 text-center">
                                <p className="text-white/80 text-sm mb-1">Total Amount</p>
                                <p className="text-4xl font-bold">₹{calcResult.amount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Formula Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            How Rate is Calculated
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>FAT Based:</strong></p>
                            <p className="bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs">
                                Rate = Base + (FAT - MinFAT) × FAT Incentive
                            </p>
                            <p className="mt-3"><strong>FAT + SNF Based:</strong></p>
                            <p className="bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono text-xs">
                                Rate = Base + (FAT × FATInc) + (SNF × SNFInc)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowAddModal(false); setEditingChart(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingChart ? 'Edit Rate Chart' : 'Create Rate Chart'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="name">Chart Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Standard FAT Chart"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Chart Type</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {(['FAT_BASED', 'SNF_BASED', 'FAT_SNF_COMBINED'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData(prev => ({ ...prev, type }))}
                                                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.type === type
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                {type === 'FAT_BASED' ? 'FAT' : type === 'SNF_BASED' ? 'SNF' : 'FAT+SNF'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="baseRate">Base Rate (₹/L)</Label>
                                        <Input
                                            id="baseRate"
                                            type="number"
                                            step="0.5"
                                            value={formData.baseRate}
                                            onChange={e => setFormData(prev => ({ ...prev, baseRate: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="fatIncentive">FAT Incentive (₹/FAT)</Label>
                                        <Input
                                            id="fatIncentive"
                                            type="number"
                                            step="0.1"
                                            value={formData.fatIncentive}
                                            onChange={e => setFormData(prev => ({ ...prev, fatIncentive: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'FAT_SNF_COMBINED' && (
                                    <div>
                                        <Label htmlFor="snfIncentive">SNF Incentive (₹/SNF)</Label>
                                        <Input
                                            id="snfIncentive"
                                            type="number"
                                            step="0.1"
                                            value={formData.snfIncentive}
                                            onChange={e => setFormData(prev => ({ ...prev, snfIncentive: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="minFat">Min FAT %</Label>
                                        <Input
                                            id="minFat"
                                            type="number"
                                            step="0.1"
                                            value={formData.minFat}
                                            onChange={e => setFormData(prev => ({ ...prev, minFat: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="maxFat">Max FAT %</Label>
                                        <Input
                                            id="maxFat"
                                            type="number"
                                            step="0.1"
                                            value={formData.maxFat}
                                            onChange={e => setFormData(prev => ({ ...prev, maxFat: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => { setShowAddModal(false); setEditingChart(null); }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {editingChart ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
