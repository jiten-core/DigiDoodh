import { db } from '../../shared/db';

export const ledgerService = {
    async getFarmerBalance(farmerId: string): Promise<number> {
        const { data, error } = await db
            .from('view_farmer_balances')
            .select('balance')
            .eq('farmer_id', farmerId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return 0; // No balance found
            throw error;
        }
        return data?.balance || 0;
    },

    async getBuyerBalance(buyerId: string): Promise<number> {
        // Current schema uses view_farmer_balances, in future we might have view_buyer_balances
        return 0;
    }
};
