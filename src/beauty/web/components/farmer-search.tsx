// src/components/farmer-search.tsx - Offline Farmer Search & Selection
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, User, MapPin, QrCode, X } from 'lucide-react';
import { useFarmerSearch, useFarmers } from '@/db/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/db/schema';

interface FarmerSearchProps {
    dairyId: string;
    onSelect: (farmer: Farmer) => void;
    selectedFarmer?: Farmer | null;
    className?: string;
}

export function FarmerSearch({
    dairyId,
    onSelect,
    selectedFarmer,
    className,
}: FarmerSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Use our offline search hook
    const { results, isSearching } = useFarmerSearch(dairyId, searchTerm);

    // Get recent farmers (last 5 active)
    const allFarmers = useFarmers(dairyId, true);
    const recentFarmers = allFarmers.slice(0, 5);

    // Handle farmer selection
    const handleSelect = useCallback(
        (farmer: Farmer) => {
            onSelect(farmer);
            setSearchTerm('');
            setIsOpen(false);
        },
        [onSelect]
    );

    // Handle clear selection
    const handleClear = useCallback(() => {
        onSelect(null as any);
        setSearchTerm('');
    }, [onSelect]);

    // Show results or recent farmers
    const displayFarmers = searchTerm.length >= 2 ? results : recentFarmers;
    const showResults = displayFarmers.length > 0;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Label */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Farmer
                <span className="text-red-500">*</span>
            </label>

            {/* Selected Farmer Display or Search Input */}
            {selectedFarmer ? (
                <div className="relative p-4 rounded-lg border-2 border-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {selectedFarmer.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                                <div>Code: {selectedFarmer.farmer_code}</div>
                                {selectedFarmer.village && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {selectedFarmer.village}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Clear Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Search farmer name, code, or phone..."
                            className="h-14 pl-12 pr-12 text-lg border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800"
                        />
                        {/* QR Scanner Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-500 hover:text-saffron-600"
                            title="Scan QR Code (Coming Soon)"
                        >
                            <QrCode className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Dropdown Results */}
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Results Dropdown */}
                            <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl z-20">
                                {/* Search Status */}
                                {searchTerm.length >= 2 && isSearching && (
                                    <div className="p-4 text-center text-gray-500">
                                        Searching...
                                    </div>
                                )}

                                {/* No Results */}
                                {searchTerm.length >= 2 && !isSearching && results.length === 0 && (
                                    <div className="p-6 text-center">
                                        <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <div className="text-gray-600 dark:text-gray-400">
                                            No farmers found
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Try a different name or code
                                        </div>
                                    </div>
                                )}

                                {/* Results or Recent Farmers */}
                                {showResults && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {/* Helper Text */}
                                        {searchTerm.length < 2 && (
                                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900">
                                                Recent farmers
                                            </div>
                                        )}

                                        {/* Farmer List */}
                                        {displayFarmers.map((farmer) => (
                                            <button
                                                key={farmer.id}
                                                type="button"
                                                onClick={() => handleSelect(farmer)}
                                                className="w-full p-4 text-left hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors focus:outline-none focus:bg-saffron-100 dark:focus:bg-saffron-900/40"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {farmer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 space-y-0.5">
                                                            <div>Code: {farmer.farmer_code}</div>
                                                            {farmer.village && (
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {farmer.village}
                                                                </div>
                                                            )}
                                                            {farmer.phone && (
                                                                <div className="text-xs">{farmer.phone}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Active Badge */}
                                                    {farmer.is_active && (
                                                        <div className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                                                            Active
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Helper Text */}
            {!selectedFarmer && (
                <div className="text-xs text-gray-500">
                    {searchTerm.length < 2
                        ? 'Type to search or select from recent farmers'
                        : `Found ${results.length} farmer${results.length !== 1 ? 's' : ''}`}
                </div>
            )}
        </div>
    );
}

// Compact version (modal-based for mobile)
export function FarmerSearchModal({
    dairyId,
    onSelect,
    isOpen,
    onClose,
}: {
    dairyId: string;
    onSelect: (farmer: Farmer) => void;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Select Farmer
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <FarmerSearch
                        dairyId={dairyId}
                        onSelect={(farmer) => {
                            onSelect(farmer);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
