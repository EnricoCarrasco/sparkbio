-- Extends get_public_profile to also return subscriptions in grace-period
-- statuses (cancelled, past_due). The app-level isSubscriptionActive helper
-- keeps these users on Pro until their current_period_end or trial_ends_at
-- passes — matches LemonSqueezy's native behavior and standard SaaS UX.
--
-- Without this change, the app can't distinguish "cancelled with 14 days
-- paid time left" from "cancelled long ago" because the RPC would return
-- subscription = null in both cases.

CREATE OR REPLACE FUNCTION public.get_public_profile(p_username text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', row_to_json(p.*),
    'links', (
      SELECT json_agg(l.* ORDER BY l.position ASC)
      FROM public.links l
      WHERE l.user_id = p.id
        AND l.is_active = true
    ),
    'theme', (
      SELECT row_to_json(t.*)
      FROM public.themes t
      WHERE t.user_id = p.id
      LIMIT 1
    ),
    'social_icons', (
      SELECT json_agg(si.* ORDER BY si.position ASC)
      FROM public.social_icons si
      WHERE si.user_id = p.id
        AND si.is_active = true
    ),
    'subscription', (
      SELECT json_build_object(
        'status', s.status,
        'current_period_end', s.current_period_end,
        'trial_ends_at', s.trial_ends_at
      )
      FROM public.subscriptions s
      WHERE s.user_id = p.id
        AND s.status IN ('on_trial', 'active', 'cancelled', 'past_due')
      LIMIT 1
    )
  )
  INTO v_result
  FROM public.profiles p
  WHERE p.username = p_username;

  RETURN v_result;
END;
$function$;
