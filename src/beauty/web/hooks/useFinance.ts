import { useState, useCallback } from 'react';
import { financeService } from '@/brain/finance-ops/service';
import { ledgerService } from '@/brain/ledger-engine/service';
import { toast } from 'sonner';

export function useFinance(dairyId?: string) {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [balance, setBalance] = useState<number>(0);
    const [balances, setBalances] = useState<any[]>([]);
    const [totalPending, setTotalPending] = useState<number>(0);

    const fetchDailyStats = useCallback(async (date: string) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await financeService.getDailyStats(dairyId, date);
            setStats(data);
        } catch (error: any) {
            toast.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const fetchFarmerBalance = useCallback(async (farmerId: string) => {
        try {
            const bal = await ledgerService.getFarmerBalance(farmerId);
            setBalance(bal);
        } catch (error: any) {
            console.error('Balance fetch error:', error);
        }
    }, []);

    const fetchBalances = useCallback(async () => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await financeService.getBalances(dairyId);
            setBalances(data);
        } catch (error: any) {
            toast.error('Failed to load balances');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const fetchTotalPending = useCallback(async () => {
        if (!dairyId) return;
        try {
            const total = await financeService.getTotalPendingPayments(dairyId);
            setTotalPending(total);
        } catch (error: any) {
            console.error('Pending balance error:', error);
        }
    }, [dairyId]);

    return {
        loading,
        stats,
        balance,
        balances,
        totalPending,
        fetchDailyStats,
        fetchFarmerBalance,
        fetchBalances,
        fetchTotalPending
    };
}
