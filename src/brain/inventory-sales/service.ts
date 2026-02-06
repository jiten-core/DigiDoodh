import { db } from '../../shared/db';
import { Product, ProductRequest } from '../../shared/types';
import { emit } from '../events/bus';
import { EVENTS } from '../events/events';

export const inventoryService = {
    async getProducts(dairyId: string): Promise<Product[]> {
        const { data, error } = await db
            .from('products')
            .select('*')
            .eq('dairy_id', dairyId)
            .eq('active', true);

        if (error) throw error;
        return data || [];
    },

    async requestProduct(input: {
        dairyId: string;
        farmerId: string;
        productId: string;
        quantity: number;
    }): Promise<void> {
        const { error } = await db
            .from('product_requests')
            .insert([{
                dairy_id: input.dairyId,
                farmer_id: input.farmerId,
                product_id: input.productId,
                quantity: input.quantity,
                status: 'requested'
            }]);

        if (error) throw error;

        await emit(EVENTS.PRODUCT_REQUESTED, input);
    },

    async getRequests(dairyId: string, farmerId?: string): Promise<ProductRequest[]> {
        let query = db
            .from('product_requests')
            .select(`
            *,
            farmer:farmers(name),
            product:products(name, price, stock)
        `)
            .eq('dairy_id', dairyId);

        if (farmerId) {
            query = query.eq('farmer_id', farmerId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async approveRequest(requestId: string): Promise<void> {
        // 1. Fetch request details
        const { data: request, error: reqError } = await db
            .from('product_requests')
            .select('*, product:products(*)')
            .eq('id', requestId)
            .single();

        if (reqError) throw reqError;

        const totalAmount = request.quantity * request.product.price;

        // 2. Update status 
        const { error: updateError } = await db
            .from('product_requests')
            .update({ status: 'approved' })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // 3. Create Ledger Entry (Debit farmer)
        const { error: ledgerError } = await db
            .from('ledger_entries')
            .insert([{
                dairy_id: request.dairy_id,
                entity_type: 'farmer',
                entity_id: request.farmer_id,
                entry_type: 'product',
                credit: 0,
                debit: totalAmount,
                ref_table: 'product_requests',
                ref_id: requestId,
                notes: `Product Purchase: ${request.product.name} x ${request.quantity}`
            }]);

        if (ledgerError) throw ledgerError;

        // 4. Decrement Stock
        const { error: stockError } = await db
            .from('products')
            .update({ stock: request.product.stock - request.quantity })
            .eq('id', request.product_id);

        if (stockError) throw stockError;

        await emit(EVENTS.PRODUCT_APPROVED, { requestId });
    },

    async rejectRequest(requestId: string): Promise<void> {
        const { error } = await db
            .from('product_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) throw error;
    }
};
