-- Keep assignment activity tied to the parent assignment organization and optimize history/audit drill-down.
CREATE OR REPLACE FUNCTION public.enforce_assignment_activity_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM public.assignments WHERE id=NEW.assignment_id;
  IF v_org IS NULL OR NEW.organization_id IS DISTINCT FROM v_org THEN RAISE EXCEPTION 'Assignment activity organization does not match assignment'; END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS enforce_assignment_activity_org ON public.assignment_activity;
CREATE TRIGGER enforce_assignment_activity_org BEFORE INSERT OR UPDATE OF assignment_id, organization_id ON public.assignment_activity FOR EACH ROW EXECUTE FUNCTION public.enforce_assignment_activity_org();
REVOKE EXECUTE ON FUNCTION public.enforce_assignment_activity_org() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_assignment_activity_org() TO postgres, service_role;
CREATE INDEX IF NOT EXISTS assignment_activity_org_assignment_created_idx ON public.assignment_activity (organization_id, assignment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS assignment_activity_org_actor_created_idx ON public.assignment_activity (organization_id, actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_org_entity_created_idx ON public.audit_log (organization_id, entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_org_actor_created_idx ON public.audit_log (organization_id, actor_id, created_at DESC);