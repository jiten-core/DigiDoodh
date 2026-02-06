import { useState, useCallback } from 'react';
import { milkService } from '@/brain/milk-collection/service';
import { identityService } from '@/brain/core-identity/service';
import { MilkEntry, Farmer } from '@/shared/types';
import { toast } from 'sonner';

export function useCollection(dairyId?: string) {
    const [loading, setLoading] = useState(false);
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [entries, setEntries] = useState<MilkEntry[]>([]);

    const fetchFarmers = useCallback(async () => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await identityService.getFarmers(dairyId);
            setFarmers(data);
        } catch (error: any) {
            toast.error('Failed to load farmers');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const fetchEntries = useCallback(async (date: string) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await milkService.getMilkEntries(dairyId, date);
            setEntries(data);
        } catch (error: any) {
            toast.error('Failed to load entries');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const saveEntry = async (entry: any) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const result = await milkService.recordMilk({
                ...entry,
                dairyId
            });
            toast.success('Milk entry recorded');
            await fetchEntries(new Date().toISOString().split('T')[0]);
            return result;
        } catch (error: any) {
            toast.error('Error recording milk: ' + error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const saveFarmer = async (farmer: Partial<Farmer>) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            await identityService.registerFarmer(dairyId, farmer);
            toast.success('Farmer registered');
            await fetchFarmers();
        } catch (error: any) {
            toast.error('Error registering farmer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        farmers,
        entries,
        fetchFarmers,
        fetchEntries,
        saveEntry,
        saveFarmer
    };
}
