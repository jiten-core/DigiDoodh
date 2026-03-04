// src/components/big-numeric-input.tsx - Paper-Like Numeric Keypad
'use client';

import { useState, useCallback } from 'react';
import { Delete, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BigNumericInputProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    maxDecimals?: number;
    maxValue?: number;
    required?: boolean;
    className?: string;
}

export function BigNumericInput({
    value,
    onChange,
    label,
    placeholder = '0',
    maxDecimals = 2,
    required = false,
    maxValue = 9999,
    className,
}: BigNumericInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    // Handle number button click
    const handleNumberClick = useCallback(
        (num: string) => {
            const newValue = value + num;

            // Check decimal places
            if (newValue.includes('.')) {
                const decimals = newValue.split('.')[1];
                if (decimals && decimals.length > maxDecimals) {
                    return; // Too many decimals
                }
            }

            // Check max value
            const numValue = parseFloat(newValue);
            if (numValue > maxValue) {
                return; // Exceeds max
            }

            onChange(newValue);
        },
        [value, onChange, maxDecimals, maxValue]
    );

    // Handle decimal point
    const handleDecimal = useCallback(() => {
        if (!value.includes('.')) {
            onChange(value + '.');
        }
    }, [value, onChange]);

    // Handle backspace
    const handleBackspace = useCallback(() => {
        onChange(value.slice(0, -1));
    }, [value, onChange]);

    // Handle clear
    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    // Get display value
    const displayValue = value || placeholder;
    const isPlaceholder = !value;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Label */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            {/* Display Value (Paper-like) */}
            <div
                onClick={() => setIsFocused(true)}
                className={cn(
                    'relative min-h-[80px] p-4 rounded-lg border-2 transition-all cursor-pointer',
                    'bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900',
                    isFocused
                        ? 'border-saffron-500 shadow-lg shadow-saffron-500/20'
                        : 'border-gray-300 dark:border-gray-700',
                    'hover:border-saffron-400 dark:hover:border-saffron-600'
                )}
            >
                {/* Value Display */}
                <div className="flex items-center justify-between">
                    <span
                        className={cn(
                            'text-5xl font-bold font-mono tracking-tight',
                            isPlaceholder
                                ? 'text-gray-400 dark:text-gray-600'
                                : 'text-gray-900 dark:text-gray-100'
                        )}
                    >
                        {displayValue}
                    </span>

                    {/* Clear Button */}
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="h-10 w-10 text-gray-500 hover:text-red-600"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Underline (Paper effect) */}
                <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
            </div>

            {/* Numeric Keypad (Paper-like buttons) */}
            {isFocused && (
                <div className="grid grid-cols-4 gap-2 p-4 rounded-lg bg-gradient-to-br from-orange-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
                    {/* Number Buttons 1-9 */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button
                            key={num}
                            type="button"
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-16 text-2xl font-bold bg-white dark:bg-gray-800 hover:bg-saffron-100 dark:hover:bg-saffron-900 border-2 border-gray-300 dark:border-gray-600 hover:border-saffron-500 shadow-sm"
                        >
                            {num}
                        </Button>
                    ))}

                    {/* Decimal Button */}
                    {maxDecimals > 0 && (
                        <Button
                            type="button"
                            onClick={handleDecimal}
                            disabled={value.includes('.')}
                            className="h-16 text-2xl font-bold bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            .
                        </Button>
                    )}

                    {/* Zero Button */}
                    <Button
                        type="button"
                        onClick={() => handleNumberClick('0')}
                        className="h-16 text-2xl font-bold bg-white dark:bg-gray-800 hover:bg-saffron-100 dark:hover:bg-saffron-900 border-2 border-gray-300 dark:border-gray-600 hover:border-saffron-500 shadow-sm"
                    >
                        0
                    </Button>

                    {/* Backspace Button */}
                    <Button
                        type="button"
                        onClick={handleBackspace}
                        disabled={!value}
                        className="h-16 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Delete className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </Button>

                    {/* Done Button */}
                    <Button
                        type="button"
                        onClick={() => setIsFocused(false)}
                        className="col-span-4 h-14 text-lg font-bold bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white shadow-lg"
                    >
                        Done
                    </Button>
                </div>
            )}
        </div>
    );
}

// Compact version (no keypad, just display + click to open)
export function CompactNumericInput({
    value,
    onChange,
    label,
    maxDecimals = 2,
    required = false,
}: Omit<BigNumericInputProps, 'className' | 'placeholder' | 'maxValue'>) {
    const [showKeypad, setShowKeypad] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            <button
                type="button"
                onClick={() => setShowKeypad(true)}
                className="w-full p-4 text-left text-3xl font-bold font-mono bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-saffron-500 transition-colors"
            >
                {value || '0'}
            </button>

            {showKeypad && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
                        <BigNumericInput
                            value={value}
                            onChange={onChange}
                            label={label}
                            maxDecimals={maxDecimals}
                            required={required}
                        />
                        <Button
                            onClick={() => setShowKeypad(false)}
                            className="w-full mt-4"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
