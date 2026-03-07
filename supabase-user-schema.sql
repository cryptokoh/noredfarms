-- Nored Farms: User Backend Schema
-- Tables: favorites, orders, order_items, user_carts
-- Run via Supabase SQL Editor

-- Favorites: bookmark any page (articles, classroom docs, products)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('article', 'classroom', 'product', 'course')),
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_url TEXT NOT NULL,
  item_meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(user_id, item_type, item_id);

-- Orders: one row per Stripe checkout session
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'partial_refund')),
  total_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  shipping_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order items: line items within an order
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Server-side cart persistence
CREATE TABLE IF NOT EXISTS user_carts (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  cart_data JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users read own cart" ON user_carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own cart" ON user_carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON user_carts FOR UPDATE USING (auth.uid() = user_id);

-- Service role inserts orders via webhook (no RLS policy needed — service_role bypasses RLS)
