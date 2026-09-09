-- Internal authorization helpers are used by RLS and SECURITY DEFINER workflows, not by client RPC.
REVOKE EXECUTE ON FUNCTION public.can_manage_assignment(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_event(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_team(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_communication_channel(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_communication_channel(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_assignment(uuid) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_event(uuid) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_team(uuid) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_communication_channel(uuid) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_communication_channel(uuid) TO postgres, service_role;