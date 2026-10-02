-- Store the user's preferred daily study time window separately from study duration.
alter table public.twin_profiles add column if not exists study_start_time time;
alter table public.twin_profiles add column if not exists study_end_time time;

-- Do not invent a study window for users who have not provided one.
update public.twin_profiles
set study_start_time = null, study_end_time = null
where study_start_time is null or study_end_time is null;
