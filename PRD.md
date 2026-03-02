# Nored Farms - Product Requirements Document

**Version:** 2.0
**Last Updated:** January 15, 2025
**Status:** Phase 1 Complete - Frontend MVP Live
**Document Owner:** Nored Farms Team
**Repository:** https://github.com/cryptokoh/purextracts

---

## Executive Summary

Nored Farms is a premium botanical extract laboratory based in Fredericksburg, Texas, specializing in high-quality kratom, kava, blue lotus, and other natural plant extracts. This PRD outlines the complete digital platform strategy including e-commerce, content management, SEO automation, and social media integration.

### Product Focus

**Core Product Lines:**
- **Kratom Extracts** - Mitragyna speciosa concentrates and powders
- **Kava Extracts** - Piper methysticum preparations
- **Blue Lotus** - Nymphaea caerulea extracts
- **Botanical Blends** - Proprietary wellness formulations

**Competitive Advantages:**
- Texas Hill Country laboratory with rigorous quality control
- Full transparency with Certificates of Analysis (COA)
- Educational-first approach to botanical wellness
- Direct-to-consumer and B2B wholesale options

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Feature Specifications](#feature-specifications)
4. [E-Commerce System](#e-commerce-system)
5. [Blog & Content System](#blog--content-system)
6. [SEO Strategy & Automation](#seo-strategy--automation)
7. [Social Media Automation](#social-media-automation)
8. [Compliance & Legal](#compliance--legal)
9. [Database Schema](#database-schema)
10. [Automation Architecture (n8n)](#automation-architecture-n8n)
11. [Rollout Phases](#rollout-phases)
12. [Success Metrics](#success-metrics)

---

## Project Overview

### Vision
Build a best-in-class digital presence for Nored Farms that establishes authority in the botanical extract space through educational content, transparent lab practices, and seamless e-commerce.

### Goals
1. **Authority Building** - Position as the trusted source for botanical extract knowledge
2. **Education-First** - Lead with science-backed content on kratom, kava, and botanicals
3. **SEO Dominance** - Organic + paid traffic strategies for botanical wellness keywords
4. **Automation** - Minimize manual work through intelligent automation
5. **Community** - Build engaged customer base through education and transparency

### Target Audience
- Health-conscious consumers seeking natural wellness alternatives
- Kratom and kava enthusiasts looking for quality lab-tested products
- Holistic health practitioners and herbalists
- B2B clients (wellness brands, supplement retailers, spas)
- Researchers and ethnobotany enthusiasts

---

## Technical Architecture

### Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND                                 │
│  Static Site (HTML/CSS/JS) + Dynamic Islands               │
│  Hosted: GitHub Pages / Netlify / Vercel                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND                                  │
│  Supabase (PostgreSQL + Auth + Storage + Edge Functions)   │
│  - User Authentication                                       │
│  - Product Catalog                                          │
│  - Blog CMS                                                 │
│  - Order Management                                         │
│  - Media Storage                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUTOMATION (VPS)                          │
│  n8n Self-Hosted                                            │
│  - SEO Monitoring & Reporting                               │
│  - Social Media Scheduling                                  │
│  - Blog Auto-Publishing                                     │
│  - Inventory Alerts                                         │
│  - Customer Notifications                                   │
│  Claude Code Agent (SEO/Content Tasks)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   INTEGRATIONS                              │
│  Payment: Stripe (2.9% + 30¢)                              │
│  Email: Resend / Postmark                                   │
│  Analytics: Plausible / Umami (privacy-focused)            │
│  Search: Algolia / Meilisearch                             │
│  CDN: Cloudflare                                           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Vanilla JS + Islands | Fast, no framework lock-in |
| Database | Supabase (Postgres) | Auth + DB + Storage in one |
| Auth | Supabase Auth | Built-in, secure, supports OAuth |
| Storage | Supabase Storage | Images, COAs, documents |
| Automation | n8n (self-hosted) | Full control, no vendor lock |
| AI Agent | Claude Code | SEO tasks, content generation |
| Payments | High-risk processor | Required for hemp industry |
| Email | Resend | Developer-friendly, reliable |
| Analytics | Plausible | Privacy-focused, GDPR compliant |

---

## Feature Specifications

### Phase 1: Foundation (Weeks 1-2)

#### F1.1 User Authentication
- [ ] Email/password registration
- [ ] Email verification
- [ ] Password reset flow
- [ ] Age verification gate (21+)
- [ ] Session management
- [ ] OAuth (Google, optional)

#### F1.2 Product Catalog
- [x] Product listing page ✅
- [x] Product detail pages (static HTML) ✅
- [x] Category filtering ✅
- [ ] Search functionality
- [ ] Product variants (size, concentration)
- [ ] Stock status indicators
- [ ] COA (Certificate of Analysis) display

#### F1.3 Shopping Cart
- [x] Add/remove items ✅
- [x] Quantity adjustment ✅
- [x] Cart persistence (localStorage) ✅
- [x] Cart drawer/modal ✅

### Phase 2: Commerce (Weeks 3-4)

#### F2.1 Checkout Flow
- [ ] Shipping address collection
- [ ] Shipping method selection
- [ ] Age verification confirmation
- [ ] Terms acceptance
- [ ] Payment processing
- [ ] Order confirmation

#### F2.2 Payment Integration
- [ ] High-risk processor integration
- [ ] PCI compliance handling
- [ ] Failed payment handling
- [ ] Refund capability

#### F2.3 Order Management
- [ ] Order history (customer)
- [ ] Order status tracking
- [ ] Email notifications
- [ ] Admin order dashboard

### Phase 3: Content (Weeks 5-6)

#### F3.1 Blog System
- [x] Blog listing page ✅
- [x] Blog post pages (templates) ✅
- [x] Category/tag system ✅
- [ ] Author profiles
- [x] Related posts ✅
- [x] Social sharing (buttons ready) ✅
- [x] Reading time estimates ✅

#### F3.2 Admin CMS
- [ ] Rich text editor (TipTap/Lexical)
- [ ] Image upload/management
- [ ] Draft/publish workflow
- [ ] Scheduled publishing
- [ ] SEO meta editor
- [ ] Preview mode

### Phase 4: Automation (Weeks 7-8)

#### F4.1 SEO Automation
- [x] Automated sitemap generation ✅
- [x] Schema.org markup ✅
- [x] Meta tag optimization ✅
- [ ] Internal linking suggestions
- [ ] Keyword tracking
- [ ] Competitor monitoring
- [ ] Ranking reports

#### F4.2 Social Automation
- [ ] Auto-post new blog articles
- [ ] Product launch announcements
- [ ] Scheduled content calendar
- [ ] Multi-platform posting
- [ ] Engagement monitoring

---

## E-Commerce System

### Payment Processing Strategy

**Advantage:** Botanical extracts (kratom, kava, blue lotus) can use standard payment processors - no high-risk fees required.

**Recommended Stack:**

| Processor | Fees | Use Case |
|-----------|------|----------|
| **Stripe** | 2.9% + 30¢ | Primary processor - cards, Apple Pay, Google Pay |
| **PayPal** | 2.99% + 49¢ | Alternative for customer preference |
| **Crypto (NOWPayments)** | 0.5-1% | Optional for crypto-native customers |

**Recommendation:** Stripe as primary with PayPal as backup. Crypto optional for B2B wholesale.

**Note:** Kratom has some state-level restrictions. Implement geo-blocking for restricted states at checkout.

### Product Data Model

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;

  // Pricing
  price: number;
  compare_at_price?: number;
  cost?: number;

  // Inventory
  sku: string;
  barcode?: string;
  track_inventory: boolean;
  quantity: number;
  low_stock_threshold: number;

  // Categorization
  category_id: string;
  tags: string[];

  // Media
  images: ProductImage[];

  // Compliance
  coa_url?: string;  // Certificate of Analysis
  coa_batch?: string;
  thc_percentage?: number;
  cbd_percentage?: number;

  // Variants
  has_variants: boolean;
  variants?: ProductVariant[];

  // SEO
  meta_title?: string;
  meta_description?: string;

  // Status
  status: 'draft' | 'active' | 'archived';
  published_at?: Date;

  created_at: Date;
  updated_at: Date;
}
```

### Age Verification

**Requirements:**
- Display age gate on first visit
- Store verification in localStorage + session
- Re-verify at checkout
- Log verification for compliance

**Implementation Options:**
1. Simple checkbox confirmation (minimum)
2. Date of birth entry
3. Third-party verification service (AgeChecker.net)

---

## Blog & Content System

### Content Strategy

**Core Pillars:**

1. **Ingredient Education** (40%)
   - Deep dives on botanicals (existing articles)
   - New compounds and research
   - Traditional uses vs modern science

2. **Extraction Science** (25%)
   - Extraction methods explained
   - Equipment guides
   - DIY tutorials

3. **Industry News** (20%)
   - Regulatory updates
   - Market trends
   - Company news

4. **Lifestyle & Wellness** (15%)
   - Use cases
   - Customer stories
   - Recipes/applications

### Blog Data Model

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;  // Rich text/HTML

  // Author
  author_id: string;

  // Categorization
  category_id: string;
  tags: string[];

  // Media
  featured_image: string;
  images: string[];

  // SEO
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  schema_markup?: object;

  // Publishing
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at?: Date;
  scheduled_for?: Date;

  // Engagement
  view_count: number;
  reading_time: number;  // minutes

  created_at: Date;
  updated_at: Date;
}
```

---

## SEO Strategy & Automation

### Why SEO is Critical

> "SEO-driven content fills the gap left by restricted paid advertising channels."
> — [Canna-Mack: Why Content Marketing Is Essential for Cannabis Brands](https://canna-mack.com/why-content-marketing-is-essential-for-cannabis-brands-in-2025/)

**Platform Restrictions:**
- Google Ads: Limited to FDA-approved CBD pharmaceuticals, requires LegitScript certification
- Meta (Facebook/Instagram): Ingestible CBD and intoxicating hemp banned
- TikTok: All hemp-THC products prohibited

### SEO Automation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   n8n SEO WORKFLOWS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Keyword    │    │  Rank       │    │  Competitor │    │
│  │  Research   │───▶│  Tracking   │───▶│  Analysis   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Claude Code Agent                       │  │
│  │  - Content brief generation                         │  │
│  │  - Meta tag optimization                            │  │
│  │  - Internal linking suggestions                     │  │
│  │  - Schema markup generation                         │  │
│  └─────────────────────────────────────────────────────┘  │
│         │                                                  │
│         ▼                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Sitemap    │    │  Report     │    │  Alert      │    │
│  │  Generator  │    │  Generator  │    │  System     │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Target Keywords

**Primary (High Intent):**
- "buy kratom extract online"
- "kava extract for sale"
- "blue lotus extract"
- "premium botanical extracts"

**Educational (Content Marketing):**
- "kratom benefits and effects"
- "kava vs kratom"
- "blue lotus tea effects"
- "what is mitragynine"
- "kavalactones explained"

**Long-tail (Low Competition):**
- "kratom extract texas"
- "bulk kava wholesale"
- "lab tested kratom COA"
- "botanical extracts fredericksburg tx"

**Local SEO:**
- "herbal extracts texas hill country"
- "natural wellness fredericksburg"

### Technical SEO Checklist

- [x] XML Sitemap (auto-generated) ✅
- [x] Robots.txt optimization ✅
- [x] Schema.org Product markup ✅
- [x] Schema.org Article markup ✅
- [x] Schema.org LocalBusiness markup ✅
- [x] Open Graph tags ✅
- [x] Twitter Card tags ✅
- [ ] Canonical URLs
- [ ] Breadcrumb navigation
- [ ] Internal linking structure
- [x] Page speed optimization (Core Web Vitals) ✅
- [x] Mobile-first indexing ready ✅
- [ ] SSL certificate (requires hosting)
- [ ] Structured data testing

---

## Social Media Automation

### Platform Strategy

| Platform | Use Case | Automation Level | Content Frequency |
|----------|----------|------------------|-------------------|
| Instagram | Visual content, education, reels | Semi-auto via Blotato | 7x/week |
| Facebook | Community, groups, live videos | Semi-auto via Blotato | 5x/week |
| X (Twitter) | News, threads, industry updates | Full-auto via Blotato | 7x/week |
| YouTube | Long-form education, Shorts | Manual + auto description | 2x/week |
| TikTok | Educational content, lab ASMR | Semi-auto via Blotato | 5x/week |
| LinkedIn | B2B, professional content | Manual + scheduled | 3x/week |

> **Note:** All platforms except Google/Meta paid ads support organic posting for hemp content. TikTok is viable for educational content but NOT product promotion.

### Complete Automation Architecture (n8n + Blotato)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Google Sheets    │  Supabase DB    │  AI Content Gen           │
│  (Content Cal)    │  (Blog Posts)   │  (Claude/GPT)             │
└────────┬──────────┴────────┬────────┴────────┬──────────────────┘
         │                   │                  │
         ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    n8n ORCHESTRATION LAYER                       │
│  • Compliance checking (prohibited terms, health claims)         │
│  • Platform-specific content transformation                      │
│  • Scheduling optimization by platform                           │
│  • Performance tracking and reporting                            │
└────────┬──────────────────────────────────────┬─────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOTATO DISTRIBUTION                          │
│  Unified API for multi-platform posting                          │
├─────────────────────────────────────────────────────────────────┤
│  Instagram │ Facebook │ TikTok │ YouTube │ X │ LinkedIn │ Threads│
└─────────────────────────────────────────────────────────────────┘
```

### n8n Workflow Files

All workflows are available in `/n8n-workflows/` directory:

| Workflow | File | Purpose |
|----------|------|---------|
| Multi-Platform Post | `social-multi-platform-post.json` | Post to all platforms via Blotato |
| Blog-to-Social | `blog-to-social-pipeline.json` | Auto-distribute new blog posts |
| SEO Rank Tracker | `seo-rank-tracker.json` | Weekly keyword ranking reports |

### SEO/Social Agent Configuration

Detailed platform strategies, content calendars, hashtag strategies, and compliance rules are documented in `seo-agent-config.md`.

**Key Agent Capabilities:**
- Platform-specific content transformation
- Compliance checking (prohibited terms, health claims)
- Hashtag optimization by platform
- Posting time optimization
- Engagement monitoring and response drafts

### Platform-Specific Strategies

#### Instagram Strategy
- **Content Mix:** Carousels (Mon), Reels (Tue/Fri), Stories (Wed), Product Spotlights (Thu), UGC (Sat)
- **Hashtag Strategy:** 5 primary + 10 secondary + 5 local + 10 niche
- **Compliance:** No purchase CTAs, no health claims, "link in bio" for traffic

#### Facebook Strategy
- **Page Content:** Educational articles (3x/week), Live videos (1x/week), Community posts (daily)
- **Group Strategy:** Create "Texas Hemp Education Community" (private, age-verified)
- **Events:** Monthly workshops and tastings (21+)

#### TikTok Strategy
- **Content Themes:** Lab ASMR, myth busting, 60-sec science lessons, day-in-the-life POV
- **Compliance:** Educational framing ONLY, never show consumption, never direct to purchase
- **Viral Hooks:** "POV: You work at a legal hemp lab in Texas"

#### YouTube Strategy
- **Long-Form:** Deep dives (10-20min) on cannabinoid science, extraction methods, interviews
- **Shorts:** Quick facts, behind-scenes clips, trending topics
- **SEO:** Question-based titles, 200+ word descriptions, timestamps

#### X (Twitter) Strategy
- **Content Types:** Threads (deep dives), quick takes (news), engagement (community), announcements
- **Tone:** Industry insider, informative, professional

### n8n Social Workflows

```yaml
Workflow: Blog-to-Social (Full Pipeline)
Trigger: Supabase webhook (new blog_posts)
Actions:
  1. Fetch full blog post content
  2. AI generates platform-specific versions:
     - Instagram: 2200 char caption + carousel concept
     - Facebook: Full excerpt + discussion prompt
     - X: Thread (5-7 tweets) with hashtags
     - TikTok: 60-sec video script
     - YouTube: Shorts description + timestamps
  3. Compliance check all generated content
  4. IF compliant: Post via Blotato to all platforms
  5. IF violation: Queue for manual review + notify team
  6. Update blog post status (social_posted = true)
  7. Track performance metrics

Workflow: Daily Engagement Monitor
Trigger: Cron (9am, 2pm, 7pm CST)
Actions:
  1. Fetch mentions across all platforms
  2. Categorize: inquiry / spam / engagement / complaint
  3. Generate compliant response drafts
  4. Queue complaints for immediate team alert
  5. Compile daily engagement summary

Workflow: Weekly Content Prep
Trigger: Cron (Sundays 6am)
Actions:
  1. Audit content calendar for gaps
  2. Research trending topics (Google Trends API)
  3. Generate AI content suggestions
  4. Create draft posts for each platform
  5. Send to team for review/approval

Workflow: Product-Launch Sequence
Trigger: Product status = 'active'
Actions:
  1. Generate launch announcement copy
  2. Create teaser → launch → reminder sequence
  3. Schedule across platforms (Blotato)
  4. Monitor engagement for questions
  5. Alert team to spikes
```

### Compliance Integration (CRITICAL)

All social automation includes built-in compliance checking:

**Prohibited Terms (Auto-Blocked):**
```
cure, cures, treat, treats, treatment, heal, heals, healing,
medicine, medical, drug, drugs, high, stoned, baked,
intoxicating, psychoactive effects, marijuana, prescription,
FDA approved, diagnose
```

**Auto-Replace Suggestions:**
```
cure → support, treat → assist, medicine → wellness product,
heal → help, drug → supplement, medical → natural
```

**Platform-Specific Rules:**
- Instagram: No direct purchase links in posts
- Facebook: Age-restricted page settings enabled
- TikTok: Educational framing required, no sales language
- YouTube: Age-gate required for certain content
- All: No health claims, proper disclaimers

---

## Compliance & Legal

### Required Disclosures

1. **Age Verification** - 18+ or 21+ depending on product/state
2. **COA Display** - Certificate of Analysis for each batch (alkaloid content, heavy metals, microbials)
3. **Kratom Consumer Protection Act** - Follow KCPA guidelines where applicable
4. **State Restrictions** - Kratom banned in: Alabama, Arkansas, Indiana, Rhode Island, Vermont, Wisconsin
5. **FDA Disclaimer** - "Not intended to diagnose, treat, cure, or prevent any disease"
6. **Health Claims** - Avoid unsubstantiated claims (no "cures", "treats", "heals")

### Compliance Documentation

```
/compliance
├── /coas                    # Certificates of Analysis
│   ├── batch-2025-001.pdf
│   └── batch-2025-002.pdf
├── /licenses                # Business licenses
├── /policies
│   ├── privacy-policy.md
│   ├── terms-of-service.md
│   ├── return-policy.md
│   └── shipping-policy.md
└── /advertising
    ├── claims-substantiation.md
    └── influencer-agreements/
```

### State Shipping Restrictions

Maintain dynamic list of states where shipping is permitted/restricted. Check at checkout and block orders to restricted states.

---

## Database Schema

### Supabase Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  age_verified BOOLEAN DEFAULT FALSE,
  age_verified_at TIMESTAMPTZ,
  role TEXT DEFAULT 'customer', -- customer, admin, editor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT TRUE,
  low_stock_threshold INTEGER DEFAULT 5,
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  images JSONB DEFAULT '[]',
  coa_url TEXT,
  thc_percentage DECIMAL(5,2),
  cbd_percentage DECIMAL(5,2),
  meta_title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES blog_categories(id),
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  schema_markup JSONB,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart (for logged-in users)
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Tracking
CREATE TABLE seo_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  position INTEGER,
  url TEXT,
  search_engine TEXT DEFAULT 'google',
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Public can view published products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Public can view published blog posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');
```

---

## Automation Architecture (n8n)

### VPS Setup

```yaml
Server: Ubuntu 22.04 VPS
Resources: 4GB RAM, 2 CPU, 80GB SSD
Location: US (for latency)

Services:
  - n8n (Docker)
  - PostgreSQL (for n8n)
  - Redis (queue management)
  - Nginx (reverse proxy)
  - Certbot (SSL)
  - Claude Code Agent (scheduled tasks)
```

### n8n Workflow Categories

#### 1. SEO Workflows
- **Daily Rank Check** - Track keyword positions
- **Weekly SEO Report** - Compile metrics
- **Content Audit** - Identify underperforming pages
- **Backlink Monitor** - Track new/lost backlinks
- **Technical SEO Check** - Crawl errors, speed issues

#### 2. Content Workflows
- **Blog Publisher** - Draft → Review → Publish pipeline
- **Content Calendar** - Scheduled posting
- **Image Optimizer** - Auto-compress uploads
- **Social Syndication** - Cross-post to platforms

#### 3. E-commerce Workflows
- **Order Notifications** - Customer + admin alerts
- **Inventory Alerts** - Low stock warnings
- **Abandoned Cart** - Recovery emails
- **Review Requests** - Post-purchase follow-up

#### 4. Customer Workflows
- **Welcome Series** - Onboarding emails
- **Re-engagement** - Win-back campaigns
- **Birthday/Anniversary** - Loyalty touchpoints

### Claude Code Agent Tasks

```yaml
Scheduled Tasks:
  daily:
    - Generate SEO recommendations
    - Analyze competitor content
    - Suggest internal linking opportunities

  weekly:
    - Create content briefs for trending topics
    - Optimize underperforming blog posts
    - Generate social media content calendar

  on-demand:
    - Write product descriptions
    - Generate meta tags
    - Create FAQ content
    - Draft email campaigns
```

---

## Rollout Phases

### Phase 1: Foundation (Weeks 1-2) ✅ FRONTEND COMPLETE
**Goal:** Core infrastructure and basic site

- [ ] Supabase project setup
- [ ] Database migrations
- [ ] Authentication system
- [ ] Basic admin panel
- [ ] Age verification gate
- [x] Product catalog (static) ✅
- [x] Blog migration (existing content) ✅
- [x] Three-theme system ✅
- [x] Mobile-responsive design ✅

**Milestone:** ✅ Site live with products displayed, no checkout

### Phase 2: Commerce (Weeks 3-4) - FRONTEND COMPLETE
**Goal:** Full shopping experience

- [x] Shopping cart (frontend) ✅
- [x] Checkout flow (frontend UI) ✅
- [ ] Payment processor integration (backend required)
- [ ] Order management (backend required)
- [ ] Email notifications (backend required)
- [ ] Shipping integration (backend required)

**Milestone:** Frontend cart ready, backend integration pending

### Phase 3: Content System (Weeks 5-6) - FRONTEND COMPLETE
**Goal:** Self-service content management

- [x] Blog listing page ✅
- [x] Blog category system ✅
- [x] Blog search functionality ✅
- [ ] Blog CMS admin
- [ ] Rich text editor
- [ ] Image management
- [ ] SEO meta editor
- [ ] Preview/publish workflow
- [ ] Scheduled publishing

**Milestone:** Static blog system live, CMS pending

### Phase 4: Automation (Weeks 7-8) - SEO FOUNDATION COMPLETE
**Goal:** Hands-off operation

- [x] Schema.org structured data ✅
- [x] XML Sitemap ✅
- [x] Robots.txt ✅
- [x] Open Graph / Twitter Cards ✅
- [ ] VPS setup with n8n
- [ ] SEO monitoring workflows
- [ ] Social media automation
- [ ] Email automation
- [ ] Analytics dashboard
- [ ] Claude Code agent integration

**Milestone:** Technical SEO foundation complete, automation pending

### Phase 5: Optimization (Ongoing)
**Goal:** Continuous improvement

- [ ] A/B testing
- [ ] Conversion optimization
- [ ] Content performance analysis
- [ ] SEO refinement
- [ ] Customer feedback integration

---

## Success Metrics

### Traffic & SEO
| Metric | Baseline | Month 3 | Month 6 | Month 12 |
|--------|----------|---------|---------|----------|
| Organic Sessions | 0 | 500 | 2,000 | 10,000 |
| Keyword Rankings (Top 10) | 0 | 5 | 20 | 50 |
| Domain Authority | 0 | 10 | 20 | 35 |
| Backlinks | 0 | 25 | 100 | 500 |

### E-commerce
| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| Orders | 10 | 50 | 200 | 1,000 |
| Revenue | $500 | $3,000 | $15,000 | $75,000 |
| AOV | $50 | $60 | $75 | $75 |
| Conversion Rate | 1% | 2% | 3% | 3.5% |

### Content
| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| Blog Posts | 15 | 30 | 60 | 120 |
| Email Subscribers | 100 | 500 | 2,000 | 10,000 |
| Social Followers | 100 | 500 | 2,000 | 5,000 |

---

## Appendix

### A. Payment Processor Comparison

Detailed comparison available at:
- [Cova Software - Payment Processing](https://www.covasoftware.com/payment-processing-for-cbd-and-hemp-stores)
- [BigCommerce - CBD Payments Guide](https://www.bigcommerce.com/articles/selling-cbd-online/cbd-payments/)
- [Flex Payment Solutions](https://flexpaymentsolutions.com/blog/what-is-the-best-payment-gateway-for-hemp-and-cbd/)

### B. SEO Resources

- [Selnox - Cannabis SEO 2025](https://selnox.com/blog/cannabis-seo-strategies-for-2025)
- [Latched Agency - Cannabis SEO Guide](https://www.latchedagency.com/resources/guide-to-cannabis-seo-in-the-usa)
- [Cova Software - Dispensary SEO](https://www.covasoftware.com/blog/cannabis-dispensary-seo-guide)

### C. Compliance Resources

- [Cannabis Business Times - Advertising Compliance](https://www.cannabisbusinesstimes.com/business-issues-benchmarks/cannabis-advertising/news/15767791/cannabis-advertising-compliance-2026-strategies-that-scale)
- [Acadia Content - State Guidelines](https://www.acadiacontentsolutions.com/cannabis/cannabis-and-thc-marketing-guidelines-by-state)

---

*This is a living document. Update as requirements evolve.*
