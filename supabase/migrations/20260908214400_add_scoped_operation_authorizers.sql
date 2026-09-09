CREATE OR REPLACE FUNCTION public.can_manage_event(target_event uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = target_event
      AND (
        public.has_org_role(e.organization_id, ARRAY['owner','admin','director','coordinator'])
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep
          WHERE ep.event_id = e.id
            AND ep.user_id = auth.uid()
            AND ep.role IN ('event_lead','event_coordinator','leader','coordinator')
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_team(target_team uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = target_team
      AND (
        public.has_org_role(t.organization_id, ARRAY['owner','admin','director','coordinator'])
        OR public.is_team_leader(t.id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_assignment(target_assignment uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.id = target_assignment
      AND (
        public.has_org_role(a.organization_id, ARRAY['owner','admin','director','coordinator'])
        OR a.assigned_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.assignment_assignees aa
          WHERE aa.assignment_id = a.id AND aa.user_id = auth.uid()
        )
        OR (a.assigned_team_id IS NOT NULL AND public.is_team_leader(a.assigned_team_id))
        OR (a.event_id IS NOT NULL AND public.can_manage_event(a.event_id))
      )
  );
$$;
