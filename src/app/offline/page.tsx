'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    WifiOff,
    RefreshCw,
    Home,
    Database,
    CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
    useEffect(() => {
        // Check if back online
        const checkOnline = () => {
            if (navigator.onLine) {
                window.location.reload()
            }
        }

        window.addEventListener('online', checkOnline)
        return () => window.removeEventListener('online', checkOnline)
    }, [])

    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-md w-full shadow-2xl">
                    <CardContent className="p-8 text-center">
                        {/* Offline Icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: 'reverse'
                            }}
                            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                            <WifiOff className="w-12 h-12 text-white" />
                        </motion.div>

                        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
                        <p className="text-gray-500 mb-6">
                            No internet connection detected. But don't worry, you can still work!
                        </p>

                        {/* Offline Features */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Available Offline
                            </h3>
                            <ul className="space-y-2 text-sm text-green-600 dark:text-green-500">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Add milk collection entries
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    View farmer list
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Calculate rates
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Print receipts
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Scan QR codes
                                </li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-3">
                                Data will sync automatically when you're back online
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleRetry}
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Link href="/dashboard" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>

                        {/* Sync Status */}
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs text-gray-400">
                                Pending entries will be synced: <span className="font-mono">0 items</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-6 text-sm text-gray-500"
                >
                    DigiDhoodh works offline! 📴
                </motion.div>
            </motion.div>
        </div>
    )
}
