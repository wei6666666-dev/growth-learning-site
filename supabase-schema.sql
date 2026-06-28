-- Growth Supabase Auth + user data schema
-- 在 Supabase Dashboard -> SQL Editor 中执行本文件。

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_tasks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  user_id uuid primary key references auth.users(id) on delete cascade,
  knowledge_favorites jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mastered_knowledge jsonb not null default '[]'::jsonb,
  learning_knowledge jsonb not null default '[]'::jsonb,
  last_check_in text,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_mistakes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mistakes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_videos (
  user_id uuid primary key references auth.users(id) on delete cascade,
  videos jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_tasks enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_mistakes enable row level security;
alter table public.user_videos enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_select_own" on public.user_tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.user_tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.user_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.user_tasks for delete using (auth.uid() = user_id);

create policy "notes_select_own" on public.user_notes for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.user_notes for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.user_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.user_notes for delete using (auth.uid() = user_id);

create policy "favorites_select_own" on public.user_favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.user_favorites for insert with check (auth.uid() = user_id);
create policy "favorites_update_own" on public.user_favorites for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.user_favorites for delete using (auth.uid() = user_id);

create policy "progress_select_own" on public.user_progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.user_progress for delete using (auth.uid() = user_id);

create policy "mistakes_select_own" on public.user_mistakes for select using (auth.uid() = user_id);
create policy "mistakes_insert_own" on public.user_mistakes for insert with check (auth.uid() = user_id);
create policy "mistakes_update_own" on public.user_mistakes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mistakes_delete_own" on public.user_mistakes for delete using (auth.uid() = user_id);

create policy "videos_select_own" on public.user_videos for select using (auth.uid() = user_id);
create policy "videos_insert_own" on public.user_videos for insert with check (auth.uid() = user_id);
create policy "videos_update_own" on public.user_videos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "videos_delete_own" on public.user_videos for delete using (auth.uid() = user_id);
