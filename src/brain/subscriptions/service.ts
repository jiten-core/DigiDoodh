import { db } from '../../shared/db';

export type Feature = 'inventory' | 'analytics' | 'billing' | 'whatsapp';

export const subscriptionService = {
    checkFeature(dairyId: string, feature: Feature): boolean {
        // In a real app, this would check the current subscription tier of the dairy
        // For now, we mock it or check a local cache
        return true;
    },

    async getSubscriptionDetails(dairyId: string) {
        const { data, error } = await db
            .from('dairy_subscriptions')
            .select('*')
            .eq('dairy_id', dairyId)
            .single();

        if (error) return null;
        return data;
    }
};
