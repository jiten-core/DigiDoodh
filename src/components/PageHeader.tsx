'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
    title: string
    subtitle?: string
    showBack?: boolean
    backUrl?: string
    showHome?: boolean
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    subtitle,
    showBack = true,
    backUrl,
    showHome = false,
    actions,
    className = '',
}: PageHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (backUrl) {
            router.push(backUrl)
        } else {
            router.back()
        }
    }

    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50 mb-6 ${className}`}>
            <div className="flex items-start gap-4">
                {showBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-10 w-10 rounded-xl hover:bg-muted -ml-2"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                )}
                {showHome && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard')}
                        className="h-10 w-10 rounded-xl hover:bg-muted"
                        aria-label="Go to dashboard"
                    >
                        <Home className="h-5 w-5 text-muted-foreground" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 self-end md:self-auto">{actions}</div>}
        </div>
    )
}
