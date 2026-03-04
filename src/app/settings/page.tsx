// src/app/settings/page.tsx — Simple Settings Page
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Smartphone,
    Sun,
    Moon,
    Download,
    Trash2,
    Database,
    AlertTriangle,
    CheckCircle,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useInitializeDB, useFarmers, useMilkEntries, useBills } from '@/db/hooks';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    const dairyId = 'dairy-1';
    const allFarmers = useFarmers(dairyId);
    const allMilk = useMilkEntries(dairyId);
    const allBills = useBills(dairyId);

    // Dairy settings (stored in localStorage for now)
    const [dairyName, setDairyName] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('dd_dairy_name')) || 'My Dairy'
    );
    const [ownerName, setOwnerName] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('dd_owner_name')) || ''
    );
    const [phone, setPhone] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('dd_phone')) || ''
    );
    const [address, setAddress] = useState(
        () => (typeof window !== 'undefined' && localStorage.getItem('dd_address')) || ''
    );

    // Active tab
    const [activeTab, setActiveTab] = useState<'dairy' | 'data' | 'about'>('dairy');

    // Save dairy settings
    const handleSave = useCallback(() => {
        localStorage.setItem('dd_dairy_name', dairyName);
        localStorage.setItem('dd_owner_name', ownerName);
        localStorage.setItem('dd_phone', phone);
        localStorage.setItem('dd_address', address);

        toast({
            title: 'Settings Saved',
            description: 'Your dairy settings have been saved.',
        });
    }, [dairyName, ownerName, phone, address, toast]);

    // Export all data as JSON
    const handleExportData = useCallback(async () => {
        const data = {
            exportedAt: new Date().toISOString(),
            dairy: { name: dairyName, owner: ownerName, phone, address },
            farmers: allFarmers,
            milkEntries: allMilk,
            bills: allBills,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digidoodh_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Data Exported',
            description: 'Full backup downloaded as JSON file.',
        });
    }, [dairyName, ownerName, phone, address, allFarmers, allMilk, allBills, toast]);

    // Clear all data
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const handleClearData = useCallback(async () => {
        try {
            // Delete the entire IndexedDB database
            const databases = await indexedDB.databases();
            for (const dbInfo of databases) {
                if (dbInfo.name) {
                    indexedDB.deleteDatabase(dbInfo.name);
                }
            }

            localStorage.clear();

            toast({
                title: 'All Data Cleared',
                description: 'Please refresh the page to restart.',
            });

            setShowClearConfirm(false);

            // Reload after a brief delay
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to clear data. Please try again.',
                variant: 'destructive',
            });
        }
    }, [toast]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Smartphone className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Smartphone className="h-8 w-8 text-saffron-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Settings
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                    {(
                        [
                            { value: 'dairy' as const, label: 'Dairy Info', icon: Building2 },
                            { value: 'data' as const, label: 'Data & Backup', icon: Database },
                            { value: 'about' as const, label: 'About', icon: Info },
                        ]
                    ).map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2',
                                activeTab === tab.value
                                    ? 'bg-saffron-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* =================== DAIRY INFO TAB =================== */}
                {activeTab === 'dairy' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-saffron-500" />
                                Dairy Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dairyName" className="font-semibold">
                                        Dairy Name *
                                    </Label>
                                    <Input
                                        id="dairyName"
                                        value={dairyName}
                                        onChange={(e) => setDairyName(e.target.value)}
                                        placeholder="Enter dairy name"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ownerName" className="font-semibold">
                                        Owner Name
                                    </Label>
                                    <Input
                                        id="ownerName"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        placeholder="Enter owner name"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="font-semibold">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="font-semibold">
                                        Address
                                    </Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter dairy address"
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSave}
                                className="bg-saffron-500 hover:bg-saffron-600 text-white h-12 px-8"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </div>
                )}

                {/* =================== DATA TAB =================== */}
                {activeTab === 'data' && (
                    <div className="space-y-6">
                        {/* Data Overview */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                                <Database className="h-5 w-5 text-blue-500" />
                                Your Data
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {allFarmers.length}
                                    </div>
                                    <div className="text-xs text-blue-600">Farmers</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {allMilk.length}
                                    </div>
                                    <div className="text-xs text-green-600">Milk Entries</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {allBills.length}
                                    </div>
                                    <div className="text-xs text-purple-600">Bills</div>
                                </div>
                            </div>
                        </div>

                        {/* Backup & Export */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Backup & Export
                            </h2>
                            <p className="text-sm text-gray-500">
                                Download a full backup of all your dairy data as a JSON file. You
                                can use this to restore your data later.
                            </p>
                            <Button
                                onClick={handleExportData}
                                className="bg-blue-500 hover:bg-blue-600 text-white h-12"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download Full Backup
                            </Button>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6 space-y-4">
                            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Danger Zone
                            </h2>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Clearing all data will permanently delete all farmers, milk
                                entries, bills, ledger entries, and settings. This action cannot
                                be undone.
                            </p>

                            {!showClearConfirm ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClearConfirm(true)}
                                    className="border-red-300 text-red-600 hover:bg-red-100 h-12"
                                >
                                    <Trash2 className="h-5 w-5 mr-2" />
                                    Clear All Data
                                </Button>
                            ) : (
                                <div className="space-y-3 p-4 bg-red-100 dark:bg-red-900/20 rounded-xl">
                                    <p className="text-sm font-bold text-red-700 dark:text-red-300">
                                        ⚠️ Are you absolutely sure? This will delete ALL your
                                        data!
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowClearConfirm(false)}
                                            className="h-10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleClearData}
                                            className="bg-red-600 hover:bg-red-700 text-white h-10"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Yes, Delete Everything
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* =================== ABOUT TAB =================== */}
                {activeTab === 'about' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center">
                            <div className="text-5xl mb-4">🥛</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                DigiDhoodh
                            </h2>
                            <p className="text-saffron-600 font-semibold mt-1">
                                Smart Dairy Management
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Version 1.0.0</p>

                            <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400 text-left max-w-md mx-auto">
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>Works fully offline — data stored on device</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span>Milk collection, billing, and ledger management</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                    <span>FAT/SNF based rate charts with auto-calculation</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                    <span>Detailed reports and CSV exports</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-400">
                                    Made with ❤️ in India 🇮🇳
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    © {new Date().getFullYear()} DigiDhoodh Technologies
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
