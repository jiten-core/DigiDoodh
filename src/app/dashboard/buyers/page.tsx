import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const BuyerManagement = dynamic(
    () => import('@/components/buyers/BuyerManagement'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

export const metadata = {
    title: 'Buyers | DigiDhoodh',
    description: 'Manage buyer profiles and invoices',
}

export default function BuyersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <BuyerManagement />
        </Suspense>
    )
}
