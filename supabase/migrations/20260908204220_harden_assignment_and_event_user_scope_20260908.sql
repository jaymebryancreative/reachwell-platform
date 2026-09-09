CREATE OR REPLACE FUNCTION public.enforce_core_org_boundaries()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'UPDATE' AND old.organization_id IS DISTINCT FROM new.organization_id THEN
    RAISE EXCEPTION 'organization_id cannot be changed';
  END IF;

  IF tg_table_name = 'assignments' THEN
    IF new.event_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = new.event_id AND e.organization_id = new.organization_id
    ) THEN
      RAISE EXCEPTION 'Assignment event must belong to the same organization';
    END IF;
    IF new.person_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = new.person_id AND p.organization_id = new.organization_id
    ) THEN
      RAISE EXCEPTION 'Assignment person must belong to the same organization';
    END IF;
    IF new.household_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = new.household_id AND h.organization_id = new.organization_id
    ) THEN
      RAISE EXCEPTION 'Assignment household must belong to the same organization';
    END IF;
    IF new.assigned_team_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = new.assigned_team_id AND t.organization_id = new.organization_id
    ) THEN
      RAISE EXCEPTION 'Assignment team must belong to the same organization';
    END IF;
    IF new.assigned_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = new.assigned_user_id
        AND om.organization_id = new.organization_id
        AND om.status = 'active'
    ) THEN
      RAISE EXCEPTION 'Assignment user must belong to the same organization';
    END IF;

  ELSIF tg_table_name = 'event_participants' THEN
    IF new.person_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.people p ON p.organization_id = e.organization_id
      WHERE e.id = new.event_id AND p.id = new.person_id
    ) THEN
      RAISE EXCEPTION 'Event participant person must belong to the event organization';
    END IF;
    IF new.user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.organization_members om ON om.organization_id = e.organization_id
      WHERE e.id = new.event_id
        AND om.user_id = new.user_id
        AND om.status = 'active'
    ) THEN
      RAISE EXCEPTION 'Event participant user must belong to the event organization';
    END IF;
    IF new.team_id IS NOT NULL AND NOT EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.teams t ON t.organization_id = e.organization_id
      WHERE e.id = new.event_id AND t.id = new.team_id
    ) THEN
      RAISE EXCEPTION 'Event participant team must belong to the event organization';
    END IF;

  ELSIF tg_table_name = 'event_teams' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.teams t ON t.organization_id = e.organization_id
      WHERE e.id = new.event_id AND t.id = new.team_id
    ) THEN
      RAISE EXCEPTION 'Event team must belong to the same organization';
    END IF;

  ELSIF tg_table_name = 'people_team_memberships' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.people p
      JOIN public.teams t ON t.organization_id = p.organization_id
      WHERE p.id = new.person_id
        AND t.id = new.team_id
        AND p.organization_id = new.organization_id
    ) THEN
      RAISE EXCEPTION 'Person and team must belong to the same organization';
    END IF;
  END IF;

  RETURN new;
END;
$$;
