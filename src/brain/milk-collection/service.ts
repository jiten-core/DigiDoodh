import { db } from '../../shared/db';
import { MilkEntry } from '../../shared/types';
import { emit } from '../events/bus';
import { EVENTS } from '../events/events';
import { rateEngine } from './rate-engine';

export const milkService = {
    async recordMilk(input: {
        dairyId: string;
        farmerId: string;
        liters: number;
        fat?: number;
        snf?: number;
        session: 'morning' | 'evening';
        offlineId?: string;
    }): Promise<{ entryId: string }> {

        const entryDate = new Date().toISOString().split('T')[0];

        // Calculate Rate using Brain logic
        const rate = await rateEngine.calculateRate(input.dairyId, input.fat || 0, input.snf || 0);
        const amount = rate * input.liters;

        const { data, error } = await db
            .from('milk_entries')
            .insert([{
                dairy_id: input.dairyId,
                farmer_id: input.farmerId,
                liters: input.liters,
                fat: input.fat,
                snf: input.snf,
                rate: rate,
                amount: amount,
                session: input.session,
                entry_date: entryDate,
                offline_id: input.offlineId || crypto.randomUUID(),
                is_correction: false
            }])
            .select('id')
            .single();

        if (error) throw error;

        // Emit event for other brain modules to react
        await emit(EVENTS.MILK_RECORDED, {
            entryId: data.id,
            farmerId: input.farmerId,
            liters: input.liters,
            dairyId: input.dairyId
        });

        return { entryId: data.id };
    },

    async getMilkEntries(dairyId: string, date: string): Promise<MilkEntry[]> {
        const { data, error } = await db
            .from('milk_entries')
            .select('*, farmer:farmers(id, name, code)')
            .eq('dairy_id', dairyId)
            .eq('entry_date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
