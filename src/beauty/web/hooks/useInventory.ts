import { useState, useCallback } from 'react';
import { inventoryService } from '@/brain/inventory-sales/service';
import { Product, ProductRequest } from '@/shared/types';
import { toast } from 'sonner';

export function useInventory(dairyId?: string) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [requests, setRequests] = useState<ProductRequest[]>([]);

    const fetchProducts = useCallback(async () => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await inventoryService.getProducts(dairyId);
            setProducts(data);
        } catch (error: any) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const fetchRequests = useCallback(async (farmerId?: string) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            const data = await inventoryService.getRequests(dairyId, farmerId);
            setRequests(data);
        } catch (error: any) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    }, [dairyId]);

    const createRequest = async (request: any) => {
        if (!dairyId) return;
        try {
            setLoading(true);
            await inventoryService.requestProduct({
                ...request,
                dairyId
            });
            toast.success('Product requested');
            await fetchRequests(request.farmerId);
        } catch (error: any) {
            toast.error('Error requesting product');
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (requestId: string) => {
        try {
            setLoading(true);
            await inventoryService.approveRequest(requestId);
            toast.success('Request approved');
            await fetchRequests();
        } catch (error: any) {
            toast.error('Error approving request');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        products,
        requests,
        fetchProducts,
        fetchRequests,
        createRequest,
        approveRequest
    };
}
