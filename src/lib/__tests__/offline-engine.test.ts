// Offline Engine Tests - Enhanced
import OfflineEngine from '@/lib/offline-engine'

// More comprehensive mocks
const mockTransaction = {
    objectStore: jest.fn(() => ({
        add: jest.fn(),
        put: jest.fn(),
        get: jest.fn(() => ({
            onsuccess: null,
            onerror: null,
            result: { id: '1', name: 'Test' }
        })),
        getAll: jest.fn(() => ({
            onsuccess: null,
            onerror: null,
            result: []
        })),
        delete: jest.fn(),
        clear: jest.fn(),
    })),
    oncomplete: null,
    onerror: null,
}

const mockIDBDatabase = {
    transaction: jest.fn(() => mockTransaction),
    objectStoreNames: {
        contains: jest.fn(() => false),
    },
    createObjectStore: jest.fn(() => ({
        createIndex: jest.fn(),
    })),
    close: jest.fn(),
}

const mockIDBRequest = {
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: mockIDBDatabase,
}

// Setup global mocks
Object.defineProperty(global, 'indexedDB', {
    value: {
        open: jest.fn(() => mockIDBRequest),
        deleteDatabase: jest.fn(),
    },
    writable: true,
})

Object.defineProperty(global, 'navigator', {
    value: {
        onLine: true,
    },
    writable: true,
})

describe('OfflineEngine', () => {
    let engine: OfflineEngine

    beforeEach(() => {
        jest.clearAllMocks()

        // Simulate database open success
        setTimeout(() => {
            if (mockIDBRequest.onsuccess) {
                (mockIDBRequest as any).onsuccess({ target: { result: mockIDBDatabase } })
            }
        }, 0)
    })

    afterEach(() => {
        engine?.destroy()
    })

    describe('initialization', () => {
        it('should initialize without errors', () => {
            expect(() => {
                engine = new OfflineEngine()
            }).not.toThrow()
        })

        it('should open IndexedDB on init', () => {
            engine = new OfflineEngine()
            expect(indexedDB.open).toHaveBeenCalled()
        })
    })

    describe('getSyncStatus', () => {
        it('should return sync status object with correct shape', () => {
            engine = new OfflineEngine()
            const status = engine.getSyncStatus()

            expect(status).toEqual(
                expect.objectContaining({
                    isOnline: expect.any(Boolean),
                    queueLength: expect.any(Number),
                    pendingItems: expect.any(Number),
                    failedItems: expect.any(Number),
                    syncInProgress: expect.any(Boolean),
                    cacheSize: expect.any(Number),
                })
            )
        })
    })

    describe('calculateRate', () => {
        it('should calculate rate based on FAT', async () => {
            engine = new OfflineEngine()

            // Wait for init
            await new Promise(resolve => setTimeout(resolve, 100))

            // Test default rate calculation (when no rate chart is cached)
            const rate = await engine.calculateRate(4.0, 8.5)
            expect(typeof rate).toBe('number')
            expect(rate).toBeGreaterThan(0)
        })
    })

    describe('online/offline detection', () => {
        it('should detect online status', () => {
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
            engine = new OfflineEngine()
            const status = engine.getSyncStatus()
            expect(status.isOnline).toBe(true)
        })

        it('should detect offline status', () => {
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
            engine = new OfflineEngine()
            const status = engine.getSyncStatus()
            expect(status.isOnline).toBe(false)
        })
    })

    describe('saveMilkCollection', () => {
        it('should save milk collection and return ID', async () => {
            engine = new OfflineEngine()

            // Wait for init
            await new Promise(resolve => setTimeout(resolve, 100))

            const collection = {
                farmerId: '123',
                liters: 20,
                fat: 4.0,
                snf: 8.5,
                shift: 'MORNING',
            }

            const id = await engine.saveMilkCollection(collection)
            expect(typeof id).toBe('string')
            expect(id.length).toBeGreaterThan(0)
        })
    })

    describe('subscription', () => {
        it('should allow subscribing to status changes', () => {
            engine = new OfflineEngine()

            const listener = jest.fn()
            const unsubscribe = engine.subscribe(listener)

            expect(typeof unsubscribe).toBe('function')
        })

        it('should allow unsubscribing', () => {
            engine = new OfflineEngine()

            const listener = jest.fn()
            const unsubscribe = engine.subscribe(listener)

            expect(() => unsubscribe()).not.toThrow()
        })
    })
})

describe('SYNC_STATUS constants', () => {
    it('should have correct values', async () => {
        const { SYNC_STATUS } = await import('@/lib/supabase')

        expect(SYNC_STATUS.PENDING).toBe('PENDING')
        expect(SYNC_STATUS.SYNCED).toBe('SYNCED')
        expect(SYNC_STATUS.FAILED).toBe('FAILED')
    })
})

describe('Default Rate Calculation', () => {
    it('should return correct rates for different FAT/SNF combinations', async () => {
        const engine = new OfflineEngine()
        await new Promise(resolve => setTimeout(resolve, 100))

        // High quality
        const rate1 = await engine.calculateRate(4.5, 8.5)
        expect(rate1).toBe(48)

        // Medium quality
        const rate2 = await engine.calculateRate(4.0, 8.0)
        expect(rate2).toBe(42)

        // Lower quality
        const rate3 = await engine.calculateRate(3.0, 7.5)
        expect(rate3).toBe(35)

        engine.destroy()
    })
})
