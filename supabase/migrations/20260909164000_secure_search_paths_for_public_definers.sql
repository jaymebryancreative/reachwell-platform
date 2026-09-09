ALTER FUNCTION public.accept_organization_invitation(uuid) SET search_path = public;
ALTER FUNCTION public.bootstrap_organization_owner(text,text) SET search_path = public;
ALTER FUNCTION public.complete_assignment_and_get_next(uuid,text) SET search_path = public;
ALTER FUNCTION public.create_organization_invitation(uuid,text,text,uuid) SET search_path = public;
ALTER FUNCTION public.create_organization_invitation(uuid,text,text,uuid,timestamptz) SET search_path = public;
ALTER FUNCTION public.current_organization_membership() SET search_path = public;