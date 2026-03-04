// src/app/rate-charts/page.tsx - Rate Charts Management
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Plus, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRateCharts, useInitializeDB } from '@/db/hooks';
import { updateRateChart } from '@/db/operations';
import { cn } from '@/lib/utils';
import type { RateChart } from '@/db/schema';

export default function RateChartsPage() {
    const router = useRouter();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all rate charts
    const allRateCharts = useRateCharts(dairyId);

    // Toggle rate chart active status
    const handleToggleActive = async (rateChart: RateChart) => {
        await updateRateChart(
            rateChart.id,
            { is_active: !rateChart.is_active },
            userId
        );
    };

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
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Rate Charts
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {allRateCharts.length} rate chart{allRateCharts.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push('/rate-charts/add')}
                        className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Rate Chart
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Rate Charts List */}
                {allRateCharts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Calculator className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No rate charts found
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 mb-6">
                            Create your first rate chart to calculate milk rates
                        </div>
                        <Button
                            onClick={() => router.push('/rate-charts/add')}
                            className="bg-saffron-500 hover:bg-saffron-600"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Rate Chart
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {allRateCharts.map((rateChart) => (
                            <div
                                key={rateChart.id}
                                className={cn(
                                    'bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 transition-all hover:shadow-lg',
                                    rateChart.is_active
                                        ? 'border-green-200 dark:border-green-800'
                                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                                            {rateChart.cattle_type}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Effective from:{' '}
                                            {new Date(rateChart.effective_from).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>

                                    {/* Active Badge */}
                                    <div
                                        className={cn(
                                            'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                                            rateChart.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                        )}
                                    >
                                        {rateChart.is_active ? (
                                            <>
                                                <CheckCircle className="h-3 w-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3 w-3" />
                                                Inactive
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Rate Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                Base Rate
                                            </div>
                                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                ₹{rateChart.base_rate.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                            <div className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                FAT Increment
                                            </div>
                                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                ₹{rateChart.fat_rate.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {rateChart.snf_rate && (
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                SNF Increment (per %)
                                            </div>
                                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                ₹{rateChart.snf_rate.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Example Calculation */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                        Example: 5.0% FAT, {rateChart.snf_rate ? '9.0% SNF' : 'No SNF'}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        ₹
                                        {(
                                            rateChart.base_rate +
                                            5.0 * rateChart.fat_rate +
                                            (rateChart.snf_rate ? 9.0 * rateChart.snf_rate : 0)
                                        ).toFixed(2)}{' '}
                                        / liter
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/rate-charts/edit?id=${rateChart.id}`)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActive(rateChart)}
                                        className={cn(
                                            rateChart.is_active
                                                ? 'text-red-600 hover:text-red-700'
                                                : 'text-green-600 hover:text-green-700'
                                        )}
                                    >
                                        {rateChart.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                        How Rate Calculation Works
                    </h3>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                        <p>
                            <strong>Final Rate =</strong> Base Rate + (FAT % × FAT Increment) + (SNF % × SNF Increment)
                        </p>
                        <p className="text-xs">
                            Example: If Base=₹20, FAT Increment=₹2, SNF Increment=₹1, and milk has 5% FAT
                            and 9% SNF, then Final Rate = ₹20 + (5×₹2) + (9×₹1) = ₹39/liter
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
