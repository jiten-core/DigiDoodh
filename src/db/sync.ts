// src/db/sync.ts - Background Sync Service
import { db } from './schema';
import type { SyncQueue } from './schema';

// ============================================
// SYNC SERVICE
// ============================================

class SyncService {
    private isSyncing: boolean = false;
    private syncInterval: NodeJS.Timeout | null = null;
    private retryDelay: number = 5000; // 5 seconds
    private maxRetries: number = 5;

    /**
     * Start automatic background sync
     */
    startAutoSync(intervalMs: number = 30000) {
        console.log('🔄 Starting auto-sync...');

        // Sync immediately
        this.syncNow();

        // Then sync every interval
        this.syncInterval = setInterval(() => {
            this.syncNow();
        }, intervalMs);

        // Also sync when coming online
        window.addEventListener('online', () => {
            console.log('🌐 Network online - triggering sync');
            this.syncNow();
        });
    }

    /**
     * Stop automatic background sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏸️ Auto-sync stopped');
        }
    }

    /**
     * Sync all pending items now
     */
    async syncNow(): Promise<void> {
        // Skip if already syncing or offline
        if (this.isSyncing || !navigator.onLine) {
            return;
        }

        this.isSyncing = true;

        try {
            // Get all pending items sorted by creation date
            const pendingItems = await db.sync_queue.orderBy('created_at').toArray();

            if (pendingItems.length === 0) {
                console.log('✅ No items to sync');
                this.isSyncing = false;
                return;
            }

            console.log(`🔄 Syncing ${pendingItems.length} items...`);

            let successCount = 0;
            let failedCount = 0;

            // Process items in batches
            const batchSize = 10;
            for (let i = 0; i < pendingItems.length; i += batchSize) {
                const batch = pendingItems.slice(i, i + batchSize);

                const results = await Promise.allSettled(
                    batch.map(item => this.syncItem(item))
                );

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        successCount++;
                    } else {
                        failedCount++;
                        console.error(`❌ Sync failed for item ${batch[index].id}:`, result.reason);
                    }
                });
            }

            console.log(`✅ Sync complete: ${successCount} success, ${failedCount} failed`);

        } catch (error) {
            console.error('❌ Sync error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync a single item to Supabase
     */
    private async syncItem(item: SyncQueue): Promise<void> {
        try {
            // Check retry limit
            if (item.retry_count >= this.maxRetries) {
                console.warn(`⚠️ Max retries reached for ${item.table_name}:${item.record_id}`);
                await db.sync_queue.delete(item.id!);
                return;
            }

            // TODO: Implement actual Supabase sync based on table_name and operation
            // For now, we'll simulate success
            const success = await this.syncToSupabase(item);

            if (success) {
                // Remove from queue
                await db.sync_queue.delete(item.id!);

                // Mark record as synced
                await this.markRecordAsSynced(item.table_name, item.record_id);
            } else {
                // Increment retry count
                await db.sync_queue.update(item.id!, {
                    retry_count: item.retry_count + 1,
                    last_error: 'Sync failed',
                });
            }
        } catch (error: any) {
            // Update retry count and error
            await db.sync_queue.update(item.id!, {
                retry_count: item.retry_count + 1,
                last_error: error.message,
            });

            throw error;
        }
    }

    /**
     * Actually sync to Supabase (placeholder)
     */
    private async syncToSupabase(item: SyncQueue): Promise<boolean> {
        // TODO: Implement actual Supabase API calls
        // For now, simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate 95% success rate for testing
        return Math.random() > 0.05;
    }

    /**
     * Mark a record as synced in local DB
     */
    private async markRecordAsSynced(tableName: string, recordId: string): Promise<void> {
        try {
            const table = (db as any)[tableName];
            if (table) {
                await table.update(recordId, { _synced: true });
            }
        } catch (error) {
            console.error(`Failed to mark ${tableName}:${recordId} as synced:`, error);
        }
    }

    /**
     * Get sync status
     */
    async getSyncStatus() {
        const pendingCount = await db.sync_queue.count();
        const failedCount = await db.sync_queue.where('retry_count').above(0).count();

        return {
            isPending: pendingCount > 0,
            pendingCount,
            failedCount,
            isOnline: navigator.onLine,
            isSyncing: this.isSyncing,
        };
    }

    /**
     * Retry failed items
     */
    async retryFailed() {
        const failedItems = await db.sync_queue.where('retry_count').above(0).toArray();

        for (const item of failedItems) {
            // Reset retry count
            await db.sync_queue.update(item.id!, { retry_count: 0, last_error: undefined });
        }

        // Trigger sync
        await this.syncNow();
    }

    /**
     * Clear sync queue (dangerous - use carefully)
     */
    async clearQueue() {
        await db.sync_queue.clear();
        console.log('🗑️ Sync queue cleared');
    }
}

// Singleton instance
export const syncService = new SyncService();

// ============================================
// CONFLICT RESOLUTION
// ============================================

/**
 * Resolve conflicts using timestamp + device ID (CRDT-style)
 */
export function resolveConflict(
    localRecord: any,
    remoteRecord: any
): any {
    // If remote is newer, use remote
    if (new Date(remoteRecord.updated_at) > new Date(localRecord.updated_at)) {
        console.log('✅ Using remote (newer)');
        return remoteRecord;
    }

    // If local is newer, use local
    if (new Date(localRecord.updated_at) > new Date(remoteRecord.updated_at)) {
        console.log('✅ Using local (newer)');
        return localRecord;
    }

    // Same timestamp - use device ID as tiebreaker
    if (localRecord._device_id && remoteRecord._device_id) {
        if (localRecord._device_id > remoteRecord._device_id) {
            console.log('✅ Using local (device ID tiebreaker)');
            return localRecord;
        }
    }

    console.log('✅ Using remote (default)');
    return remoteRecord;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Check if sync is needed
 */
export async function needsSync(): Promise<boolean> {
    const count = await db.sync_queue.count();
    return count > 0;
}

/**
 * Get pending sync items count
 */
export async function getPendingSyncCount(): Promise<number> {
    return await db.sync_queue.count();
}

/**
 * Export sync queue (for debugging)
 */
export async function exportSyncQueue() {
    return await db.sync_queue.toArray();
}
