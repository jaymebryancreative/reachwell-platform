-- ReachWell: optimize newly added RLS policies and remove redundant indexes.
-- Safe, additive hardening; no production data is removed.

DROP POLICY IF EXISTS organization_preferences_read ON public.organization_preferences;
CREATE POLICY organization_preferences_read ON public.organization_preferences
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.organization_members om
  WHERE om.organization_id=organization_preferences.organization_id
    AND om.user_id=(SELECT auth.uid())
    AND om.status='active'
));

DROP POLICY IF EXISTS organization_preferences_manage ON public.organization_preferences;
CREATE POLICY organization_preferences_manage ON public.organization_preferences
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.organization_members om
  WHERE om.organization_id=organization_preferences.organization_id
    AND om.user_id=(SELECT auth.uid())
    AND om.status='active'
    AND om.role IN ('owner','admin','director')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.organization_members om
  WHERE om.organization_id=organization_preferences.organization_id
    AND om.user_id=(SELECT auth.uid())
    AND om.status='active'
    AND om.role IN ('owner','admin','director')
));

DROP POLICY IF EXISTS assignment_visits_insert ON public.assignment_visits;
CREATE POLICY assignment_visits_insert ON public.assignment_visits
FOR INSERT TO authenticated
WITH CHECK ((created_by=(SELECT auth.uid())) AND can_manage_assignment(assignment_id));

DROP POLICY IF EXISTS assignment_visits_delete ON public.assignment_visits;
CREATE POLICY assignment_visits_delete ON public.assignment_visits
FOR DELETE TO authenticated
USING ((created_by=(SELECT auth.uid())) OR can_manage_assignment(assignment_id));

DROP POLICY IF EXISTS assignment_visits_update ON public.assignment_visits;
CREATE POLICY assignment_visits_update ON public.assignment_visits
FOR UPDATE TO authenticated
USING ((created_by=(SELECT auth.uid())) OR can_manage_assignment(assignment_id))
WITH CHECK ((created_by=(SELECT auth.uid())) OR can_manage_assignment(assignment_id));

DROP POLICY IF EXISTS assignment_safety_alerts_create ON public.assignment_safety_alerts;
CREATE POLICY assignment_safety_alerts_create ON public.assignment_safety_alerts
FOR INSERT TO authenticated
WITH CHECK ((reporter_id=(SELECT auth.uid())) AND can_manage_assignment(assignment_id));

DROP INDEX IF EXISTS public.audit_log_entity_idx;
DROP INDEX IF EXISTS public.notifications_recipient_unread_idx;
