-- (#13) Stop leaking PayPal email / Pix key / commission rate to anonymous
-- visitors: strip the sensitive columns from the public profile payload.
-- (#20) Include grace-period statuses so a paying customer in past_due/
-- cancelled-but-still-in-period keeps Pro on their public page (the app's
-- isSubscriptionActive still clamps by current_period_end/trial_ends_at).
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
    'profile', (to_jsonb(p) - 'payout_destination' - 'payout_method' - 'commission_bps_override'),
    'links', (
      SELECT json_agg(l.* ORDER BY l.position ASC)
      FROM public.links l
      WHERE l.user_id = p.id AND l.is_active = true
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
      WHERE si.user_id = p.id AND si.is_active = true
    ),
    'subscription', (
      SELECT json_build_object(
        'status', s.status,
        'current_period_end', s.current_period_end,
        'trial_ends_at', s.trial_ends_at
      )
      FROM public.subscriptions s
      WHERE s.user_id = p.id
        AND s.status IN ('on_trial', 'active', 'cancelled', 'past_due', 'paused')
      LIMIT 1
    ),
    'is_complimentary_pro', p.is_complimentary_pro
  )
  INTO v_result
  FROM public.profiles p
  WHERE p.username = p_username;

  RETURN v_result;
END;
$function$;
