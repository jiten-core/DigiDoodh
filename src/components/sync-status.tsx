// src/components/sync-status.tsx - Sync Status Indicator Component
'use client';

import { Cloud, CloudOff, RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { useSyncStatus, useOnlineStatus } from '@/db/hooks';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function SyncStatusIndicator() {
    const { isPending, pendingCount, failedCount, isSyncing, triggerSync, retryFailed } =
        useSyncStatus();
    const isOnline = useOnlineStatus();

    // Offline
    if (!isOnline) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <WifiOff className="h-4 w-4" />
                            <span className="text-sm font-medium">Offline</span>
                            {pendingCount > 0 && (
                                <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Working offline</p>
                        {pendingCount > 0 && <p className="text-xs mt-1">{pendingCount} items will sync when online</p>}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Syncing
    if (isSyncing) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Syncing...</span>
            </div>
        );
    }

    // Failed items
    if (failedCount > 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={retryFailed}
                            className="flex items-center gap-2 px-3 py-1.5 h-auto bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Sync Failed</span>
                            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                {failedCount}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to retry failed syncs</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Pending items
    if (isPending && pendingCount > 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={triggerSync}
                            className="flex items-center gap-2 px-3 py-1.5 h-auto bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
                        >
                            <Cloud className="h-4 w-4" />
                            <span className="text-sm font-medium">Pending</span>
                            <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-full">
                                {pendingCount}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to sync now</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // All synced
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                        <Cloud className="h-4 w-4" />
                        <span className="text-sm font-medium">Synced</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>All data synced</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Compact version for mobile
export function SyncStatusIcon() {
    const { isPending, pendingCount, isSyncing } = useSyncStatus();
    const isOnline = useOnlineStatus();

    if (!isOnline) {
        return (
            <div className="relative">
                <WifiOff className="h-5 w-5 text-orange-600" />
                {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                )}
            </div>
        );
    }

    if (isSyncing) {
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
    }

    if (isPending && pendingCount > 0) {
        return (
            <div className="relative">
                <Cloud className="h-5 w-5 text-yellow-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                </span>
            </div>
        );
    }

    return <Cloud className="h-5 w-5 text-green-600" />;
}
