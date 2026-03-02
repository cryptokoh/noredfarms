-- ============================================================
-- Nored Farms - Course Platform Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    display_name text,
    tier_level integer not null default 0 check (tier_level between 0 and 4),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- 2. COURSES
create table if not exists public.courses (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    description text,
    min_tier integer not null default 1 check (min_tier between 1 and 4),
    lesson_count integer not null default 0,
    is_published boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Anyone reads published courses"
    on public.courses for select
    using (is_published = true);

-- 3. LESSONS
create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    slug text not null,
    title text not null,
    section_number integer not null default 1,
    sort_order integer not null default 1,
    content_html text,
    summary text,
    estimated_minutes integer not null default 15,
    is_free_preview boolean not null default false,
    created_at timestamptz not null default now(),
    unique(course_id, slug)
);

alter table public.lessons enable row level security;

create policy "Anyone reads free preview lessons"
    on public.lessons for select
    using (is_free_preview = true);

create policy "Enrolled users read their course lessons"
    on public.lessons for select
    using (
        exists (
            select 1 from public.enrollments e
            where e.user_id = auth.uid()
              and e.course_id = lessons.course_id
              and e.is_active = true
        )
    );

-- 4. ENROLLMENTS
create table if not exists public.enrollments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    tier_level integer not null default 1,
    stripe_session_id text,
    enrolled_at timestamptz not null default now(),
    is_active boolean not null default true,
    unique(user_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Users read own enrollments"
    on public.enrollments for select
    using (auth.uid() = user_id);

-- 5. LESSON PROGRESS
create table if not exists public.lesson_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    is_completed boolean not null default false,
    completed_at timestamptz,
    last_accessed_at timestamptz not null default now(),
    scroll_position real not null default 0,
    unique(user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Users read own progress"
    on public.lesson_progress for select
    using (auth.uid() = user_id);

create policy "Users insert own progress"
    on public.lesson_progress for insert
    with check (auth.uid() = user_id);

create policy "Users update own progress"
    on public.lesson_progress for update
    using (auth.uid() = user_id);

-- 6. CERTIFICATES
create table if not exists public.certificates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    certificate_number text not null unique,
    issued_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "Users read own certificates"
    on public.certificates for select
    using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================
-- VIEW: course_progress (computed progress per user per course)
-- ============================================================
create or replace view public.course_progress as
select
    e.user_id,
    e.course_id,
    c.slug as course_slug,
    c.title as course_title,
    c.lesson_count,
    count(lp.id) filter (where lp.is_completed = true) as completed_lessons,
    case
        when c.lesson_count = 0 then 0
        else round(
            (count(lp.id) filter (where lp.is_completed = true)::numeric / c.lesson_count) * 100
        )
    end as progress_percent,
    max(lp.last_accessed_at) as last_accessed_at,
    e.enrolled_at,
    e.tier_level
from public.enrollments e
join public.courses c on c.id = e.course_id
left join public.lesson_progress lp
    on lp.user_id = e.user_id
    and lp.course_id = e.course_id
where e.is_active = true
group by e.user_id, e.course_id, c.slug, c.title, c.lesson_count, e.enrolled_at, e.tier_level;

-- ============================================================
-- SEED: Dandelion Extraction course
-- ============================================================
insert into public.courses (slug, title, description, min_tier, lesson_count, is_published)
values (
    'dandelion-extraction',
    'Dandelion Extraction: From Root to Remedy',
    'A comprehensive guide to selecting, growing, harvesting, drying, and extracting dandelion. Learn water, oil, alcohol, and vinegar extraction methods with yield optimization.',
    1,
    6,
    true
)
on conflict (slug) do nothing;

-- Seed 6 lessons (content_html will be inserted separately via dashboard or update statements)
do $$
declare
    v_course_id uuid;
begin
    select id into v_course_id from public.courses where slug = 'dandelion-extraction';

    -- Lesson 1: Introduction (free preview)
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'introduction-dandelion', 'Introduction to Dandelion as Medicine', 1, 1,
        'Overview of dandelion as a medicinal plant, course objectives, and what you will learn.',
        10, true)
    on conflict (course_id, slug) do nothing;

    -- Lesson 2: Selecting, Growing & Harvesting
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'selecting-growing-harvesting', 'Selecting, Growing & Harvesting', 1, 2,
        'Species identification, soil preparation, growing methods, companion planting, harvest timing and techniques, parts selection, and sustainable practices.',
        25, false)
    on conflict (course_id, slug) do nothing;

    -- Lesson 3: Drying & Stabilization
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'drying-stabilization', 'Drying & Stabilization Methods', 2, 3,
        'Air drying, dehydrator methods, oven drying, moisture testing, and proper storage techniques.',
        20, false)
    on conflict (course_id, slug) do nothing;

    -- Lesson 4: Water & Oil Extractions
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'water-oil-extractions', 'Water & Oil Extraction Methods', 3, 4,
        'Decoctions, infusions, hot and cold oil infusion methods, and glycerin-based extraction.',
        25, false)
    on conflict (course_id, slug) do nothing;

    -- Lesson 5: Alcohol & Vinegar Extractions
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'alcohol-vinegar-extractions', 'Alcohol & Vinegar Extractions', 3, 5,
        'Tinctures, menstruum ratios, vinegar extraction, filtering, and bottling methods.',
        25, false)
    on conflict (course_id, slug) do nothing;

    -- Lesson 6: Yields, Potency & Applications
    insert into public.lessons (course_id, slug, title, section_number, sort_order, summary, estimated_minutes, is_free_preview)
    values (v_course_id, 'yields-potency-applications', 'Yields, Potency & Applications', 3, 6,
        'Expected yields, potency testing, storage best practices, dosing guidelines, and combining extracts.',
        20, false)
    on conflict (course_id, slug) do nothing;
end $$;
