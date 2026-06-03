-- Pin search_path on trigger functions flagged by the security advisor.
alter function public.prevent_referred_by_change() set search_path = '';
alter function public.update_updated_at_column() set search_path = '';
