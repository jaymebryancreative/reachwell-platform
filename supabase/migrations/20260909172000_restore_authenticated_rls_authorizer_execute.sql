-- RLS authorizers are SECURITY DEFINER helpers used directly by authenticated-role policies.
-- They must remain executable by authenticated clients for PostgREST/Supabase RLS evaluation.
-- They are not intended as application RPCs; anonymous execution remains disabled.

GRANT EXECUTE ON FUNCTION public.can_manage_assignment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_communication_channel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_communication_channel(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.can_manage_assignment(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_event(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_team(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_communication_channel(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_communication_channel(uuid) FROM anon;
