import { db } from '../../shared/db';

export const financeService = {
    async getDailyStats(dairyId: string, date: string) {
        const { data, error } = await db
            .from('view_founder_daily_stats')
            .select('*')
            .eq('dairy_id', dairyId)
            .eq('stats_date', date)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return {
                total_farmers: 0,
                total_liters: 0,
                avg_fat: 0,
                total_amount: 0
            };
            throw error;
        }
        return data;
    },

    async getTotalPendingPayments(dairyId: string): Promise<number> {
        const { data, error } = await db
            .from('view_farmer_balances')
            .select('balance')
            .eq('dairy_id', dairyId);

        if (error) throw error;

        // Balance is Net (Credits - Debits). 
        // Usually positive balance means we owe the farmer (Credit).
        return data.reduce((sum, item) => sum + (item.balance > 0 ? item.balance : 0), 0);
    },

    async getBalances(dairyId: string) {
        const { data, error } = await db
            .from('view_farmer_balances')
            .select('*')
            .eq('dairy_id', dairyId);

        if (error) throw error;
        return data || [];
    }
};
