-- ReachWell security hardening: this function is a trigger implementation, not an API operation.
-- It must not be callable through the PostgREST RPC surface.
revoke execute on function public.sync_relationship_timeline_from_activity() from public;
revoke execute on function public.sync_relationship_timeline_from_activity() from anon, authenticated;
