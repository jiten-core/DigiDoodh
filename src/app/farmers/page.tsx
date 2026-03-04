// src/app/farmers/page.tsx - Farmer Management UI
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Edit, Trash2, CheckCircle, XCircle, MapPin, Phone, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFarmers, useInitializeDB } from '@/db/hooks';
import { updateFarmer } from '@/db/operations';
import { cn } from '@/lib/utils';
import type { Farmer } from '@/db/schema';

export default function FarmersPage() {
    const router = useRouter();
    const { isInitialized } = useInitializeDB();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    // Mock dairy ID  
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all farmers
    const allFarmers = useFarmers(dairyId);

    // Filter farmers
    const filteredFarmers = allFarmers.filter((farmer) => {
        // Search filter
        const matchesSearch =
            farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.farmer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.village?.toLowerCase().includes(searchTerm.toLowerCase());

        // Active filter
        const matchesActive =
            filterActive === 'all' ||
            (filterActive === 'active' && farmer.is_active) ||
            (filterActive === 'inactive' && !farmer.is_active);

        return matchesSearch && matchesActive;
    });

    // Toggle farmer active status
    const handleToggleActive = async (farmer: Farmer) => {
        await updateFarmer(
            farmer.id,
            { is_active: !farmer.is_active },
            userId
        );
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Users className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
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
                        <Users className="h-8 w-8 text-saffron-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Farmers
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push('/farmers/add')}
                        className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Farmer
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, code, phone, or village..."
                            className="h-12 pl-12 pr-4 text-lg border-2 border-gray-300 focus:border-saffron-500 bg-white dark:bg-gray-800"
                        />
                    </div>

                    {/* Active Filter */}
                    <div className="flex gap-2">
                        {(['all', 'active', 'inactive'] as const).map((filter) => (
                            <Button
                                key={filter}
                                variant={filterActive === filter ? 'default' : 'outline'}
                                onClick={() => setFilterActive(filter)}
                                className={cn(
                                    'capitalize',
                                    filterActive === filter &&
                                    'bg-saffron-500 hover:bg-saffron-600 text-white'
                                )}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Farmers List */}
                {filteredFarmers.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No farmers found
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 mb-6">
                            {searchTerm
                                ? 'Try a different search term'
                                : 'Start by adding your first farmer'}
                        </div>
                        {!searchTerm && (
                            <Button
                                onClick={() => router.push('/farmers/add')}
                                className="bg-saffron-500 hover:bg-saffron-600"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Farmer
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFarmers.map((farmer) => (
                            <div
                                key={farmer.id}
                                className={cn(
                                    'bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 transition-all hover:shadow-lg',
                                    farmer.is_active
                                        ? 'border-green-200 dark:border-green-800'
                                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {farmer.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Code: {farmer.farmer_code}
                                        </div>
                                    </div>

                                    {/* Active Badge */}
                                    <div
                                        className={cn(
                                            'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                                            farmer.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                        )}
                                    >
                                        {farmer.is_active ? (
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

                                {/* Details */}
                                <div className="space-y-2 mb-4">
                                    {farmer.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="h-4 w-4" />
                                            {farmer.phone}
                                        </div>
                                    )}
                                    {farmer.village && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            {farmer.village}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.push(`/farmers/edit?id=${farmer.id}`)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/farmers/qr?id=${farmer.id}`)}
                                        className="border-green-400 text-green-600 hover:bg-green-50"
                                        title="Generate QR Card"
                                    >
                                        <QrCode className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActive(farmer)}
                                        className={cn(
                                            farmer.is_active
                                                ? 'text-red-600 hover:text-red-700'
                                                : 'text-green-600 hover:text-green-700'
                                        )}
                                    >
                                        {farmer.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
