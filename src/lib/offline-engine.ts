// Enhanced Offline Engine with Complete Sync Support
// Provides full offline functionality for dairy operations

import { supabase, SYNC_STATUS } from './supabase'

// IndexedDB Configuration
const DB_NAME = 'digidhoodh_offline_v2'
const DB_VERSION = 2

// Store names
const STORES = {
    MILK_COLLECTIONS: 'milk_collections',
    FARMERS: 'farmers',
    BUYERS: 'buyers',
    RATE_CHARTS: 'rate_charts',
    PRODUCTS: 'products',
    SYNC_QUEUE: 'sync_queue',
    CACHE: 'cache',
    SETTINGS: 'settings',
} as const

interface SyncQueueItem {
    id: string
    store: string
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: number
    retryCount: number
    status: 'PENDING' | 'SYNCING' | 'FAILED'
    error?: string
}

interface CacheItem {
    key: string
    data: any
    timestamp: number
    expiry: number
}

class OfflineEngine {
    private db: IDBDatabase | null = null
    private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
    private syncInProgress: boolean = false
    private listeners: Set<(status: any) => void> = new Set()
    private syncInterval: NodeJS.Timeout | null = null

    constructor() {
        if (typeof window !== 'undefined') {
            this.init()
        }
    }

    // Initialize the offline engine
    async init(): Promise<void> {
        try {
            await this.openDatabase()
            this.setupEventListeners()
            this.startSyncInterval()
            console.log('✅ Offline Engine initialized')
        } catch (error) {
            console.error('❌ Failed to initialize Offline Engine:', error)
        }
    }

    // Open IndexedDB database
    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => reject(request.error)

            request.onsuccess = () => {
                this.db = request.result
                resolve(this.db)
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create stores with indexes
                if (!db.objectStoreNames.contains(STORES.MILK_COLLECTIONS)) {
                    const milkStore = db.createObjectStore(STORES.MILK_COLLECTIONS, { keyPath: 'id' })
                    milkStore.createIndex('farmerId', 'farmerId', { unique: false })
                    milkStore.createIndex('collectionDate', 'collectionDate', { unique: false })
                    milkStore.createIndex('syncStatus', 'syncStatus', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.FARMERS)) {
                    const farmerStore = db.createObjectStore(STORES.FARMERS, { keyPath: 'id' })
                    farmerStore.createIndex('farmerCode', 'farmerCode', { unique: true })
                    farmerStore.createIndex('name', 'name', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.BUYERS)) {
                    const buyerStore = db.createObjectStore(STORES.BUYERS, { keyPath: 'id' })
                    buyerStore.createIndex('buyerCode', 'buyerCode', { unique: true })
                }

                if (!db.objectStoreNames.contains(STORES.RATE_CHARTS)) {
                    const rateStore = db.createObjectStore(STORES.RATE_CHARTS, { keyPath: 'id' })
                    rateStore.createIndex('cattleType', 'cattleType', { unique: false })
                    rateStore.createIndex('isActive', 'isActive', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
                    const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
                    productStore.createIndex('category', 'category', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' })
                    queueStore.createIndex('store', 'store', { unique: false })
                    queueStore.createIndex('status', 'status', { unique: false })
                    queueStore.createIndex('timestamp', 'timestamp', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.CACHE)) {
                    const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' })
                    cacheStore.createIndex('expiry', 'expiry', { unique: false })
                }

                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
                }
            }
        })
    }

    // Setup event listeners
    private setupEventListeners(): void {
        window.addEventListener('online', this.handleOnline.bind(this))
        window.addEventListener('offline', this.handleOffline.bind(this))
    }

    private handleOnline(): void {
        console.log('🌐 Back online')
        this.isOnline = true
        this.notifyListeners()
        this.syncPendingData()
    }

    private handleOffline(): void {
        console.log('📴 Gone offline')
        this.isOnline = false
        this.notifyListeners()
    }

    // Start periodic sync
    private startSyncInterval(): void {
        // Sync every 30 seconds when online
        this.syncInterval = setInterval(() => {
            if (this.isOnline && !this.syncInProgress) {
                this.syncPendingData()
            }
        }, 30000)
    }

    // Add item to sync queue
    async addToQueue(store: string, action: SyncQueueItem['action'], data: any): Promise<string> {
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const queueItem: SyncQueueItem = {
            id,
            store,
            action,
            data,
            timestamp: Date.now(),
            retryCount: 0,
            status: 'PENDING',
        }

        await this.put(STORES.SYNC_QUEUE, queueItem)

        // Try to sync immediately if online
        if (this.isOnline) {
            this.syncPendingData()
        }

        return id
    }

    // Sync pending data to server
    async syncPendingData(): Promise<{ synced: number; failed: number }> {
        if (this.syncInProgress || !this.isOnline) {
            return { synced: 0, failed: 0 }
        }

        this.syncInProgress = true
        this.notifyListeners()

        let synced = 0
        let failed = 0

        try {
            const pendingItems = await this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE)
            const toSync = pendingItems.filter(item =>
                item.status === 'PENDING' ||
                (item.status === 'FAILED' && item.retryCount < 3)
            )

            for (const item of toSync) {
                try {
                    // Update status to syncing
                    await this.put(STORES.SYNC_QUEUE, { ...item, status: 'SYNCING' })

                    // Perform sync based on store and action
                    await this.performSync(item)

                    // Remove from queue on success
                    await this.delete(STORES.SYNC_QUEUE, item.id)
                    synced++
                } catch (error: any) {
                    console.error(`Sync failed for ${item.id}:`, error)

                    // Update with failure
                    await this.put(STORES.SYNC_QUEUE, {
                        ...item,
                        status: 'FAILED',
                        retryCount: item.retryCount + 1,
                        error: error.message,
                    })
                    failed++
                }
            }

            console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`)
        } catch (error) {
            console.error('❌ Sync error:', error)
        } finally {
            this.syncInProgress = false
            this.notifyListeners()
        }

        return { synced, failed }
    }

    // Perform actual sync to Supabase
    private async performSync(item: SyncQueueItem): Promise<void> {
        const { store, action, data } = item

        switch (action) {
            case 'CREATE':
                const { error: createError } = await supabase
                    .from(store)
                    .insert(this.cleanDataForSync(data))
                if (createError) throw createError
                break

            case 'UPDATE':
                const { error: updateError } = await supabase
                    .from(store)
                    .update(this.cleanDataForSync(data))
                    .eq('id', data.id)
                if (updateError) throw updateError
                break

            case 'DELETE':
                const { error: deleteError } = await supabase
                    .from(store)
                    .delete()
                    .eq('id', data.id)
                if (deleteError) throw deleteError
                break
        }
    }

    // Clean data for sync (remove local-only fields)
    private cleanDataForSync(data: any): any {
        const { syncStatus, localId, ...cleanData } = data
        return cleanData
    }

    // Save milk collection (works offline)
    async saveMilkCollection(collection: any): Promise<string> {
        const id = collection.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const entry = {
            ...collection,
            id,
            syncStatus: this.isOnline ? SYNC_STATUS.SYNCED : SYNC_STATUS.PENDING,
            createdAt: new Date().toISOString(),
        }

        // Save locally first
        await this.put(STORES.MILK_COLLECTIONS, entry)

        // Add to sync queue if offline
        if (!this.isOnline) {
            await this.addToQueue('milk_collections', 'CREATE', entry)
        } else {
            // Try to sync immediately
            try {
                const { error } = await supabase
                    .from('milk_collections')
                    .insert(this.cleanDataForSync(entry))

                if (error) throw error

                // Update sync status
                await this.put(STORES.MILK_COLLECTIONS, {
                    ...entry,
                    syncStatus: SYNC_STATUS.SYNCED,
                })
            } catch (error) {
                console.error('Immediate sync failed, queued for later:', error)
                await this.addToQueue('milk_collections', 'CREATE', entry)
            }
        }

        return id
    }

    // Get milk collections (from local store)
    async getMilkCollections(filters?: {
        farmerId?: string
        date?: string
        shift?: string
    }): Promise<any[]> {
        let collections = await this.getAll(STORES.MILK_COLLECTIONS)

        if (filters) {
            if (filters.farmerId) {
                collections = collections.filter(c => c.farmerId === filters.farmerId)
            }
            if (filters.date) {
                collections = collections.filter(c => c.collectionDate?.startsWith(filters.date))
            }
            if (filters.shift) {
                collections = collections.filter(c => c.shift === filters.shift)
            }
        }

        return collections.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    // Cache farmers locally
    async cacheFarmers(farmers: any[]): Promise<void> {
        for (const farmer of farmers) {
            await this.put(STORES.FARMERS, farmer)
        }
    }

    // Get cached farmers
    async getFarmers(): Promise<any[]> {
        return this.getAll(STORES.FARMERS)
    }

    // Get farmer by ID
    async getFarmerById(id: string): Promise<any | null> {
        return this.get(STORES.FARMERS, id)
    }

    // Get farmer by code
    async getFarmerByCode(code: string): Promise<any | null> {
        const farmers = await this.getAll(STORES.FARMERS)
        return farmers.find(f => f.farmerCode === code) || null
    }

    // Cache rate charts
    async cacheRateCharts(charts: any[]): Promise<void> {
        for (const chart of charts) {
            await this.put(STORES.RATE_CHARTS, chart)
        }
    }

    // Get active rate chart
    async getActiveRateChart(cattleType: string = 'COW'): Promise<any | null> {
        const charts = await this.getAll(STORES.RATE_CHARTS)
        return charts.find(c => c.cattleType === cattleType && c.isActive) || null
    }

    // Calculate rate offline
    async calculateRate(fat: number, snf?: number, cattleType: string = 'COW'): Promise<number> {
        const chart = await this.getActiveRateChart(cattleType)

        if (chart && chart.entries) {
            const entry = chart.entries.find((e: any) => {
                const fatMatch = fat >= e.fatMin && fat <= e.fatMax
                const snfMatch = !e.snfMin || (snf && snf >= e.snfMin && snf <= e.snfMax)
                return fatMatch && snfMatch
            })

            if (entry) {
                return entry.ratePerLiter
            }
        }

        // Default rate calculation
        return this.getDefaultRate(fat, snf)
    }

    private getDefaultRate(fat: number, snf?: number): number {
        if (fat >= 4.5 && snf && snf >= 8.5) return 48
        if (fat >= 4.0 && snf && snf >= 8.5) return 45
        if (fat >= 4.0 && snf && snf >= 8.0) return 42
        if (fat >= 3.5 && snf && snf >= 8.0) return 38
        if (fat >= 3.0) return 35
        return 30
    }

    // Generic IndexedDB operations
    private async get<T = any>(storeName: string, key: string): Promise<T | null> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve(null)
                return
            }

            const transaction = this.db.transaction(storeName, 'readonly')
            const store = transaction.objectStore(storeName)
            const request = store.get(key)

            request.onsuccess = () => resolve(request.result || null)
            request.onerror = () => reject(request.error)
        })
    }

    private async getAll<T = any>(storeName: string): Promise<T[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([])
                return
            }

            const transaction = this.db.transaction(storeName, 'readonly')
            const store = transaction.objectStore(storeName)
            const request = store.getAll()

            request.onsuccess = () => resolve(request.result || [])
            request.onerror = () => reject(request.error)
        })
    }

    private async put(storeName: string, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction(storeName, 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.put(data)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    private async delete(storeName: string, key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction(storeName, 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.delete(key)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    // Clear all local data
    async clearAllData(): Promise<void> {
        const storeNames = Object.values(STORES)
        for (const storeName of storeNames) {
            await new Promise<void>((resolve, reject) => {
                if (!this.db) {
                    resolve()
                    return
                }

                const transaction = this.db.transaction(storeName, 'readwrite')
                const store = transaction.objectStore(storeName)
                const request = store.clear()

                request.onsuccess = () => resolve()
                request.onerror = () => reject(request.error)
            })
        }
    }

    // Get sync status
    getSyncStatus(): {
        isOnline: boolean
        queueLength: number
        pendingItems: number
        failedItems: number
        syncInProgress: boolean
        cacheSize: number
    } {
        return {
            isOnline: this.isOnline,
            queueLength: 0, // Will be updated async
            pendingItems: 0,
            failedItems: 0,
            syncInProgress: this.syncInProgress,
            cacheSize: 0,
        }
    }

    // Get detailed sync status (async)
    async getDetailedSyncStatus(): Promise<{
        isOnline: boolean
        queueLength: number
        pendingItems: number
        failedItems: number
        syncInProgress: boolean
        stores: Record<string, number>
    }> {
        const queue = await this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE)
        const pendingItems = queue.filter(i => i.status === 'PENDING').length
        const failedItems = queue.filter(i => i.status === 'FAILED').length

        const stores: Record<string, number> = {}
        for (const storeName of Object.values(STORES)) {
            const items = await this.getAll(storeName)
            stores[storeName] = items.length
        }

        return {
            isOnline: this.isOnline,
            queueLength: queue.length,
            pendingItems,
            failedItems,
            syncInProgress: this.syncInProgress,
            stores,
        }
    }

    // Subscribe to status changes
    subscribe(listener: (status: any) => void): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private notifyListeners(): void {
        const status = this.getSyncStatus()
        this.listeners.forEach(listener => listener(status))
    }

    // Cleanup
    destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
        }
        window.removeEventListener('online', this.handleOnline.bind(this))
        window.removeEventListener('offline', this.handleOffline.bind(this))
    }
}

// Singleton instance
export const offlineEngine = typeof window !== 'undefined' ? new OfflineEngine() : null

export default OfflineEngine
