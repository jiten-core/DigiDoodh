export type SessionTime = 'morning' | 'evening';

export interface Farmer {
    id: string;
    dairy_id: string;
    name: string;
    phone?: string;
    village?: string;
    code: string;
    active: boolean;
    wallet_balance?: number;
}

export interface MilkEntry {
    id: string;
    dairy_id: string;
    farmer_id: string;
    collected_by: string;
    entry_date: string;
    session: SessionTime;
    liters: number;
    fat?: number;
    snf?: number;
    clr?: number;
    rate?: number;
    amount?: number;
    offline_id?: string;
    is_correction: boolean;
    correction_ref_id?: string;
    created_at: string;
    farmer?: {
        id: string;
        name: string;
        code: string;
    };
}

export interface LedgerEntry {
    id: string;
    dairy_id: string;
    entity_type: 'farmer' | 'buyer';
    entity_id: string;
    entry_type: 'milk' | 'payment' | 'advance' | 'product';
    credit: number;
    debit: number;
    ref_table?: string;
    ref_id?: string;
    notes?: string;
    created_at: string;
}

export interface Bill {
    id: string;
    dairy_id: string;
    farmer_id: string;
    bill_number: string;
    period_start: string;
    period_end: string;
    total_quantity: number;
    avg_fat: number;
    avg_snf: number;
    gross_amount: number;
    deductions: number;
    net_amount: number;
    status: 'draft' | 'finalized' | 'paid';
    created_at: string;
    farmer?: {
        name: string;
        code: string;
    };
}

export interface Product {
    id: string;
    dairy_id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    stock: number;
    active: boolean;
}

export interface ProductRequest {
    id: string;
    dairy_id: string;
    farmer_id: string;
    product_id: string;
    quantity: number;
    status: 'requested' | 'approved' | 'rejected';
    created_at: string;
    farmer?: { name: string };
    product?: { name: string; price: number; stock: number };
}
