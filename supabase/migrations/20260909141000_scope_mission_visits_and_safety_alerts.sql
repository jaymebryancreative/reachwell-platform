CREATE OR REPLACE FUNCTION public.enforce_assignment_safety_alert_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM public.assignments WHERE id=NEW.assignment_id;
  IF v_org IS NULL OR NEW.organization_id IS DISTINCT FROM v_org THEN
    RAISE EXCEPTION 'Safety alert organization does not match assignment';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS enforce_assignment_safety_alert_org ON public.assignment_safety_alerts;
CREATE TRIGGER enforce_assignment_safety_alert_org BEFORE INSERT OR UPDATE OF assignment_id, organization_id ON public.assignment_safety_alerts FOR EACH ROW EXECUTE FUNCTION public.enforce_assignment_safety_alert_org();
DROP POLICY IF EXISTS assignment_safety_alerts_create ON public.assignment_safety_alerts;
CREATE POLICY assignment_safety_alerts_create ON public.assignment_safety_alerts FOR INSERT TO authenticated WITH CHECK (reporter_id=auth.uid() AND can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_safety_alerts_read ON public.assignment_safety_alerts;
CREATE POLICY assignment_safety_alerts_read ON public.assignment_safety_alerts FOR SELECT TO authenticated USING (can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_safety_alerts_update ON public.assignment_safety_alerts;
CREATE POLICY assignment_safety_alerts_update ON public.assignment_safety_alerts FOR UPDATE TO authenticated USING (can_manage_assignment(assignment_id)) WITH CHECK (can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_visits_insert ON public.assignment_visits;
CREATE POLICY assignment_visits_insert ON public.assignment_visits FOR INSERT TO authenticated WITH CHECK (created_by=auth.uid() AND can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_visits_read ON public.assignment_visits;
CREATE POLICY assignment_visits_read ON public.assignment_visits FOR SELECT TO authenticated USING (can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_visits_update ON public.assignment_visits;
CREATE POLICY assignment_visits_update ON public.assignment_visits FOR UPDATE TO authenticated USING (created_by=auth.uid() OR can_manage_assignment(assignment_id)) WITH CHECK (created_by=auth.uid() OR can_manage_assignment(assignment_id));
DROP POLICY IF EXISTS assignment_visits_delete ON public.assignment_visits;
CREATE POLICY assignment_visits_delete ON public.assignment_visits FOR DELETE TO authenticated USING (created_by=auth.uid() OR can_manage_assignment(assignment_id));
REVOKE EXECUTE ON FUNCTION public.enforce_assignment_safety_alert_org() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_assignment_safety_alert_org() TO postgres, service_role;