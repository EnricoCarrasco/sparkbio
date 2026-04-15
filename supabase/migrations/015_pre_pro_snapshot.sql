-- Adds pre_pro_snapshot to themes so free creators can "restore" the last
-- non-Pro state of their profile after experimenting with Pro features.
--
-- The snapshot is set ONCE (when the theme first transitions from all-free
-- fields to having at least one Pro field active) and cleared on restore
-- or upgrade. Storing as JSONB keeps the implementation flexible as more
-- theme fields land without per-column migrations.

alter table public.themes
  add column if not exists pre_pro_snapshot jsonb;

comment on column public.themes.pre_pro_snapshot is
  'Snapshot of the theme fields before the creator first experimented with Pro features. Used to offer a "restore" button that returns them to their last public-ready state. Cleared on upgrade or explicit restore.';
