-- Keep Needs, Prayer, and Follow-Ups inside the same organization as their linked relationship records.
CREATE OR REPLACE FUNCTION public.enforce_relationship_record_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_org uuid;
BEGIN
  IF NEW.person_id IS NOT NULL THEN
    SELECT organization_id INTO v_org FROM public.people WHERE id=NEW.person_id;
    IF v_org IS NULL OR NEW.organization_id IS DISTINCT FROM v_org THEN RAISE EXCEPTION 'Person does not belong to organization'; END IF;
  END IF;
  IF NEW.household_id IS NOT NULL THEN
    SELECT organization_id INTO v_org FROM public.households WHERE id=NEW.household_id;
    IF v_org IS NULL OR NEW.organization_id IS DISTINCT FROM v_org THEN RAISE EXCEPTION 'Household does not belong to organization'; END IF;
  END IF;
  IF NEW.assignment_id IS NOT NULL THEN
    SELECT organization_id INTO v_org FROM public.assignments WHERE id=NEW.assignment_id;
    IF v_org IS NULL OR NEW.organization_id IS DISTINCT FROM v_org THEN RAISE EXCEPTION 'Assignment does not belong to organization'; END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS enforce_need_org ON public.needs;
CREATE TRIGGER enforce_need_org BEFORE INSERT OR UPDATE OF organization_id,person_id,household_id,assignment_id ON public.needs FOR EACH ROW EXECUTE FUNCTION public.enforce_relationship_record_org();
DROP TRIGGER IF EXISTS enforce_prayer_request_org ON public.prayer_requests;
CREATE TRIGGER enforce_prayer_request_org BEFORE INSERT OR UPDATE OF organization_id,person_id,household_id,assignment_id ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION public.enforce_relationship_record_org();
DROP TRIGGER IF EXISTS enforce_follow_up_relationship_org ON public.follow_ups;
CREATE TRIGGER enforce_follow_up_relationship_org BEFORE INSERT OR UPDATE OF organization_id,person_id,household_id,assignment_id ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.enforce_relationship_record_org();