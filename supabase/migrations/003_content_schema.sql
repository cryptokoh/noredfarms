-- noredFarms Content Schema: products, articles, media, categories
-- Replaces hardcoded cart.js data with managed DB tables

-- Product catalog
CREATE TABLE nf_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  price_cents integer NOT NULL,
  compare_at_cents integer,
  description text,
  short_description text,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  sku text,
  stock_status text DEFAULT 'in_stock',
  is_published boolean DEFAULT true,
  stripe_price_id text,
  stripe_product_id text,
  metadata jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Article metadata (HTML stays on disk, metadata for search/SEO)
CREATE TABLE nf_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  featured_image text,
  author text DEFAULT 'Nored Farms',
  category text,
  tags text[] DEFAULT '{}',
  seo_title text,
  seo_description text,
  og_image text,
  is_published boolean DEFAULT true,
  published_at timestamptz,
  scheduled_at timestamptz,
  word_count integer,
  reading_time_min integer,
  seo_score integer,
  seo_issues jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media library
CREATE TABLE nf_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  alt_text text,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  folder text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  uploaded_by text,
  created_at timestamptz DEFAULT now()
);

-- Product categories
CREATE TABLE nf_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0
);

CREATE INDEX idx_nf_products_category ON nf_products(category);
CREATE INDEX idx_nf_products_published ON nf_products(is_published) WHERE is_published = true;
CREATE INDEX idx_nf_articles_published ON nf_articles(is_published, published_at DESC);
CREATE INDEX idx_nf_articles_scheduled ON nf_articles(scheduled_at) WHERE scheduled_at IS NOT NULL AND is_published = false;
CREATE INDEX idx_nf_media_folder ON nf_media(folder);
