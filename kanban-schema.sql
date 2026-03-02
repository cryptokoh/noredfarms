-- ============================================
-- Nored Farms - Kanban Board Schema
-- Run in Supabase SQL Editor
-- ============================================

-- Boards table
create table if not exists kanban_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text default '📋',
  position int not null default 0,
  created_at timestamptz default now()
);

-- Tasks table
create table if not exists kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references kanban_boards(id) on delete cascade,
  title text not null,
  description text,
  column_name text not null default 'backlog',
  position int not null default 0,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  labels text[] default '{}',
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast board queries
create index if not exists idx_kanban_tasks_board on kanban_tasks(board_id, column_name, position);

-- Auto-update updated_at
create or replace function update_kanban_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger kanban_tasks_updated_at
  before update on kanban_tasks
  for each row execute function update_kanban_updated_at();

-- RLS policies (open for now - tighten later with auth)
alter table kanban_boards enable row level security;
alter table kanban_tasks enable row level security;

create policy "Public read boards" on kanban_boards for select using (true);
create policy "Public insert boards" on kanban_boards for insert with check (true);
create policy "Public update boards" on kanban_boards for update using (true);
create policy "Public delete boards" on kanban_boards for delete using (true);

create policy "Public read tasks" on kanban_tasks for select using (true);
create policy "Public insert tasks" on kanban_tasks for insert with check (true);
create policy "Public update tasks" on kanban_tasks for update using (true);
create policy "Public delete tasks" on kanban_tasks for delete using (true);

-- ============================================
-- Schema Expansion: v2 UX features
-- ============================================

-- New columns on kanban_tasks
alter table kanban_tasks add column if not exists assigned_to text;
alter table kanban_tasks add column if not exists created_by text;
alter table kanban_tasks add column if not exists subtasks jsonb default '[]';
alter table kanban_tasks add column if not exists column_entered_at timestamptz default now();

-- New column on kanban_boards
alter table kanban_boards add column if not exists wip_limits jsonb default '{}';

-- Reset column_entered_at when column changes
create or replace function reset_column_entered_at()
returns trigger as $$
begin
  if old.column_name is distinct from new.column_name then
    new.column_entered_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists kanban_tasks_column_entered on kanban_tasks;
create trigger kanban_tasks_column_entered
  before update on kanban_tasks
  for each row execute function reset_column_entered_at();

-- Activity / comments table
create table if not exists kanban_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references kanban_tasks(id) on delete cascade,
  board_id uuid references kanban_boards(id) on delete cascade,
  user_name text not null,
  action_type text not null, -- 'comment', 'create', 'move', 'update', 'assign', 'delete'
  content text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_kanban_activity_task on kanban_activity(task_id, created_at desc);

-- RLS for activity
alter table kanban_activity enable row level security;
create policy "Public read activity" on kanban_activity for select using (true);
create policy "Public insert activity" on kanban_activity for insert with check (true);
create policy "Public delete activity" on kanban_activity for delete using (true);

-- ============================================
-- Seed Data: Business Boards
-- ============================================

insert into kanban_boards (name, slug, icon, position) values
  ('Web Dev',            'web-dev',            '💻', 0),
  ('E-commerce',         'ecommerce',          '🛒', 1),
  ('Content Generation', 'content-generation',  '✍️', 2),
  ('Social Media',       'social-media',        '📱', 3),
  ('SEO',                'seo',                 '🔍', 4),
  ('Marketing',          'marketing',           '📣', 5),
  ('Operations',         'operations',          '⚙️', 6),
  ('Compliance & Legal', 'compliance-legal',    '📜', 7);

-- ============================================
-- Seed Data: Initial Tasks
-- ============================================

-- Web Dev
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'web-dev'),
   'Rename site from Pure Extracts to Nored Farms',
   'Update all page titles, nav logo text, footer references, meta tags, and manifest across all ~80 HTML pages. Update styles.css comments. Update README.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'web-dev'),
   'Update favicon and branding assets',
   'Create new Nored Farms favicon.svg, update site.webmanifest, og:image references.',
   'backlog', 1, 'high'),
  ((select id from kanban_boards where slug = 'web-dev'),
   'Set up Stripe product catalog',
   'Configure Stripe products, prices, and checkout for extract distribution.',
   'backlog', 2, 'medium'),
  ((select id from kanban_boards where slug = 'web-dev'),
   'Build cart and checkout flow',
   'Integrate Stripe checkout with product pages, cart state management.',
   'backlog', 3, 'medium'),
  ((select id from kanban_boards where slug = 'web-dev'),
   'Mobile responsiveness audit',
   'Test all pages on mobile viewports, fix layout issues.',
   'backlog', 4, 'medium');

-- E-commerce
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'ecommerce'),
   'Product photography and listing setup',
   'Photograph all extract products, write descriptions, set pricing.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'ecommerce'),
   'Shipping and fulfillment workflow',
   'Define shipping zones, rates, packaging, and fulfillment process.',
   'backlog', 1, 'high'),
  ((select id from kanban_boards where slug = 'ecommerce'),
   'Inventory tracking system',
   'Set up inventory management - either Supabase table or third-party integration.',
   'backlog', 2, 'medium');

-- Content Generation
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'content-generation'),
   'Write product descriptions for all extracts',
   'SEO-friendly product descriptions with benefits, usage, and ingredients.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'content-generation'),
   'Create educational blog content calendar',
   'Plan 3 months of blog posts about extracts, benefits, usage guides.',
   'backlog', 1, 'medium'),
  ((select id from kanban_boards where slug = 'content-generation'),
   'Brand voice and style guide',
   'Define Nored Farms tone, vocabulary, and content guidelines.',
   'backlog', 2, 'medium');

-- Social Media
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'social-media'),
   'Set up social media accounts',
   'Create Instagram, TikTok, Facebook, X accounts for Nored Farms.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'social-media'),
   'Create social media content calendar',
   'Plan first month of posts across all platforms.',
   'backlog', 1, 'medium'),
  ((select id from kanban_boards where slug = 'social-media'),
   'Design social media templates',
   'Create branded post templates, story templates, highlight covers.',
   'backlog', 2, 'medium');

-- SEO
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'seo'),
   'Keyword research for extract products',
   'Research high-value keywords for botanical extracts, tinctures, natural supplements.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'seo'),
   'Update meta tags and structured data',
   'Add proper meta descriptions, og tags, and JSON-LD schema to all pages.',
   'backlog', 1, 'high'),
  ((select id from kanban_boards where slug = 'seo'),
   'Submit sitemap to Google Search Console',
   'Set up GSC, submit sitemap.xml, configure indexing.',
   'backlog', 2, 'medium'),
  ((select id from kanban_boards where slug = 'seo'),
   'Local SEO setup',
   'Google Business Profile, local citations, NAP consistency.',
   'backlog', 3, 'medium');

-- Marketing
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'marketing'),
   'Email marketing setup',
   'Choose email platform (Mailchimp/ConvertKit), set up list, design welcome sequence.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'marketing'),
   'Launch promotion strategy',
   'Plan launch discounts, referral program, first-customer incentives.',
   'backlog', 1, 'high'),
  ((select id from kanban_boards where slug = 'marketing'),
   'Influencer outreach list',
   'Research and compile list of wellness/extract influencers for partnerships.',
   'backlog', 2, 'medium');

-- Operations
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'operations'),
   'Supplier and sourcing documentation',
   'Document all extract suppliers, pricing, lead times, quality standards.',
   'backlog', 0, 'high'),
  ((select id from kanban_boards where slug = 'operations'),
   'Order fulfillment SOP',
   'Create standard operating procedure for order processing and shipping.',
   'backlog', 1, 'medium');

-- Compliance & Legal
insert into kanban_tasks (board_id, title, description, column_name, position, priority) values
  ((select id from kanban_boards where slug = 'compliance-legal'),
   'Product labeling compliance review',
   'Ensure all product labels meet FDA/FTC requirements for supplements.',
   'backlog', 0, 'urgent'),
  ((select id from kanban_boards where slug = 'compliance-legal'),
   'Terms of service and privacy policy',
   'Draft and publish ToS and privacy policy for Nored Farms website.',
   'backlog', 1, 'high'),
  ((select id from kanban_boards where slug = 'compliance-legal'),
   'Business license and permits',
   'Verify all required TX business licenses and permits are in order.',
   'backlog', 2, 'high');
