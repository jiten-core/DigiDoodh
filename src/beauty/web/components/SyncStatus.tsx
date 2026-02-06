'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SyncStatus() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Handle online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Dummy interval to simulate pending items check
        const interval = setInterval(() => {
            if (isOnline && Math.random() > 0.8 && pendingCount > 0) {
                syncData();
            }
        }, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [isOnline, pendingCount]);

    const syncData = async () => {
        setSyncing(true);
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPendingCount(0);
        setSyncing(false);
    };

    // Add some random pending data for demo
    useEffect(() => {
        if (!isOnline) {
            setPendingCount(prev => prev + 1);
        }
    }, [isOnline]);

    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <AnimatePresence mode="wait">
                {isOnline ? (
                    <motion.div
                        key="online"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <div className="relative">
                            <Wifi className="w-5 h-5 text-green-400" />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-green-400 rounded-full"
                            />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {isHindi ? 'ऑनलाइन' : 'Online'}
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <WifiOff className="w-5 h-5 text-red-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {isHindi ? 'ऑफलाइन' : 'Offline'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {pendingCount > 0 && (
                <div className="h-4 w-[1px] bg-white/20 mx-1" />
            )}

            {pendingCount > 0 && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={isOnline ? syncData : undefined}
                    disabled={syncing}
                    className="flex items-center gap-2"
                >
                    {syncing ? (
                        <RefreshCw className="w-4 h-4 text-dairy-300 animate-spin" />
                    ) : (
                        <CloudOfflineIcon className="w-4 h-4 text-dairy-300" />
                    )}
                    <span className="text-xs font-bold text-dairy-100">
                        {pendingCount} {isHindi ? 'पेंडिंग' : 'Pending'}
                    </span>
                </motion.button>
            )}

            {!syncing && pendingCount === 0 && isOnline && (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
        </div>
    );
}

// Custom icons since HEROICONS might not be standard in lucide-react
function CloudOfflineIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    )
}
