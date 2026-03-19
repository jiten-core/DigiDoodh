'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
    children: ReactNode
    requiredRole?: 'PLATFORM_SUPER_ADMIN' | 'INTERNAL_SUPER_ADMIN' | 'DAIRY_OWNER' | 'STAFF' | 'FARMER' | 'BUYER'
    requireAdmin?: boolean
}

export function AuthGuard({ children, requiredRole, requireAdmin }: AuthGuardProps) {
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading) {
            // Not logged in - redirect to login
            if (!user) {
                router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
                return
            }

            // Check admin requirement
            if (requireAdmin && profile) {
                const isAdmin = profile.role === 'PLATFORM_SUPER_ADMIN' || profile.role === 'INTERNAL_SUPER_ADMIN'
                if (!isAdmin) {
                    router.push('/dashboard')
                    return
                }
            }

            // Check specific role requirement
            if (requiredRole && profile && profile.role !== requiredRole) {
                router.push('/dashboard')
                return
            }
        }
    }, [user, profile, loading, router, pathname, requiredRole, requireAdmin])

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // Not authorized
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
