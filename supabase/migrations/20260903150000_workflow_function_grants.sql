-- ReachWell finish-line: expose only authorization-checked workflow RPCs to signed-in users.
-- Notification creation is intentionally not granted to clients; it is an internal helper used by trusted database automation.

grant execute on function public.bootstrap_organization_owner(text, text) to authenticated;
grant execute on function public.assign_organization_role(uuid, uuid, text) to authenticated;
grant execute on function public.assign_team_role(uuid, uuid, text) to authenticated;
grant execute on function public.create_organization_invitation(uuid, text, text, uuid) to authenticated;
grant execute on function public.complete_assignment_and_get_next(uuid, text) to authenticated;

revoke execute on function public.create_reachwell_notification(uuid, uuid, text, text, text, jsonb) from anon, authenticated;
