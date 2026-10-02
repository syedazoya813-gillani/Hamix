create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  timezone text default 'Asia/Karachi',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.twin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  available_hours numeric default 5,
  sleep_hours numeric default 7,
  workload_level text default 'medium',
  study_hours numeric default 2,
  work_hours numeric default 0,
  baseline_confidence numeric default 1,
  updated_at timestamptz default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, description text, target_date date, priority text default 'medium', progress numeric default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null, title text not null, description text, status text default 'todo',
  priority text default 'medium', estimated_hours numeric default 1, deadline timestamptz, completed_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, frequency text default 'daily', target numeric default 1, created_at timestamptz default now()
);
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(), habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, date date not null, value numeric default 1, completed boolean default true,
  unique(habit_id,date)
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, start_time timestamptz not null, end_time timestamptz not null, event_type text default 'event', created_at timestamptz default now()
);
create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content text not null, source_type text default 'text', ai_type text, ai_extraction jsonb, confidence numeric, status text default 'pending', created_at timestamptz default now()
);
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, variables jsonb not null default '{}'::jsonb, simulation_result jsonb, assumptions jsonb default '[]'::jsonb, created_at timestamptz default now()
);
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  category text not null, content text not null, source text, confidence numeric default 1, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null, storage_path text not null, mime_type text, size bigint, processing_status text default 'uploaded', extracted_data jsonb,
  created_at timestamptz default now()
);

create index if not exists tasks_user_deadline_idx on public.tasks(user_id,deadline);
create index if not exists inbox_user_created_idx on public.inbox_items(user_id,created_at desc);
create index if not exists events_user_start_idx on public.events(user_id,start_time);

alter table public.profiles enable row level security;
alter table public.twin_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.events enable row level security;
alter table public.inbox_items enable row level security;
alter table public.scenarios enable row level security;
alter table public.memories enable row level security;
alter table public.uploaded_files enable row level security;

create policy "profiles own row" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "twin own row" on public.twin_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals own rows" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks own rows" on public.tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habits own rows" on public.habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habit logs own rows" on public.habit_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "events own rows" on public.events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "inbox own rows" on public.inbox_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "scenarios own rows" on public.scenarios for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "memories own rows" on public.memories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "files own rows" on public.uploaded_files for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name) values(new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing;
  insert into public.twin_profiles(user_id) values(new.id) on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into storage.buckets(id,name,public) values('lifetwin-files','lifetwin-files',false) on conflict (id) do nothing;

create policy "private file objects" on storage.objects for all using (bucket_id = 'lifetwin-files' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'lifetwin-files' and (storage.foldername(name))[1] = auth.uid()::text);
