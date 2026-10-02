-- LifeTwin recurring university timetable and assistant support
create table if not exists public.class_timetable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  course_code text,
  course_name text not null,
  start_time time not null,
  end_time time not null,
  room text,
  instructor text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (end_time > start_time)
);

create index if not exists class_timetable_user_day_idx on public.class_timetable(user_id, day_of_week, start_time);
alter table public.class_timetable enable row level security;

create policy "class timetable own rows" on public.class_timetable
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
