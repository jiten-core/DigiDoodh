// src/db/operations.ts - Offline CRUD Operations with Auto-Sync
import { db, generateId, getDeviceId, addToSyncQueue, logAudit } from './schema';
import type { Farmer, MilkEntry, LedgerEntry, Payment, RateChart, Bill } from './schema';

// ============================================
// FARMER OPERATIONS
// ============================================

export async function addFarmer(
    dairyId: string,
    farmerData: Omit<Farmer, 'id' | 'dairy_id' | 'is_active' | 'created_at' | 'updated_at' | '_synced' | '_device_id'>,
    userId: string
) {
    const id = generateId();
    const now = new Date();

    const farmer: Farmer = {
        ...farmerData,
        id,
        dairy_id: dairyId,
        is_active: true,
        created_at: now,
        updated_at: now,
        _synced: false,
        _device_id: getDeviceId(),
    };

    // Add to local DB
    await db.farmers.add(farmer);

    // Queue for sync
    await addToSyncQueue('farmers', id, 'create', farmer);

    // Log audit
    await logAudit(userId, 'CREATE_FARMER', 'farmers', id, undefined, farmer);

    return farmer;
}

export async function updateFarmer(
    farmerId: string,
    updates: Partial<Farmer>,
    userId: string
) {
    const existing = await db.farmers.get(farmerId);
    if (!existing) throw new Error('Farmer not found');

    const updated: Farmer = {
        ...existing,
        ...updates,
        updated_at: new Date(),
        _synced: false,
    };

    await db.farmers.update(farmerId, updated);
    await addToSyncQueue('farmers', farmerId, 'update', updated);
    await logAudit(userId, 'UPDATE_FARMER', 'farmers', farmerId, existing, updated);

    return updated;
}

export async function getFarmers(dairyId: string, activeOnly: boolean = true) {
    let query = db.farmers.where('dairy_id').equals(dairyId);

    if (activeOnly) {
        return query.and(f => f.is_active).toArray();
    }

    return query.toArray();
}

export async function searchFarmers(dairyId: string, searchTerm: string) {
    const lowercaseSearch = searchTerm.toLowerCase();

    return db.farmers
        .where('dairy_id')
        .equals(dairyId)
        .and(farmer =>
            farmer.name.toLowerCase().includes(lowercaseSearch) ||
            farmer.farmer_code.toLowerCase().includes(lowercaseSearch) ||
            (farmer.phone ? farmer.phone.includes(searchTerm) : false)
        )
        .toArray();
}

// ============================================
// MILK ENTRY OPERATIONS
// ============================================

export async function addMilkEntry(
    dairyId: string,
    entryData: Omit<MilkEntry, 'id' | 'dairy_id' | 'rate' | 'amount' | 'created_at' | 'updated_at' | '_synced' | '_device_id'>,
    rate: number,
    userId: string
) {
    const id = generateId();
    const now = new Date();

    // Auto-calculate amount
    const amount = entryData.quantity * rate;

    const milkEntry: MilkEntry = {
        ...entryData,
        id,
        dairy_id: dairyId,
        rate,
        amount,
        created_at: now,
        updated_at: now,
        _synced: false,
        _device_id: getDeviceId(),
    };

    // Add to local DB
    await db.milk_entries.add(milkEntry);

    // Add corresponding ledger entry (credit)
    await addLedgerEntry(
        dairyId,
        entryData.farmer_id,
        entryData.entry_date,
        'credit',
        'milk',
        amount,
        id,
        userId
    );

    // Queue for sync
    await addToSyncQueue('milk_entries', id, 'create', milkEntry);

    // Log audit
    await logAudit(userId, 'ADD_MILK_ENTRY', 'milk_entries', id, undefined, milkEntry);

    return milkEntry;
}

/**
 * Edit an existing milk entry (with audit trail)
 * Creates a correction ledger entry to maintain ledger integrity
 */
export async function editMilkEntry(
    entryId: string,
    updates: Partial<Pick<MilkEntry, 'quantity' | 'fat' | 'snf' | 'clr' | 'temperature' | 'cattle_type'>>,
    newRate: number,
    userId: string
) {
    const existing = await db.milk_entries.get(entryId);
    if (!existing) throw new Error('Milk entry not found');

    const oldAmount = existing.amount;
    const newQuantity = updates.quantity ?? existing.quantity;
    const newAmount = newQuantity * newRate;
    const amountDiff = newAmount - oldAmount;

    const now = new Date();
    const updatedEntry: Partial<MilkEntry> = {
        ...updates,
        rate: newRate,
        amount: newAmount,
        updated_at: now,
        _synced: false,
        _device_id: getDeviceId(),
    };

    // Update the milk entry
    await db.milk_entries.update(entryId, updatedEntry);

    // If amount changed, create a correction ledger entry linked to the original
    if (Math.abs(amountDiff) > 0.01) {
        // Find the original ledger entry for this milk entry
        const originalLedger = await findLedgerEntryByReference(existing.dairy_id, entryId, 'milk');

        await addLedgerEntry(
            existing.dairy_id,
            existing.farmer_id,
            existing.entry_date,
            amountDiff > 0 ? 'credit' : 'debit',
            'correction',
            Math.abs(amountDiff),
            entryId,
            userId,
            `Milk entry corrected: ${existing.quantity}L→${newQuantity}L, ₹${oldAmount.toFixed(2)}→₹${newAmount.toFixed(2)}`,
            originalLedger?.id // Link correction to the original ledger entry
        );
    }

    // Queue for sync
    await addToSyncQueue('milk_entries', entryId, 'update', { ...existing, ...updatedEntry });

    // Log audit with old + new
    await logAudit(userId, 'EDIT_MILK_ENTRY', 'milk_entries', entryId, existing, { ...existing, ...updatedEntry });

    return { ...existing, ...updatedEntry };
}

/**
 * Delete a milk entry (with audit trail)
 * Creates a reversal ledger entry instead of hard-deleting
 */
export async function deleteMilkEntry(
    entryId: string,
    userId: string
) {
    const existing = await db.milk_entries.get(entryId);
    if (!existing) throw new Error('Milk entry not found');

    // Find the original ledger entry for this milk entry
    const originalLedger = await findLedgerEntryByReference(existing.dairy_id, entryId, 'milk');

    // Create a reversal (debit) ledger entry linked to the original
    await addLedgerEntry(
        existing.dairy_id,
        existing.farmer_id,
        existing.entry_date,
        'debit',
        'correction',
        existing.amount,
        entryId,
        userId,
        `Milk entry deleted: ${existing.quantity}L @ ₹${existing.rate}/L`,
        originalLedger?.id // Link correction to the original ledger entry
    );

    // Remove the milk entry
    await db.milk_entries.delete(entryId);

    // Queue for sync
    await addToSyncQueue('milk_entries', entryId, 'delete', existing);

    // Log audit
    await logAudit(userId, 'DELETE_MILK_ENTRY', 'milk_entries', entryId, existing, undefined);

    return existing;
}
export async function getMilkEntries(
    dairyId: string,
    filters?: {
        farmerId?: string;
        startDate?: Date;
        endDate?: Date;
        shift?: 'morning' | 'evening';
    }
) {
    let query = db.milk_entries.where('dairy_id').equals(dairyId);

    if (filters?.farmerId) {
        query = db.milk_entries.where(['dairy_id', 'farmer_id']).equals([dairyId, filters.farmerId]);
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
}

// ============================================
// LEDGER OPERATIONS (Append-Only)
// ============================================

export async function addLedgerEntry(
    dairyId: string,
    farmerId: string,
    entryDate: Date,
    type: 'credit' | 'debit',
    category: LedgerEntry['category'],
    amount: number,
    referenceId: string | undefined,
    userId: string,
    notes?: string,
    correctionOfId?: string
) {
    const id = generateId();

    const ledgerEntry: LedgerEntry = {
        id,
        dairy_id: dairyId,
        farmer_id: farmerId,
        entry_date: entryDate,
        type,
        category,
        amount,
        reference_id: referenceId,
        correction_of_id: correctionOfId,
        notes,
        created_by: userId,
        created_at: new Date(),
        _synced: false,
        _device_id: getDeviceId(),
    };

    // Add to local DB (append-only — never update or delete ledger entries)
    await db.ledger_entries.add(ledgerEntry);

    // Queue for sync
    await addToSyncQueue('ledger_entries', id, 'create', ledgerEntry);

    // Log audit
    await logAudit(userId, `ADD_LEDGER_${type.toUpperCase()}`, 'ledger_entries', id, undefined, ledgerEntry);

    return ledgerEntry;
}

/**
 * Find the original ledger entry for a given reference ID (e.g. milk entry ID)
 * Used to link corrections to the original entry
 */
export async function findLedgerEntryByReference(
    dairyId: string,
    referenceId: string,
    category?: LedgerEntry['category']
): Promise<LedgerEntry | undefined> {
    const entries = await db.ledger_entries
        .where('dairy_id')
        .equals(dairyId)
        .toArray();

    return entries.find(e => {
        if (e.reference_id !== referenceId) return false;
        if (category && e.category !== category) return false;
        // Prefer the original (non-correction) entry
        if (e.category === 'correction') return false;
        return true;
    });
}

/**
 * Calculate balance (runtime, never stored)
 */
export async function calculateBalance(dairyId: string, farmerId: string): Promise<number> {
    const entries = await db.ledger_entries
        .where(['dairy_id', 'farmer_id'])
        .equals([dairyId, farmerId])
        .toArray();

    const credits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
    const debits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

    return credits - debits;
}

/**
 * Get ledger history
 */
export async function getLedgerEntries(
    dairyId: string,
    farmerId?: string,
    startDate?: Date,
    endDate?: Date
) {
    let query = farmerId
        ? db.ledger_entries.where(['dairy_id', 'farmer_id']).equals([dairyId, farmerId])
        : db.ledger_entries.where('dairy_id').equals(dairyId);

    let results = await query.toArray();

    // Filter by date
    if (startDate || endDate) {
        results = results.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            if (startDate && entryDate < startDate) return false;
            if (endDate && entryDate > endDate) return false;
            return true;
        });
    }

    // Sort by date DESC
    results.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

    return results;
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export async function addPayment(
    dairyId: string,
    farmerId: string,
    paymentData: Omit<Payment, 'id' | 'dairy_id' | 'farmer_id' | 'created_at' | '_synced' | '_device_id'>,
    userId: string
) {
    const id = generateId();

    const payment: Payment = {
        ...paymentData,
        id,
        dairy_id: dairyId,
        farmer_id: farmerId,
        created_at: new Date(),
        _synced: false,
        _device_id: getDeviceId(),
    };

    // Add to local DB
    await db.payments.add(payment);

    // Add ledger entry (debit)
    await addLedgerEntry(
        dairyId,
        farmerId,
        paymentData.payment_date,
        'debit',
        'payment',
        paymentData.amount,
        id,
        userId,
        paymentData.notes
    );

    // Queue for sync
    await addToSyncQueue('payments', id, 'create', payment);

    // Log audit
    await logAudit(userId, 'ADD_PAYMENT', 'payments', id, undefined, payment);

    return payment;
}

export async function recordPayment(
    billId: string,
    amount: number,
    paymentMode: Payment['payment_mode'],
    paymentDate: Date,
    userId: string,
    referenceNumber?: string,
    notes?: string
) {
    const bill = await db.bills.get(billId);
    if (!bill) throw new Error('Bill not found');

    const payment = await addPayment(
        bill.dairy_id,
        bill.farmer_id,
        {
            payment_date: paymentDate,
            amount,
            payment_mode: paymentMode,
            reference_number: referenceNumber,
            notes,
            created_by: userId
        },
        userId
    );

    // Update bill paid amount
    const newPaidAmount = bill.paid_amount + amount;
    const newStatus = newPaidAmount >= bill.net_payable ? 'paid' : 'pending';

    await db.bills.update(billId, {
        paid_amount: newPaidAmount,
        status: newStatus
    });

    return payment;
}

// ============================================
// RATE CHART OPERATIONS
// ============================================

export async function addRateChart(
    dairyId: string,
    rateChartData: Omit<RateChart, 'id' | 'dairy_id' | 'created_at' | 'updated_at' | '_synced' | '_device_id'>,
    userId: string
) {
    const id = generateId();
    const now = new Date();

    const rateChart: RateChart = {
        ...rateChartData,
        id,
        dairy_id: dairyId,
        created_at: now,
        updated_at: now,
        _synced: false,
        _device_id: getDeviceId(),
    };

    await db.rate_charts.add(rateChart);
    await addToSyncQueue('rate_charts', id, 'create', rateChart);
    await logAudit(userId, 'ADD_RATE_CHART', 'rate_charts', id, undefined, rateChart);

    return rateChart;
}

export async function updateRateChart(
    id: string,
    updates: Partial<RateChart>,
    userId: string
) {
    const existing = await db.rate_charts.get(id);
    if (!existing) throw new Error('Rate chart not found');

    const updated = {
        ...existing,
        ...updates,
        updated_at: new Date(),
        _synced: false
    };

    await db.rate_charts.update(id, updated);
    await addToSyncQueue('rate_charts', id, 'update', updated);
    await logAudit(userId, 'UPDATE_RATE_CHART', 'rate_charts', id, existing, updated);

    return updated;
}

/**
 * Calculate rate based on FAT/SNF
 * Supports two pricing models:
 * 1. LINEAR: base_rate + (fat × fat_rate) + (snf × snf_rate)
 * 2. SLAB-BASED: lookup rate from fat_slabs/snf_slabs arrays
 * Linear mode is used when fat_rate/snf_rate are set and slabs are empty.
 */
export async function calculateRate(
    dairyId: string,
    cattleType: 'cow' | 'buffalo' | 'goat',
    fat?: number,
    snf?: number
): Promise<number> {
    // Get active rate chart for cattle type
    const allCharts = await db.rate_charts
        .where('dairy_id')
        .equals(dairyId)
        .toArray();

    const rateChart = allCharts.find(
        rc => rc.cattle_type === cattleType && rc.is_active
    );

    if (!rateChart) {
        console.warn(`No active rate chart for ${cattleType}`);
        return 0;
    }

    const baseRate = rateChart.base_rate || 0;

    // Fixed rate — just return base
    if (rateChart.pricing_type === 'fixed') {
        return baseRate;
    }

    // Check if we should use LINEAR mode
    // Linear mode: fat_rate/snf_rate are set AND slabs are empty or absent
    const hasLinearFat = typeof rateChart.fat_rate === 'number' && rateChart.fat_rate > 0;
    const hasLinearSnf = typeof rateChart.snf_rate === 'number' && rateChart.snf_rate! > 0;
    const hasSlabs = (rateChart.fat_slabs && rateChart.fat_slabs.length > 0) ||
        (rateChart.snf_slabs && rateChart.snf_slabs.length > 0);

    // --- LINEAR PRICING MODE ---
    if ((hasLinearFat || hasLinearSnf) && !hasSlabs) {
        let rate = baseRate;

        if (rateChart.pricing_type === 'fat_based' && fat && hasLinearFat) {
            rate += fat * rateChart.fat_rate;
        } else if (rateChart.pricing_type === 'snf_based' && snf && hasLinearSnf) {
            rate += snf * rateChart.snf_rate!;
        } else if (rateChart.pricing_type === 'combined') {
            if (fat && hasLinearFat) rate += fat * rateChart.fat_rate;
            if (snf && hasLinearSnf) rate += snf * rateChart.snf_rate!;
        }

        return Math.round(rate * 100) / 100; // Round to 2 decimal places
    }

    // --- SLAB-BASED PRICING MODE ---

    // FAT-based slabs
    if (rateChart.pricing_type === 'fat_based' && fat && rateChart.fat_slabs && rateChart.fat_slabs.length > 0) {
        const slab = rateChart.fat_slabs.find(s => fat >= s.fat_min && fat <= s.fat_max);
        return slab?.rate || baseRate;
    }

    // SNF-based slabs
    if (rateChart.pricing_type === 'snf_based' && snf && rateChart.snf_slabs && rateChart.snf_slabs.length > 0) {
        const slab = rateChart.snf_slabs.find(s => snf >= s.snf_min && snf <= s.snf_max);
        return slab?.rate || baseRate;
    }

    // Combined (average of FAT slab + SNF slab rates)
    if (rateChart.pricing_type === 'combined' && fat && snf) {
        let fatRate = baseRate;
        let snfRate = baseRate;

        if (rateChart.fat_slabs && rateChart.fat_slabs.length > 0) {
            const fatSlab = rateChart.fat_slabs.find(s => fat >= s.fat_min && fat <= s.fat_max);
            if (fatSlab) fatRate = fatSlab.rate;
        }

        if (rateChart.snf_slabs && rateChart.snf_slabs.length > 0) {
            const snfSlab = rateChart.snf_slabs.find(s => snf >= s.snf_min && snf <= s.snf_max);
            if (snfSlab) snfRate = snfSlab.rate;
        }

        return (fatRate + snfRate) / 2;
    }

    return baseRate;
}

// ============================================
// STATS & SUMMARIES
// ============================================

export async function getDailyStats(dairyId: string, date: Date) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const entries = await getMilkEntries(dairyId, {
        startDate: startOfDay,
        endDate: endOfDay,
    });

    const morningEntries = entries.filter(e => e.shift === 'morning');
    const eveningEntries = entries.filter(e => e.shift === 'evening');

    return {
        totalEntries: entries.length,
        totalLiters: entries.reduce((sum, e) => sum + e.quantity, 0),
        totalAmount: entries.reduce((sum, e) => sum + e.amount, 0),
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
}

// ============================================
// BILLING OPERATIONS
// ============================================

export async function generateBill(
    dairyId: string,
    farmerId: string,
    periodStart: Date,
    periodEnd: Date,
    totalAmount: number,
    userId: string,
    deductions: number = 0
) {
    const id = generateId();
    const billNumber = `BILL-${Date.now()}`;

    // Get milk entries for total milk calculation
    const milkEntries = await getMilkEntries(dairyId, {
        farmerId,
        startDate: periodStart,
        endDate: periodEnd
    });

    const totalMilk = milkEntries.reduce((sum, e) => sum + e.quantity, 0);

    const bill: Bill = {
        id,
        dairy_id: dairyId,
        farmer_id: farmerId,
        bill_number: billNumber,
        period_start: periodStart,
        period_end: periodEnd,
        total_milk: totalMilk,
        total_amount: totalAmount + deductions, // Gross amount before deductions
        paid_amount: 0,
        deductions,
        net_payable: totalAmount, // Net = gross - deductions
        status: 'pending',
        generated_by: userId,
        created_at: new Date(),
        _synced: false,
        _device_id: getDeviceId(),
    };

    await db.bills.add(bill);
    await addToSyncQueue('bills', id, 'create', bill);
    await logAudit(userId, 'GENERATE_BILL', 'bills', id, undefined, bill);

    return bill;
}

export async function cancelBill(
    billId: string,
    userId: string
) {
    const bill = await db.bills.get(billId);
    if (!bill) throw new Error('Bill not found');
    if (bill.status === 'paid') throw new Error('Cannot cancel a paid bill');

    const oldData = { ...bill };

    await db.bills.update(billId, { status: 'cancelled' });
    await addToSyncQueue('bills', billId, 'update', { status: 'cancelled' });
    await logAudit(userId, 'CANCEL_BILL', 'bills', billId, oldData, { ...bill, status: 'cancelled' });

    return { ...bill, status: 'cancelled' as const };
}

export async function getBills(dairyId: string) {
    return db.bills.where('dairy_id').equals(dairyId).reverse().sortBy('created_at');
}
