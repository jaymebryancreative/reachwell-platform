REVOKE EXECUTE ON FUNCTION public.create_organization_invitation(uuid, text, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_organization_invitation(uuid, text, text, uuid, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_assignment_child_org() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_followup_assignment_org() FROM anon, authenticated;
