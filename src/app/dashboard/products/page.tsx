import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ProductManager = dynamic(
    () => import('@/components/products/ProductManager'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

export const metadata = {
    title: 'Products & Inventory | DigiDhoodh',
    description: 'Manage your products, inventory, and farmer requests',
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <ProductManager />
        </Suspense>
    )
}
