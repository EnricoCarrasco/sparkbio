-- Analytics retention policy: delete events older than 90 days.
-- Uses pg_cron (available on Supabase Pro plans) to run daily at 3 AM UTC.

-- Enable the pg_cron extension if not already enabled
create extension if not exists pg_cron with schema pg_catalog;

-- Schedule daily cleanup at 03:00 UTC
select cron.schedule(
  'analytics-retention-cleanup',
  '0 3 * * *',
  $$DELETE FROM public.analytics_events WHERE created_at < now() - interval '90 days'$$
);

-- Add an index to support the retention query efficiently
create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at);
