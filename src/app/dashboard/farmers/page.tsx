import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const FarmerManagement = dynamic(
    () => import('@/components/farmers/FarmerManagement'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

export const metadata = {
    title: 'Farmers | DigiDhoodh',
    description: 'Manage farmer profiles and information',
}

export default function FarmersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <FarmerManagement />
        </Suspense>
    )
}
