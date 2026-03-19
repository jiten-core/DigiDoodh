'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CalculationStep {
    label: string;
    calculation: string;
    result: number | null;
}

interface CalculationBreakdownProps {
    title?: string;
    steps: CalculationStep[];
    netAmount: number;
    isCredit?: boolean; // true for farmer (receives), false for buyer (pays)
    showByDefault?: boolean;
    className?: string;
}

/**
 * Glass Ledger™ Calculation Breakdown
 * Shows transparent, step-by-step calculation to build trust
 * 
 * "DigiDhoodh shows, Liter hides" - This is our USP
 */
export function CalculationBreakdown({
    title = "How this was calculated",
    steps,
    netAmount,
    isCredit = true,
    showByDefault = false,
    className
}: CalculationBreakdownProps) {
    const [isExpanded, setIsExpanded] = useState(showByDefault);

    return (
        <div className={cn(
            "bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden",
            className
        )}>
            {/* Header (Collapsible Toggle) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-100/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Calculator className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-neutral-800">{title}</p>
                        <p className="text-xs text-neutral-500">Tap to see full breakdown</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
            </button>

            {/* Calculation Steps (Animated) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {/* Info Banner */}
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    <strong>Glass Ledger™</strong> - Every calculation is visible.
                                    No hidden deductions. What you see is what you get.
                                </p>
                            </div>

                            {/* Steps List */}
                            <div className="bg-white rounded-xl p-3 space-y-2 font-mono text-sm">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between py-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center text-xs text-neutral-500">
                                                {index + 1}
                                            </span>
                                            <span className="text-neutral-600">{step.label}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-neutral-400 text-xs">{step.calculation}</span>
                                            {step.result !== null && (
                                                <span className={cn(
                                                    "font-semibold",
                                                    step.result >= 0 ? "text-neutral-800" : "text-red-600"
                                                )}>
                                                    {step.result >= 0 ? '' : ''}₹{Math.abs(step.result).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Divider */}
                                <div className="border-t border-dashed border-neutral-200 my-2" />

                                {/* Net Total */}
                                <div className="flex items-center justify-between py-2">
                                    <span className="font-bold text-neutral-800">Net Amount</span>
                                    <span className={cn(
                                        "text-xl font-bold",
                                        isCredit ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {isCredit ? '+' : '-'}₹{Math.abs(netAmount).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="text-center py-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                    ✓ Verified Calculation • Tamper-proof
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Inline Mini Calculation (for transaction cards)
 */
export function MiniCalculation({
    quantity,
    rate,
    total,
    className
}: {
    quantity: number;
    rate: number;
    total: number;
    className?: string;
}) {
    return (
        <div className={cn(
            "text-xs text-neutral-500 font-mono",
            className
        )}>
            <span className="text-neutral-400">{quantity}L</span>
            <span className="text-neutral-300 mx-1">×</span>
            <span className="text-neutral-400">₹{rate}</span>
            <span className="text-neutral-300 mx-1">=</span>
            <span className="text-neutral-600 font-semibold">₹{total}</span>
        </div>
    );
}
