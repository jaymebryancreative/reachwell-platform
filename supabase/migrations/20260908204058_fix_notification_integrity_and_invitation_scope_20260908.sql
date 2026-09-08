CREATE OR REPLACE FUNCTION public.notify_communication_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  channel_record public.communication_channels%ROWTYPE;
  recipient record;
BEGIN
  SELECT * INTO channel_record
  FROM public.communication_channels
  WHERE id = NEW.channel_id;

  IF channel_record.id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR recipient IN
    SELECT DISTINCT cm.user_id
    FROM public.communication_channel_members cm
    WHERE cm.channel_id = NEW.channel_id
      AND cm.user_id IS NOT NULL
      AND cm.user_id <> NEW.sender_id
  LOOP
    PERFORM public.create_reachwell_notification(
      recipient.user_id,
      channel_record.organization_id,
      'communication_message',
      'New message in ' || COALESCE(channel_record.name, 'conversation'),
      LEFT(COALESCE(NEW.body, ''), 180),
      '/communication/' || NEW.channel_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role text DEFAULT 'member'::text,
  p_team_id uuid DEFAULT NULL::uuid,
  p_expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval)
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_token uuid := gen_random_uuid();
  v_team_org uuid;
  v_email text := lower(trim(p_email));
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT om.role::text
    INTO v_actor_role
  FROM public.organization_members om
  WHERE om.organization_id = p_organization_id
    AND om.user_id = v_actor
    AND om.status = 'active'
  LIMIT 1;

  IF v_actor_role IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_actor_role NOT IN ('owner','admin','director','coordinator') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_role IS NULL OR p_role NOT IN ('member','admin','director','coordinator') THEN
    RAISE EXCEPTION 'Invalid organization role';
  END IF;

  IF v_actor_role <> 'owner' AND p_role IN ('owner','admin') THEN
    RAISE EXCEPTION 'Insufficient authority to invite this role';
  END IF;

  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) < 2 OR position('.' in split_part(v_email, '@', 2)) = 0 THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  IF p_expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation expiration must be in the future';
  END IF;

  IF p_team_id IS NOT NULL THEN
    SELECT t.organization_id INTO v_team_org
    FROM public.teams t
    WHERE t.id = p_team_id;

    IF v_team_org IS NULL OR v_team_org <> p_organization_id THEN
      RAISE EXCEPTION 'Team does not belong to organization';
    END IF;
  END IF;

  INSERT INTO public.organization_invitations (
    organization_id,
    email,
    role,
    team_id,
    token,
    expires_at,
    invited_by
  )
  VALUES (
    p_organization_id,
    v_email,
    p_role,
    p_team_id,
    v_token,
    p_expires_at,
    v_actor
  );

  RETURN v_token;
END;
$$;
