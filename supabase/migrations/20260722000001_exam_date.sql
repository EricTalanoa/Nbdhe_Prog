-- Optional exam date for the dashboard countdown; set from /settings.
alter table public.profiles add column if not exists exam_date date;
