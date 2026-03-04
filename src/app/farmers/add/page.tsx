// src/app/farmers/add/page.tsx - Add New Farmer Form
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addFarmer } from '@/db/operations';
import { useInitializeDB } from '@/db/hooks';

export default function AddFarmerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();

    // Mock dairy ID
    const dairyId = 'dairy-1';
    const userId = 'user-1';

    // Form state
    const [farmerCode, setFarmerCode] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [village, setVillage] = useState('');
    const [address, setAddress] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // Validation
            if (!farmerCode.trim()) {
                toast({
                    title: 'Farmer Code Required',
                    description: 'Please enter a farmer code',
                    variant: 'destructive',
                });
                return;
            }

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
                // Add farmer (saves offline, queues for sync)
                await addFarmer(
                    dairyId,
                    {
                        farmer_code: farmerCode.trim(),
                        name: name.trim(),
                        phone: phone.trim() || undefined,
                        village: village.trim() || undefined,
                        address: address.trim() || undefined,
                        bank_account: bankAccount.trim() || undefined,
                        ifsc_code: ifscCode.trim().toUpperCase() || undefined,
                    },
                    userId
                );

                // Success!
                toast({
                    title: 'Farmer Added!',
                    description: `${name} has been added successfully`,
                });

                // Redirect back to farmers list
                router.push('/farmers');
            } catch (error: any) {
                console.error('Failed to add farmer:', error);
                toast({
                    title: 'Save Failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
            } finally {
                setIsSaving(false);
            }
        },
        [farmerCode, name, phone, village, address, bankAccount, ifscCode, dairyId, userId, router, toast]
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                                Add New Farmer
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Enter farmer details
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-6">
                        {/* Farmer Code (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="farmerCode" className="text-base font-semibold">
                                Farmer Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="farmerCode"
                                type="text"
                                value={farmerCode}
                                onChange={(e) => setFarmerCode(e.target.value)}
                                placeholder="e.g., F001, F002, etc."
                                className="h-12 text-lg"
                                required
                            />
                            <p className="text-sm text-gray-500">Unique code for this farmer</p>
                        </div>

                        {/* Name (Required) */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-semibold">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter farmer's full name"
                                className="h-12 text-lg"
                                required
                            />
                        </div>

                        {/* Phone (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-base font-semibold">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className="h-12 text-lg"
                            />
                        </div>

                        {/* Village (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="village" className="text-base font-semibold">
                                Village
                            </Label>
                            <Input
                                id="village"
                                type="text"
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                placeholder="Enter village name"
                                className="h-12 text-lg"
                            />
                        </div>

                        {/* Address (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-base font-semibold">
                                Full Address
                            </Label>
                            <Input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Complete address"
                                className="h-12 text-lg"
                            />
                        </div>

                        {/* Bank Details */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Bank Details (Optional)
                            </h3>

                            {/* Bank Account Number */}
                            <div className="space-y-2 mb-4">
                                <Label htmlFor="bankAccount" className="text-base font-semibold">
                                    Bank Account Number
                                </Label>
                                <Input
                                    id="bankAccount"
                                    type="text"
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    placeholder="Enter account number"
                                    className="h-12 text-lg"
                                />
                            </div>

                            {/* IFSC Code */}
                            <div className="space-y-2">
                                <Label htmlFor="ifscCode" className="text-base font-semibold">
                                    IFSC Code
                                </Label>
                                <Input
                                    id="ifscCode"
                                    type="text"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    placeholder="e.g., SBIN0001234"
                                    maxLength={11}
                                    className="h-12 text-lg uppercase"
                                />
                            </div>
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
                            disabled={isSaving || !farmerCode.trim() || !name.trim()}
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
                                    Add Farmer
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-sm text-gray-500">
                        Farmer will be saved offline and synced automatically
                    </div>
                </form>
            </main>
        </div>
    );
}
