DROP TRIGGER IF EXISTS trg_people_team_memberships_org_boundary ON public.people_team_memberships;
CREATE TRIGGER trg_people_team_memberships_org_boundary
BEFORE INSERT OR UPDATE ON public.people_team_memberships
FOR EACH ROW EXECUTE FUNCTION public.enforce_core_org_boundaries();
