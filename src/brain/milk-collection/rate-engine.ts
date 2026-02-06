import { db } from '../../shared/db';

export interface RateChartRow {
    fat: number;
    snf: number;
    rate: number;
}

export const rateEngine = {
    async calculateRate(dairyId: string, fat: number, snf: number): Promise<number> {
        // 1. Find active rate chart for the dairy
        const { data: chart, error: chartError } = await db
            .from('rate_charts')
            .select('id')
            .eq('dairy_id', dairyId)
            .eq('is_active', true)
            .single();

        if (chartError || !chart) {
            // Fallback to a default rate if no chart found
            return 40;
        }

        // 2. Find closest matching rate row
        // We look for exact match or nearest lower match
        const { data: row, error: rowError } = await db
            .from('rate_chart_rows')
            .select('rate')
            .eq('chart_id', chart.id)
            .lte('fat', fat)
            .lte('snf', snf)
            .order('fat', { ascending: false })
            .order('snf', { ascending: false })
            .limit(1)
            .single();

        if (rowError || !row) {
            return 35; // Minimum fallback
        }

        return row.rate;
    }
};
