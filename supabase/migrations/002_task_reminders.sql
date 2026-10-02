-- LifeTwin task editing, progress tracking, and reminders
alter table public.tasks add column if not exists progress numeric default 0;
alter table public.tasks add column if not exists reminder_at timestamptz;
alter table public.tasks add column if not exists category text;
alter table public.tasks add column if not exists actual_hours numeric default 0;
create index if not exists tasks_user_reminder_idx on public.tasks(user_id, reminder_at);
