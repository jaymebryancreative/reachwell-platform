REVOKE EXECUTE ON FUNCTION public.create_organization_invitation(uuid, text, text, uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization_invitation(uuid, text, text, uuid, timestamptz) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_assignment_child_org() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_followup_assignment_org() FROM PUBLIC;
