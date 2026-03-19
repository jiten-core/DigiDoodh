import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const ReportsAnalytics = dynamic(
    () => import('@/components/reports/ReportsAnalytics'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

export const metadata = {
    title: 'Reports & Analytics | DigiDhoodh',
    description: 'View reports, charts, and analytics',
}

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <ReportsAnalytics />
        </Suspense>
    )
}
