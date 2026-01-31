'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Wifi,
    WifiOff,
    RefreshCw,
    Check,
    AlertTriangle,
    Cloud,
    CloudOff,
    Loader2
} from 'lucide-react'
import { offlineEngine } from '@/lib/offline-engine'
import { toast } from 'sonner'

interface SyncStatus {
    isOnline: boolean
    queueLength: number
    pendingItems: number
    failedItems: number
    syncInProgress: boolean
}

interface OfflineContextType {
    isOnline: boolean
    syncStatus: SyncStatus
    syncNow: () => Promise<void>
    saveMilkCollection: (data: any) => Promise<string>
    getMilkCollections: (filters?: any) => Promise<any[]>
    getFarmers: () => Promise<any[]>
    calculateRate: (fat: number, snf?: number) => Promise<number>
}

const OfflineContext = createContext<OfflineContextType | null>(null)

export function useOffline() {
    const context = useContext(OfflineContext)
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider')
    }
    return context
}

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(true)
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isOnline: true,
        queueLength: 0,
        pendingItems: 0,
        failedItems: 0,
        syncInProgress: false,
    })

    useEffect(() => {
        // Check initial online status
        setIsOnline(navigator.onLine)

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Back online! Syncing data...')
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.warning('You are offline. Data will be saved locally.')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Subscribe to sync status changes
        const unsubscribe = offlineEngine?.subscribe((status) => {
            setSyncStatus(status)
        })

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            unsubscribe?.()
        }
    }, [])

    const syncNow = async () => {
        if (!offlineEngine) return

        toast.loading('Syncing data...')
        const result = await offlineEngine.syncPendingData()

        if (result.synced > 0) {
            toast.success(`Synced ${result.synced} items`)
        }
        if (result.failed > 0) {
            toast.error(`${result.failed} items failed to sync`)
        }
        if (result.synced === 0 && result.failed === 0) {
            toast.info('All data is already synced')
        }
    }

    const saveMilkCollection = async (data: any) => {
        if (!offlineEngine) throw new Error('Offline engine not available')
        return offlineEngine.saveMilkCollection(data)
    }

    const getMilkCollections = async (filters?: any) => {
        if (!offlineEngine) return []
        return offlineEngine.getMilkCollections(filters)
    }

    const getFarmers = async () => {
        if (!offlineEngine) return []
        return offlineEngine.getFarmers()
    }

    const calculateRate = async (fat: number, snf?: number) => {
        if (!offlineEngine) return 35 // Default rate
        return offlineEngine.calculateRate(fat, snf)
    }

    return (
        <OfflineContext.Provider value={{
            isOnline,
            syncStatus,
            syncNow,
            saveMilkCollection,
            getMilkCollections,
            getFarmers,
            calculateRate,
        }}>
            {children}
        </OfflineContext.Provider>
    )
}

// Sync Status Indicator Component
export function SyncStatusIndicator() {
    const { isOnline, syncStatus, syncNow } = useOffline()

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
        >
            <AnimatePresence mode="wait">
                {syncStatus.syncInProgress ? (
                    <motion.div
                        key="syncing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Syncing...
                        </Badge>
                    </motion.div>
                ) : isOnline ? (
                    <motion.div
                        key="online"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            Online
                            {syncStatus.pendingItems > 0 && (
                                <span className="ml-1">({syncStatus.pendingItems} pending)</span>
                            )}
                        </Badge>
                    </motion.div>
                ) : (
                    <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <CloudOff className="w-3 h-3" />
                            Offline
                            {syncStatus.queueLength > 0 && (
                                <span className="ml-1">({syncStatus.queueLength} queued)</span>
                            )}
                        </Badge>
                    </motion.div>
                )}
            </AnimatePresence>

            {syncStatus.pendingItems > 0 && isOnline && !syncStatus.syncInProgress && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={syncNow}
                    className="h-6 px-2"
                >
                    <RefreshCw className="w-3 h-3" />
                </Button>
            )}

            {syncStatus.failedItems > 0 && (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {syncStatus.failedItems} failed
                </Badge>
            )}
        </motion.div>
    )
}

// Offline-aware save button
export function OfflineSaveButton({
    onClick,
    loading,
    children
}: {
    onClick: () => void
    loading?: boolean
    children: ReactNode
}) {
    const { isOnline } = useOffline()

    return (
        <Button
            onClick={onClick}
            disabled={loading}
            className="relative"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : !isOnline ? (
                <CloudOff className="w-4 h-4 mr-2" />
            ) : (
                <Check className="w-4 h-4 mr-2" />
            )}
            {children}
            {!isOnline && (
                <span className="ml-2 text-xs opacity-70">(Offline)</span>
            )}
        </Button>
    )
}
