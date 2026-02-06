-- DIGIDHOODH ULTIMATE - FINAL MASTER SCHEMA
-- Database: PostgreSQL (Supabase Compatible)
-- Architecture: Modular Monolith, Accounting-grade
-- Financial Rule: Money is immutable. Balance is derived from Ledger.

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DAIRIES (Tenants)
CREATE TABLE public.dairies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT,
    village TEXT,
    address TEXT,
    phone TEXT,
    language TEXT DEFAULT 'en',
    billing_cycle TEXT CHECK (billing_cycle IN ('daily','weekly','10-day','15-day','monthly')),
    
    -- Subscription Shortcuts (Cached for Performance)
    plan_id TEXT DEFAULT 'BASIC', -- BASIC, PREMIUM, PREMIUM_PLUS
    subscription_status TEXT DEFAULT 'TRIAL', -- TRIAL, ACTIVE, EXPIRED
    subscription_end_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Profiles linked to Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('platform_admin', 'internal_admin', 'owner', 'staff', 'farmer', 'buyer')),
    permissions TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FARMERS
CREATE TABLE public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    village TEXT,
    cattle_type TEXT CHECK (cattle_type IN ('cow','buffalo','mixed')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (dairy_id, code)
);

-- 4. BUYERS
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    business_type TEXT, -- RETAIL, WHOLESALE, RESTAURANT
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RATE CHARTS
CREATE TABLE public.rate_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    name TEXT,
    entity_type TEXT CHECK (entity_type IN ('farmer','buyer')),
    cattle_type TEXT CHECK (cattle_type IN ('cow','buffalo','mixed')),
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rate_chart_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_chart_id UUID REFERENCES public.rate_charts(id) ON DELETE CASCADE,
    min_fat NUMERIC(4,2),
    max_fat NUMERIC(4,2),
    min_snf NUMERIC(4,2),
    max_snf NUMERIC(4,2),
    rate NUMERIC(10,2) NOT NULL
);

-- 6. MILK ENTRIES (Append-Only)
-- Rule: NO UPDATE, NO DELETE. Corrections = New Entry with Negative Values.
CREATE TABLE public.milk_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    collected_by UUID REFERENCES public.users(id),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session TEXT CHECK (session IN ('morning','evening')),
    liters NUMERIC(10,2) NOT NULL CHECK (liters >= -1000 AND liters <= 1000), -- Allows negative for corrections
    fat NUMERIC(4,2),
    snf NUMERIC(4,2),
    clr NUMERIC(4,2),
    rate NUMERIC(10,2),
    amount NUMERIC(12,2),
    offline_id UUID UNIQUE,
    is_correction BOOLEAN DEFAULT FALSE,
    correction_ref_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEDGER (Financial Source of Truth)
CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('farmer','buyer')),
    entity_id UUID NOT NULL, -- Farmer ID or Buyer ID
    entry_type TEXT CHECK (entry_type IN ('milk','advance','loan','product','payment','adjustment')),
    credit NUMERIC(12,2) DEFAULT 0, -- Dairy owes Farmer / Buyer pays Dairy
    debit NUMERIC(12,2) DEFAULT 0,  -- Farmer takes Advance / Dairy sells to Buyer
    ref_table TEXT, -- e.g., 'milk_entries', 'payments'
    ref_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BILLS (Statements)
CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    entity_type TEXT CHECK (entity_type IN ('farmer','buyer')),
    entity_id UUID NOT NULL,
    bill_number TEXT,
    period_start DATE,
    period_end DATE,
    total_amount NUMERIC(12,2),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','final','paid')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADVANCES & LOANS
CREATE TABLE public.advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SETTLED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    total_amount NUMERIC(12,2) NOT NULL,
    remaining_amount NUMERIC(12,2) NOT NULL,
    interest_rate NUMERIC(4,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCTS & INVENTORY
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT,
    stock NUMERIC(12,2) DEFAULT 0,
    price NUMERIC(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    plan TEXT CHECK (plan IN ('basic','premium','premium_plus')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount_paid NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS (Razorpay/External)
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dairy_id UUID NOT NULL REFERENCES public.dairies(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'razorpay',
    order_id TEXT NOT NULL,
    payment_id TEXT,
    amount NUMERIC(12,2) NOT NULL,
    plan TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOG
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    dairy_id UUID REFERENCES public.dairies(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_milk_dairy_date ON public.milk_entries(dairy_id, entry_date);
CREATE INDEX idx_ledger_entity ON public.ledger_entries(dairy_id, entity_type, entity_id);
CREATE INDEX idx_bills_entity ON public.bills(dairy_id, entity_type, entity_id);
CREATE INDEX idx_users_dairy ON public.users(dairy_id);

-- NOTE: milk_entries is designed to be PARTITIONED BY entry_date when size > 50M rows

-- ACCOUNTING-GRADE POLISHES

-- 1. Ledger Sanity Constraint
ALTER TABLE public.ledger_entries
ADD CONSTRAINT ledger_one_side_only
CHECK (
  (credit > 0 AND debit = 0)
  OR
  (debit > 0 AND credit = 0)
);

-- 2. Enforce Append-Only at Database Level (Prevents any UI or manual editing)
REVOKE UPDATE, DELETE ON public.milk_entries FROM authenticated;
REVOKE UPDATE, DELETE ON public.ledger_entries FROM authenticated;

-- 3. Bill Final status lock
CREATE OR REPLACE FUNCTION prevent_final_bill_update()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'final' AND NEW.status != 'paid' THEN
    RAISE EXCEPTION 'Finalized bills are immutable except for payment status updates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bill_lock_trigger
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION prevent_final_bill_update();

-- 14. AUTO-LEDGER TRIGGERS
-- Rule: Every financial event must auto-create a ledger entry

-- Function for Milk Entry -> Ledger
CREATE OR REPLACE FUNCTION public.proc_milk_to_ledger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ledger_entries (
        dairy_id, entity_type, entity_id, entry_type, credit, debit, ref_table, ref_id, notes
    ) VALUES (
        NEW.dairy_id, 'farmer', NEW.farmer_id, 'milk', NEW.amount, 0, 'milk_entries', NEW.id,
        'Milk Collection: ' || NEW.liters || 'L @ ₹' || NEW.rate
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_milk_to_ledger
AFTER INSERT ON public.milk_entries
FOR EACH ROW EXECUTE FUNCTION public.proc_milk_to_ledger();

-- Function for ADVANCE -> Ledger
CREATE OR REPLACE FUNCTION public.proc_advance_to_ledger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ledger_entries (
        dairy_id, entity_type, entity_id, entry_type, credit, debit, ref_table, ref_id, notes
    ) VALUES (
        NEW.dairy_id, 'farmer', NEW.farmer_id, 'advance', 0, NEW.amount, 'advances', NEW.id,
        'Cash Advance Issued'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_advance_to_ledger
AFTER INSERT ON public.advances
FOR EACH ROW EXECUTE FUNCTION public.proc_advance_to_ledger();

-- 15. BILLING & ANALYTICS VIEWS (Founder Dashboard)

-- View for Farmer Balances (Live)
CREATE OR REPLACE VIEW public.view_farmer_balances AS
SELECT 
    f.id as farmer_id,
    f.name,
    f.dairy_id,
    COALESCE(SUM(l.credit), 0) - COALESCE(SUM(l.debit), 0) as net_balance
FROM public.farmers f
LEFT JOIN public.ledger_entries l ON f.id = l.entity_id AND l.entity_type = 'farmer'
GROUP BY f.id, f.name, f.dairy_id;

-- View for Founder Analytics (Daily Performance)
CREATE OR REPLACE VIEW public.view_founder_daily_stats AS
SELECT 
    dairy_id,
    entry_date,
    SUM(liters) as total_liters,
    AVG(fat) as avg_fat,
    AVG(snf) as avg_snf,
    SUM(amount) as total_payout_liability,
    COUNT(DISTINCT farmer_id) as active_farmers
FROM public.milk_entries
GROUP BY dairy_id, entry_date;

-- View for Founder Analytics (Monthly Profit & Loss)
CREATE OR REPLACE VIEW public.view_monthly_pnl AS
SELECT 
    dairy_id,
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN entry_type = 'milk' THEN credit ELSE 0 END) as milk_expense,
    SUM(CASE WHEN entry_type = 'product' THEN debit ELSE 0 END) as inventory_sales,
    SUM(CASE WHEN entry_type = 'payment' AND entity_type = 'buyer' THEN credit ELSE 0 END) as revenue_from_buyers
FROM public.ledger_entries
GROUP BY dairy_id, DATE_TRUNC('month', created_at);

-- 16. PARTITION AUTOMATION (HINTS)
-- Logic to create monthly partitions (Conceptual for large scale)
-- SELECT create_parent('public.milk_entries', 'entry_date', 'native', 'monthly');

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.dairies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_chart_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Dairies: Users can see the dairy they belong to
CREATE POLICY "Users can view their own dairy" ON public.dairies
    FOR SELECT USING (
        id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid())
    );

-- Users: See self or teammates
CREATE POLICY "Users can view teammates" ON public.users
    FOR SELECT USING (
        dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid())
    );

-- Standard "Same Dairy" Policy for Staff/Owners
-- We use a helper function or a simple subquery to check if current user is owner/staff
CREATE POLICY "Staff can manage dairy records" ON public.farmers
    FOR ALL USING (dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff')));

CREATE POLICY "Staff can manage milk" ON public.milk_entries
    FOR ALL USING (dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff')));

CREATE POLICY "Staff can manage ledger" ON public.ledger_entries
    FOR ALL USING (dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff')));

CREATE POLICY "Staff can manage bills" ON public.bills
    FOR ALL USING (dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff')));

CREATE POLICY "Staff can manage rate charts" ON public.rate_charts
    FOR ALL USING (dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff')));

CREATE POLICY "Staff can manage rates" ON public.rate_chart_rows
    FOR ALL USING (rate_chart_id IN (SELECT id FROM public.rate_charts WHERE dairy_id IN (SELECT dairy_id FROM public.users WHERE id = auth.uid() AND role IN ('owner', 'staff'))));

-- Farmer Access (Gated)
CREATE POLICY "Farmers can view their own entries" ON public.milk_entries
    FOR SELECT USING (farmer_id IN (SELECT id FROM public.farmers WHERE phone = (SELECT phone FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Farmers can view their own ledger" ON public.ledger_entries
    FOR SELECT USING (entity_id IN (SELECT id FROM public.farmers WHERE phone = (SELECT phone FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Farmers can view their own bills" ON public.bills
    FOR SELECT USING (entity_id IN (SELECT id FROM public.farmers WHERE phone = (SELECT phone FROM auth.users WHERE id = auth.uid())));
