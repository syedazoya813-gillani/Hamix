-- Study hours must come from the user's data, not a hardcoded default.
alter table public.twin_profiles alter column study_hours drop default;

-- Existing rows are intentionally preserved. Users can update their value from Settings.
