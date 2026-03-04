import Dexie, { Table } from 'dexie';

// ============================================
// TYPE DEFINITIONS (Match Supabase schema)
// ============================================

export interface Dairy {
    id: string;
    name: string;
    owner_id: string;
    address?: string;
    phone?: string;
    gstin?: string;
    subscription_plan: 'basic' | 'premium' | 'premium_plus';
    subscription_expires_at?: Date;
    created_at: Date;
    updated_at: Date;
    _synced: boolean; // Offline-only field
    _device_id?: string; // Offline-only field
}

export interface Farmer {
    id: string;
    dairy_id: string;
    farmer_code: string;
    name: string;
    phone?: string;
    address?: string;
    village?: string;
    bank_account?: string;
    ifsc_code?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface MilkEntry {
    id: string;
    dairy_id: string;
    farmer_id: string;
    entry_date: Date;
    shift: 'morning' | 'evening';
    cattle_type: 'cow' | 'buffalo' | 'goat';
    quantity: number; // liters
    fat?: number; // percentage
    snf?: number; // percentage
    clr?: number; // percentage
    temperature?: number; // celsius
    rate: number; // per liter
    amount: number; // total amount
    rate_chart_id?: string;
    entered_by: string;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface LedgerEntry {
    id: string;
    dairy_id: string;
    farmer_id: string;
    entry_date: Date;
    type: 'credit' | 'debit';
    category: 'milk' | 'payment' | 'advance' | 'loan' | 'product' | 'correction';
    amount: number;
    reference_id?: string; // Links to milk_entry, payment, etc.
    correction_of_id?: string; // If correcting another entry
    notes?: string;
    created_by: string;
    created_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface RateChart {
    id: string;
    dairy_id: string;
    name: string;
    cattle_type: 'cow' | 'buffalo' | 'goat';
    pricing_type: 'fixed' | 'fat_based' | 'snf_based' | 'combined';
    base_rate: number;
    fat_rate: number;
    snf_rate?: number;
    fat_slabs?: FatSlab[];
    snf_slabs?: SnfSlab[];
    is_active: boolean;
    effective_from: Date;
    created_at: Date;
    updated_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface FatSlab {
    fat_min: number;
    fat_max: number;
    rate: number;
}

export interface SnfSlab {
    snf_min: number;
    snf_max: number;
    rate: number;
}

export interface Payment {
    id: string;
    dairy_id: string;
    farmer_id: string;
    payment_date: Date;
    amount: number;
    payment_mode: 'cash' | 'bank' | 'upi' | 'cheque';
    reference_number?: string;
    notes?: string;
    created_by: string;
    created_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface Bill {
    id: string;
    dairy_id: string;
    farmer_id: string;
    bill_number: string;
    period_start: Date;
    period_end: Date;
    total_milk: number;
    total_amount: number;
    paid_amount: number;
    deductions: number;
    net_payable: number;
    status: 'pending' | 'paid' | 'cancelled';
    generated_by: string;
    created_at: Date;
    _synced: boolean;
    _device_id?: string;
}

export interface SyncQueue {
    id?: number;
    table_name: string;
    record_id: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    retry_count: number;
    last_error?: string;
    created_at: Date;
}

export interface AuditLog {
    id?: number;
    user_id: string;
    action: string;
    table_name: string;
    record_id: string;
    old_data?: any;
    new_data?: any;
    device_id?: string;
    ip_address?: string;
    created_at: Date;
    _synced: boolean;
}

// ============================================
// DEXIE DATABASE CLASS
// ============================================

export class DigiDhoodhDB extends Dexie {
    // Tables
    dairies!: Table<Dairy, string>;
    farmers!: Table<Farmer, string>;
    milk_entries!: Table<MilkEntry, string>;
    ledger_entries!: Table<LedgerEntry, string>;
    rate_charts!: Table<RateChart, string>;
    payments!: Table<Payment, string>;
    bills!: Table<Bill, string>;
    sync_queue!: Table<SyncQueue, number>;
    audit_logs!: Table<AuditLog, number>;

    constructor() {
        super('DigiDhoodhDB');

        // Define schema version 1
        this.version(1).stores({
            dairies: 'id, owner_id, subscription_plan, _synced',
            farmers: 'id, dairy_id, farmer_code, name, is_active, _synced',
            milk_entries: 'id, dairy_id, farmer_id, entry_date, shift, _synced, [dairy_id+entry_date]',
            ledger_entries: 'id, dairy_id, farmer_id, entry_date, type, category, _synced',
            rate_charts: 'id, dairy_id, cattle_type, is_active, effective_from, _synced',
            payments: 'id, dairy_id, farmer_id, payment_date, _synced',
            bills: 'id, dairy_id, farmer_id, period_start, period_end, _synced',
            sync_queue: '++id, table_name, created_at',
            audit_logs: '++id, user_id, table_name, created_at, _synced',
        });
    }
}

// Singleton instance
export const db = new DigiDhoodhDB();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate UUID (offline-compatible)
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Get device ID (persistent across sessions)
 */
export function getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateId();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

/**
 * Mark record as needing sync
 */
export async function addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
) {
    await db.sync_queue.add({
        table_name: tableName,
        record_id: recordId,
        operation,
        data,
        retry_count: 0,
        created_at: new Date(),
    });
}

/**
 * Log audit trail (offline-compatible)
 */
export async function logAudit(
    userId: string,
    action: string,
    tableName: string,
    recordId: string,
    oldData?: any,
    newData?: any
) {
    await db.audit_logs.add({
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
        device_id: getDeviceId(),
        created_at: new Date(),
        _synced: false,
    });
}

/**
 * Check if online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Initialize database (call on app start)
 */
export async function initializeDB() {
    try {
        // Open the database
        await db.open();
        console.log('✅ DigiDhoodh offline database initialized');

        // Check for pending syncs
        const pendingCount = await db.sync_queue.count();
        if (pendingCount > 0) {
            console.log(`⚠️ ${pendingCount} items pending sync`);
        }

        return db;
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Clear all data (use carefully!)
 */
export async function clearAllData() {
    await db.transaction('rw', db.tables, async () => {
        await Promise.all(db.tables.map(table => table.clear()));
    });
    console.log('🗑️ All offline data cleared');
}

/**
 * Export database (for debugging)
 */
export async function exportData() {
    const data: any = {};
    for (const table of db.tables) {
        data[table.name] = await table.toArray();
    }
    return data;
}
