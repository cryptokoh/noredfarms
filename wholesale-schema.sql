-- ============================================================
-- Nored Farms Wholesale Portal - Database Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add role column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer'
  CHECK (role IN ('customer', 'wholesale', 'admin'));

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. Wholesale Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS wholesale_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  tax_id text,
  business_type text, -- 'retailer', 'distributor', 'manufacturer', etc.
  website_url text,
  resale_certificate_url text, -- Supabase Storage path
  shipping_addresses jsonb DEFAULT '[]'::jsonb,
  application_status text NOT NULL DEFAULT 'pending'
    CHECK (application_status IN ('pending', 'approved', 'rejected', 'suspended')),
  discount_tier text NOT NULL DEFAULT 'standard'
    CHECK (discount_tier IN ('standard', 'preferred', 'premium', 'custom')),
  payment_terms text NOT NULL DEFAULT 'prepaid'
    CHECK (payment_terms IN ('prepaid', 'net15', 'net30', 'net60')),
  min_order_cents integer NOT NULL DEFAULT 50000, -- $500 default
  notes text,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_wholesale_accounts_status ON wholesale_accounts(application_status);
CREATE INDEX IF NOT EXISTS idx_wholesale_accounts_user ON wholesale_accounts(user_id);

-- ============================================================
-- 3. Wholesale Pricing (per-product overrides per account)
-- ============================================================
CREATE TABLE IF NOT EXISTS wholesale_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES wholesale_accounts(id) ON DELETE CASCADE,
  product_id text NOT NULL, -- matches product IDs from cart system
  wholesale_price_cents integer NOT NULL,
  min_quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wholesale_pricing_account ON wholesale_pricing(account_id);

-- ============================================================
-- 4. Wholesale Orders
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS wholesale_order_seq START 1001;

CREATE TABLE IF NOT EXISTS wholesale_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE, -- WO-2026-XXXX (auto-generated)
  account_id uuid NOT NULL REFERENCES wholesale_accounts(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  po_number text, -- customer's purchase order number
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'prepaid'
    CHECK (payment_method IN ('prepaid', 'net_terms')),
  stripe_session_id text,
  stripe_payment_intent text,
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  shipping_address jsonb,
  tracking_number text,
  tracking_carrier text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wholesale_orders_account ON wholesale_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_user ON wholesale_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_status ON wholesale_orders(status);

-- ============================================================
-- 5. Wholesale Order Items
-- ============================================================
CREATE TABLE IF NOT EXISTS wholesale_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES wholesale_orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price_cents integer NOT NULL,
  total_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wholesale_order_items_order ON wholesale_order_items(order_id);

-- ============================================================
-- 6. Wholesale Invoices
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS wholesale_invoice_seq START 1001;

CREATE TABLE IF NOT EXISTS wholesale_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE, -- INV-2026-XXXX (auto-generated)
  order_id uuid NOT NULL REFERENCES wholesale_orders(id),
  account_id uuid NOT NULL REFERENCES wholesale_accounts(id),
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  due_date date NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'overdue', 'void')),
  paid_at timestamptz,
  pdf_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wholesale_invoices_order ON wholesale_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_invoices_account ON wholesale_invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_invoices_status ON wholesale_invoices(payment_status);

-- ============================================================
-- 7. Triggers: Auto-generate order/invoice numbers
-- ============================================================

CREATE OR REPLACE FUNCTION generate_wholesale_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'WO-' || EXTRACT(YEAR FROM now())::text || '-' ||
    LPAD(nextval('wholesale_order_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wholesale_order_number ON wholesale_orders;
CREATE TRIGGER trg_wholesale_order_number
  BEFORE INSERT ON wholesale_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_wholesale_order_number();

CREATE OR REPLACE FUNCTION generate_wholesale_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || EXTRACT(YEAR FROM now())::text || '-' ||
    LPAD(nextval('wholesale_invoice_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wholesale_invoice_number ON wholesale_invoices;
CREATE TRIGGER trg_wholesale_invoice_number
  BEFORE INSERT ON wholesale_invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_wholesale_invoice_number();

-- ============================================================
-- 8. Trigger: Auto-update updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wholesale_accounts_updated ON wholesale_accounts;
CREATE TRIGGER trg_wholesale_accounts_updated
  BEFORE UPDATE ON wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_pricing_updated ON wholesale_pricing;
CREATE TRIGGER trg_wholesale_pricing_updated
  BEFORE UPDATE ON wholesale_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_orders_updated ON wholesale_orders;
CREATE TRIGGER trg_wholesale_orders_updated
  BEFORE UPDATE ON wholesale_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_wholesale_invoices_updated ON wholesale_invoices;
CREATE TRIGGER trg_wholesale_invoices_updated
  BEFORE UPDATE ON wholesale_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. RLS Policies
-- ============================================================

ALTER TABLE wholesale_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_invoices ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is wholesale
CREATE OR REPLACE FUNCTION is_wholesale()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'wholesale'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- wholesale_accounts: own row or admin
CREATE POLICY "Users can view own wholesale account"
  ON wholesale_accounts FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own wholesale application"
  ON wholesale_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wholesale account"
  ON wholesale_accounts FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can delete wholesale accounts"
  ON wholesale_accounts FOR DELETE
  USING (is_admin());

-- wholesale_pricing: own account or admin
CREATE POLICY "Wholesale users see own pricing"
  ON wholesale_pricing FOR SELECT
  USING (
    account_id IN (SELECT id FROM wholesale_accounts WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins manage pricing"
  ON wholesale_pricing FOR ALL
  USING (is_admin());

-- wholesale_orders: own orders or admin
CREATE POLICY "Wholesale users see own orders"
  ON wholesale_orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Wholesale users create orders"
  ON wholesale_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update orders"
  ON wholesale_orders FOR UPDATE
  USING (is_admin() OR user_id = auth.uid());

-- wholesale_order_items: via order access
CREATE POLICY "Users see own order items"
  ON wholesale_order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM wholesale_orders WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users insert own order items"
  ON wholesale_order_items FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM wholesale_orders WHERE user_id = auth.uid())
    OR is_admin()
  );

-- wholesale_invoices: own account or admin
CREATE POLICY "Wholesale users see own invoices"
  ON wholesale_invoices FOR SELECT
  USING (
    account_id IN (SELECT id FROM wholesale_accounts WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins manage invoices"
  ON wholesale_invoices FOR ALL
  USING (is_admin());

-- ============================================================
-- 10. Storage bucket for resale certificates
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('wholesale-documents', 'wholesale-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own wholesale docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wholesale-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users view own wholesale docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wholesale-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin()
    )
  );

CREATE POLICY "Admins manage wholesale docs"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'wholesale-documents'
    AND is_admin()
  );
