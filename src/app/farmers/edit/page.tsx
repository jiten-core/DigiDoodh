// src/app/farmers/edit/page.tsx - Edit Farmer Page
'use client';

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateFarmer } from '@/db/operations';
import { useFarmers, useInitializeDB } from '@/db/hooks';

export default function EditFarmerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Users className="h-12 w-12 text-saffron-500 mx-auto mb-4 animate-pulse" />
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        }>
            <EditFarmerContent />
        </Suspense>
    );
}

function EditFarmerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    const farmerId = searchParams.get('id');
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Get all farmers and find the one we're editing
    const allFarmers = useFarmers(dairyId, false);
    const existingFarmer = useMemo(
        () => allFarmers.find(f => f.id === farmerId),
        [allFarmers, farmerId]
    );

    // Form state
    const [name, setName] = useState('');
    const [farmerCode, setFarmerCode] = useState('');
    const [phone, setPhone] = useState('');
    const [village, setVillage] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Pre-fill form when existingFarmer loads
    useEffect(() => {
        if (existingFarmer && !isLoaded) {
            setName(existingFarmer.name || '');
            setFarmerCode(existingFarmer.farmer_code || '');
            setPhone(existingFarmer.phone || '');
            setVillage(existingFarmer.village || '');
            setBankAccount(existingFarmer.bank_account || '');
            setIfscCode(existingFarmer.ifsc_code || '');
            setIsLoaded(true);
        }
    }, [existingFarmer, isLoaded]);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!farmerId) return;

            if (!name.trim()) {
                toast({
                    title: 'Name Required',
                    description: 'Please enter farmer name',
                    variant: 'destructive',
                });
                return;
            }

            setIsSaving(true);

            try {
                await updateFarmer(
                    farmerId,
                    {
                        name: name.trim(),
                        farmer_code: farmerCode.trim(),
                        phone: phone.trim() || undefined,
                        village: village.trim() || undefined,
                        bank_account: bankAccount.trim() || undefined,
                        ifsc_code: ifscCode.trim() || undefined,
                    },
                    userId
                );

                toast({
                    title: 'Farmer Updated!',
                    description: `${name}'s details have been updated`,
                });

                router.push('/farmers');
            } catch (error: any) {
                console.error('Failed to update farmer:', error);
                toast({
                    title: 'Update Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [farmerId, name, farmerCode, phone, village, bankAccount, ifscCode, userId, router, toast]
    );

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

    if (isInitialized && allFarmers.length > 0 && !existingFarmer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-semibold text-gray-600 mb-2">
                        Farmer Not Found
                    </div>
                    <Button onClick={() => router.push('/farmers')}>
                        Go Back
                    </Button>
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
                        onClick={() => router.push('/farmers')}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Users className="h-8 w-8 text-saffron-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Edit Farmer
                        </h1>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {existingFarmer?.name || 'Loading...'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Core Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Basic Information
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-semibold">
                                Farmer Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter farmer name"
                                className="h-12 text-lg"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="farmerCode" className="text-base font-semibold">
                                    Farmer Code
                                </Label>
                                <Input
                                    id="farmerCode"
                                    type="text"
                                    value={farmerCode}
                                    onChange={(e) => setFarmerCode(e.target.value)}
                                    placeholder="F001"
                                    className="h-12 text-lg font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-base font-semibold">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    className="h-12 text-lg font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="village" className="text-base font-semibold">
                                Village / Address
                            </Label>
                            <Input
                                id="village"
                                type="text"
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                placeholder="Village name"
                                className="h-12 text-lg"
                            />
                        </div>
                    </div>

                    {/* Bank Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Bank Details (Optional)
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="bankAccount" className="text-base font-semibold">
                                Bank Account Number
                            </Label>
                            <Input
                                id="bankAccount"
                                type="text"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                                placeholder="Enter account number"
                                className="h-12 text-lg font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ifscCode" className="text-base font-semibold">
                                IFSC Code
                            </Label>
                            <Input
                                id="ifscCode"
                                type="text"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                placeholder="SBIN0001234"
                                className="h-12 text-lg font-mono uppercase"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/farmers')}
                            className="flex-1 h-14 text-lg"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={!name.trim() || isSaving}
                            className="flex-1 h-14 text-lg bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <Users className="h-5 w-5 mr-2 animate-pulse" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Update Farmer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
