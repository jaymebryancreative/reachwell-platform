CREATE OR REPLACE FUNCTION public.create_reachwell_notification(
  p_recipient_id uuid,
  p_organization_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_enabled boolean;
BEGIN
  IF p_recipient_id IS NULL OR p_organization_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = p_organization_id
      AND m.user_id = p_recipient_id
      AND m.status = 'active'
  ) THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(np.in_app_enabled, true)
    INTO v_enabled
  FROM public.notification_preferences np
  WHERE np.user_id = p_recipient_id
    AND np.notification_type = p_type;

  IF coalesce(v_enabled, true) = false THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (
    organization_id,
    recipient_id,
    type,
    title,
    body,
    data
  )
  VALUES (
    p_organization_id,
    p_recipient_id,
    p_type,
    p_title,
    p_body,
    coalesce(p_data, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
