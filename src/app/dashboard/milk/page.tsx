import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Dynamic import for code splitting
const MilkCollection = dynamic(
    () => import('@/components/milk/MilkCollection'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

export const metadata = {
    title: 'Milk Collection | DigiDhoodh',
    description: 'Manage daily milk collection entries',
}

export default function MilkCollectionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <MilkCollection />
        </Suspense>
    )
}
