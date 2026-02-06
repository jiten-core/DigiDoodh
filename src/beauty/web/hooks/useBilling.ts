import { useState, useCallback } from 'react';
import { billingService } from '@/brain/billing-engine/service';
import { Bill } from '@/shared/types';
import { toast } from 'sonner';

export function useBilling(dairyId?: string) {
    const [loading, setLoading] = useState(false);
    const [bills, setBills] = useState<Bill[]>([]);

    const fetchBills = useCallback(async (entityId?: string) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await billingService.getBills(dairyId, entityId);
            setBills(data);
        } catch (error: any) {
            toast.error('Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const generateNewBill = async (farmerId: string, period: { start_date: string, end_date: string }) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const result = await billingService.generateBill({
                dairyId,
                entityType: 'farmer',
                entityId: farmerId,
                from: period.start_date,
                to: period.end_date
            });
            toast.success('Bill generated');
            await fetchBills();
            return result;
        } catch (error: any) {
            toast.error('Error generating bill: ' + error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const finalizeBill = async (billId: string) => {
        try {
            setLoading(true);
            await billingService.finalizeBill(billId);
            toast.success('Bill finalized');
            await fetchBills();
        } catch (error: any) {
            toast.error('Error finalizing bill');
        } finally {
            setLoading(false);
        }
    };

    const markBillAsPaid = async (billId: string) => {
        try {
            setLoading(true);
            await billingService.markAsPaid(billId);
            toast.success('Bill marked as paid');
            await fetchBills();
        } catch (error: any) {
            toast.error('Error marking as paid');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        bills,
        fetchBills,
        generateNewBill,
        finalizeBill,
        markBillAsPaid
    };
}
