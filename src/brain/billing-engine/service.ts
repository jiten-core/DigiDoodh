import { db } from '../../shared/db';
import { Bill } from '../../shared/types';
import { emit } from '../events/bus';
import { EVENTS } from '../events/events';

export const billingService = {
    async generateBill(input: {
        dairyId: string;
        entityType: 'farmer' | 'buyer';
        entityId: string;
        from: string;
        to: string;
    }): Promise<{ billId: string }> {

        // In a real system, the brain would calculate the bill from milk_entries
        // For now, we utilize the RPC or logic from the previous BillingService

        const { data: bill, error } = await db
            .from('farmer_bills')
            .insert([{
                dairy_id: input.dairyId,
                farmer_id: input.entityId,
                period_start: input.from,
                period_end: input.to,
                status: 'draft',
                // In a real app, these would be calculated values
                total_quantity: 0,
                avg_fat: 0,
                avg_snf: 0,
                gross_amount: 0,
                deductions: 0,
                net_amount: 0,
                bill_number: `BILL-${Date.now()}`
            }])
            .select('id')
            .single();

        if (error) throw error;

        await emit(EVENTS.BILL_FINALIZED, { billId: bill.id });

        return { billId: bill.id };
    },

    async getBills(dairyId: string, farmerId?: string): Promise<Bill[]> {
        let query = db
            .from('farmer_bills')
            .select('*, farmer:farmers(name, code)')
            .eq('dairy_id', dairyId);

        if (farmerId) {
            query = query.eq('farmer_id', farmerId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async finalizeBill(billId: string): Promise<void> {
        const { error } = await db
            .from('farmer_bills')
            .update({ status: 'finalized' })
            .eq('id', billId);

        if (error) throw error;
    },

    async markAsPaid(billId: string): Promise<void> {
        const { error } = await db
            .from('farmer_bills')
            .update({ status: 'paid' })
            .eq('id', billId);

        if (error) throw error;
    }
};
