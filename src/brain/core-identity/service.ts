import { db } from '../../shared/db';
import { Farmer } from '../../shared/types';

export const identityService = {
    async getFarmers(dairyId: string): Promise<Farmer[]> {
        const { data, error } = await db
            .from('farmers')
            .select('*')
            .eq('dairy_id', dairyId)
            .eq('active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    async registerFarmer(dairyId: string, farmer: Partial<Farmer>): Promise<Farmer> {
        const { data, error } = await db
            .from('farmers')
            .insert([{ ...farmer, dairy_id: dairyId }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
