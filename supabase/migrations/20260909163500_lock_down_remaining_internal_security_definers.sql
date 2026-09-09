-- Keep privileged role/export/finance helpers off the public RPC surface.
REVOKE EXECUTE ON FUNCTION public.assign_organization_role(uuid,uuid,text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_team_role(uuid,uuid,text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.export_organization_data(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_giving_receipt_issued(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_organization_role(uuid,uuid,text) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.assign_team_role(uuid,uuid,text) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.export_organization_data(uuid) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.mark_giving_receipt_issued(uuid) TO postgres, service_role;