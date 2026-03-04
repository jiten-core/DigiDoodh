// src/db/hooks.ts - React Hooks for Offline Database
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './schema';
import { syncService, getPendingSyncCount } from './sync';
import type { Farmer, MilkEntry, LedgerEntry, Bill, RateChart } from './schema';

// ============================================
// NETWORK STATUS HOOK
// ============================================

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial status
        setIsOnline(navigator.onLine);

        // Listen for changes
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

// ============================================
// SYNC STATUS HOOK
// ============================================

export function useSyncStatus() {
    const [syncStatus, setSyncStatus] = useState({
        isPending: false,
        pendingCount: 0,
        failedCount: 0,
        isOnline: true,
        isSyncing: false,
    });

    const [isLoading, setIsLoading] = useState(true);

    const refreshStatus = useCallback(async () => {
        const status = await syncService.getSyncStatus();
        setSyncStatus(status);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Initial load
        refreshStatus();

        // Refresh every 5 seconds
        const interval = setInterval(refreshStatus, 5000);

        return () => clearInterval(interval);
    }, [refreshStatus]);

    const triggerSync = useCallback(async () => {
        await syncService.syncNow();
        await refreshStatus();
    }, [refreshStatus]);

    const retryFailed = useCallback(async () => {
        await syncService.retryFailed();
        await refreshStatus();
    }, [refreshStatus]);

    return {
        ...syncStatus,
        isLoading,
        triggerSync,
        retryFailed,
        refresh: refreshStatus,
    };
}

// ============================================
// FARMERS HOOK
// ============================================

export function useFarmers(dairyId: string, activeOnly: boolean = true) {
    const farmers = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            let query = db.farmers.where('dairy_id').equals(dairyId);

            if (activeOnly) {
                const all = await query.toArray();
                return all.filter(f => f.is_active);
            }

            return query.toArray();
        },
        [dairyId, activeOnly],
        []
    );

    return farmers || [];
}

// ============================================
// FARMER SEARCH HOOK
// ============================================

export function useFarmerSearch(dairyId: string, searchTerm: string) {
    const [results, setResults] = useState<Farmer[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const search = async () => {
            setIsSearching(true);
            const lowercaseSearch = searchTerm.toLowerCase();

            const farmers = await db.farmers
                .where('dairy_id')
                .equals(dairyId)
                .toArray();

            const filtered = farmers.filter(
                f =>
                    f.name.toLowerCase().includes(lowercaseSearch) ||
                    f.farmer_code.toLowerCase().includes(lowercaseSearch) ||
                    (f.phone && f.phone.includes(searchTerm))
            );

            setResults(filtered);
            setIsSearching(false);
        };

        const timer = setTimeout(search, 300); // Debounce

        return () => clearTimeout(timer);
    }, [dairyId, searchTerm]);

    return { results, isSearching };
}

// ============================================
// MILK ENTRIES HOOK
// ============================================

export function useMilkEntries(
    dairyId: string,
    filters?: {
        farmerId?: string;
        startDate?: Date;
        endDate?: Date;
        shift?: 'morning' | 'evening';
    }
) {
    const entries = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            let query = db.milk_entries.where('dairy_id').equals(dairyId);

            if (filters?.farmerId) {
                query = db.milk_entries
                    .where(['dairy_id', 'farmer_id'])
                    .equals([dairyId, filters.farmerId]);
            }

            let results = await query.toArray();

            // Filter by date range
            if (filters?.startDate || filters?.endDate) {
                results = results.filter(entry => {
                    const entryDate = new Date(entry.entry_date);
                    if (filters.startDate && entryDate < filters.startDate) return false;
                    if (filters.endDate && entryDate > filters.endDate) return false;
                    return true;
                });
            }

            // Filter by shift
            if (filters?.shift) {
                results = results.filter(entry => entry.shift === filters.shift);
            }

            // Sort by date DESC
            results.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

            return results;
        },
        [dairyId, filters?.farmerId, filters?.startDate, filters?.endDate, filters?.shift],
        []
    );

    return entries || [];
}

// ============================================
// DAILY STATS HOOK
// ============================================

export function useDailyStats(dairyId: string, date: Date = new Date()) {
    const stats = useLiveQuery(
        async () => {
            if (!dairyId) return null;

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const entries = await db.milk_entries
                .where('dairy_id')
                .equals(dairyId)
                .toArray();

            const todayEntries = entries.filter(e => {
                const entryDate = new Date(e.entry_date);
                return entryDate >= startOfDay && entryDate <= endOfDay;
            });

            const morningEntries = todayEntries.filter(e => e.shift === 'morning');
            const eveningEntries = todayEntries.filter(e => e.shift === 'evening');

            return {
                totalEntries: todayEntries.length,
                totalLiters: todayEntries.reduce((sum, e) => sum + e.quantity, 0),
                totalAmount: todayEntries.reduce((sum, e) => sum + e.amount, 0),
                morning: {
                    entries: morningEntries.length,
                    liters: morningEntries.reduce((sum, e) => sum + e.quantity, 0),
                    amount: morningEntries.reduce((sum, e) => sum + e.amount, 0),
                },
                evening: {
                    entries: eveningEntries.length,
                    liters: eveningEntries.reduce((sum, e) => sum + e.quantity, 0),
                    amount: eveningEntries.reduce((sum, e) => sum + e.amount, 0),
                },
            };
        },
        [dairyId, date.toISOString()],
        null
    );

    return stats;
}

// ============================================
// LEDGER BALANCE HOOK
// ============================================

export function useFarmerBalance(dairyId: string, farmerId: string) {
    const balance = useLiveQuery(
        async () => {
            if (!dairyId || !farmerId) return 0;

            const entries = await db.ledger_entries
                .where(['dairy_id', 'farmer_id'])
                .equals([dairyId, farmerId])
                .toArray();

            const credits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
            const debits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

            return credits - debits;
        },
        [dairyId, farmerId],
        0
    );

    return balance || 0;
}

// ============================================
// RATE CHARTS HOOK
// ============================================

export function useRateCharts(dairyId: string, activeOnly: boolean = true) {
    const rateCharts = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            let query = db.rate_charts.where('dairy_id').equals(dairyId);

            let results = await query.toArray();

            if (activeOnly) {
                results = results.filter(rc => rc.is_active);
            }

            return results;
        },
        [dairyId, activeOnly],
        []
    );

    return rateCharts || [];
}

// ============================================
// LEDGER ENTRIES HOOK
// ============================================

export function useLedgerEntries(dairyId: string, farmerId?: string) {
    const entries = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            let query = farmerId
                ? db.ledger_entries.where(['dairy_id', 'farmer_id']).equals([dairyId, farmerId])
                : db.ledger_entries.where('dairy_id').equals(dairyId);

            let results = await query.toArray();

            // Sort by date DESC
            results.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

            return results;
        },
        [dairyId, farmerId],
        []
    );

    return entries || [];
}

// ============================================
// FARMER BALANCES HOOK (All farmers at once)
// ============================================

export function useFarmerBalances(dairyId: string) {
    const balances = useLiveQuery(
        async () => {
            if (!dairyId) return {};

            const entries = await db.ledger_entries
                .where('dairy_id')
                .equals(dairyId)
                .toArray();

            // Group by farmer_id and compute balance
            const balanceMap: Record<string, { credit: number; debit: number; balance: number; lastEntry: Date }> = {};

            for (const entry of entries) {
                if (!balanceMap[entry.farmer_id]) {
                    balanceMap[entry.farmer_id] = { credit: 0, debit: 0, balance: 0, lastEntry: new Date(0) };
                }

                const fb = balanceMap[entry.farmer_id];
                if (entry.type === 'credit') {
                    fb.credit += entry.amount;
                    fb.balance += entry.amount;
                } else {
                    fb.debit += entry.amount;
                    fb.balance -= entry.amount;
                }

                const entryDate = new Date(entry.entry_date);
                if (entryDate > fb.lastEntry) {
                    fb.lastEntry = entryDate;
                }
            }

            return balanceMap;
        },
        [dairyId],
        {} as Record<string, { credit: number; debit: number; balance: number; lastEntry: Date }>
    );

    return balances || ({} as Record<string, { credit: number; debit: number; balance: number; lastEntry: Date }>);
}

// ============================================
// AUDIT LOG HOOK
// ============================================

export function useAuditLog(dairyId: string, limit: number = 50) {
    const logs = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            const allLogs = await db.audit_logs.toArray();

            // Sort by timestamp DESC and limit
            return allLogs
                .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
        },
        [dairyId, limit],
        []
    );

    return logs || [];
}

// ============================================
// BILLS HOOK
// ============================================

export function useBills(dairyId: string, farmerId?: string) {
    const bills = useLiveQuery(
        async () => {
            if (!dairyId) return [];

            let query = farmerId
                ? db.bills.where(['dairy_id', 'farmer_id']).equals([dairyId, farmerId])
                : db.bills.where('dairy_id').equals(dairyId);

            let results = await query.toArray();

            // Sort by created date DESC
            results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return results;
        },
        [dairyId, farmerId],
        []
    );

    return bills || [];
}

// ============================================
// INITIALIZE DB HOOK
// ============================================

export function useInitializeDB() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await db.open();
                console.log('✅ Database initialized');
                setIsInitialized(true);

                // Start auto-sync
                syncService.startAutoSync();
                console.log('✅ Auto-sync started');
            } catch (err: any) {
                console.error('❌ Database initialization failed:', err);
                setError(err);
            }
        };

        init();

        // Cleanup
        return () => {
            syncService.stopAutoSync();
        };
    }, []);

    return { isInitialized, error };
}
