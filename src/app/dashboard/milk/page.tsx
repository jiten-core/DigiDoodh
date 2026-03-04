'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { Loader2, Zap, Calculator } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dynamic imports for code splitting
const PaperMilkEntry = dynamic(
    () => import('@/components/milk/PaperMilkEntry'),
    {
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }
)

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

export default function MilkCollectionPage() {
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'advanced')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-12">
                    <TabsTrigger
                        value="simple"
                        className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm h-full"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        <span className="font-medium">Simple Mode</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="advanced"
                        className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm h-full"
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        <span className="font-medium">Advanced</span>
                    </TabsTrigger>
                </TabsList>

                {/* Simple Mode - Paper-like Entry */}
                <TabsContent value="simple" className="mt-0 -mx-4 lg:mx-0">
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    }>
                        <PaperMilkEntry />
                    </Suspense>
                </TabsContent>

                {/* Advanced Mode - Full Features */}
                <TabsContent value="advanced" className="mt-4">
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    }>
                        <MilkCollection />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
