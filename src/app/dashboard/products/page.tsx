'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProductManager = dynamic(
    () => import('@/components/products/ProductManager'),
    { loading: () => <LoadingState /> }
);

const FarmerProductRequest = dynamic(
    () => import('@/components/products/FarmerProductRequest'),
    { loading: () => <LoadingState /> }
);

function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-dairy-600" />
        </div>
    );
}

export default function ProductsPage() {
    const { profile } = useAuth();

    // Determine which component to show based on role
    const isOwner = profile?.role === 'DAIRY_OWNER' || profile?.role === 'INTERNAL_SUPER_ADMIN' || profile?.role === 'STAFF';
    const isFarmer = profile?.role === 'FARMER';

    return (
        <Suspense fallback={<LoadingState />}>
            {isFarmer ? (
                <FarmerProductRequest />
            ) : (
                <ProductManager />
            )}
        </Suspense>
    );
}
