-- Drop the FK constraint on analytics_events.link_id so it can store
-- both link IDs and social icon IDs as a generic "clicked item" identifier.
-- The column remains nullable (NULL = page view, non-NULL = item click).

ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_link_id_fkey;
