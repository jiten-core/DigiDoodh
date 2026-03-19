'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'

const SuperAdminDashboard = dynamic(
    () => import('@/components/admin/SuperAdminDashboard'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading Admin Panel...</p>
                </div>
            </div>
        )
    }
)

export default function AdminPage() {
    return (
        <AuthGuard requireAdmin>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading Admin Panel...</p>
                    </div>
                </div>
            }>
                <SuperAdminDashboard />
            </Suspense>
        </AuthGuard>
    )
}
