create or replace function public.accept_organization_invitation(p_token uuid)
returns table(organization_id uuid, team_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.organization_invitations%rowtype;
  current_email text;
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select lower(u.email) into current_email from auth.users u where u.id = uid;
  if current_email is null then raise exception 'Authenticated email is unavailable'; end if;
  select * into inv from public.organization_invitations
  where token = p_token and status = 'pending' and expires_at > now() and lower(email) = current_email
  for update;
  if not found then raise exception 'Invitation is invalid, expired, or does not belong to the signed-in email'; end if;
  if inv.team_id is not null and not exists (select 1 from public.teams t where t.id = inv.team_id and t.organization_id = inv.organization_id) then raise exception 'Invitation team is invalid'; end if;
  insert into public.organization_members(organization_id,user_id,role,status,joined_at)
  values(inv.organization_id,uid,inv.role,'active',now())
  on conflict (organization_id,user_id) do update set role=excluded.role,status='active',joined_at=coalesce(public.organization_members.joined_at,excluded.joined_at),updated_at=now();
  if inv.team_id is not null then
    insert into public.team_members(team_id,user_id,role)
    values(inv.team_id,uid,case when inv.role in ('owner','admin','director') then 'leader' else 'member' end)
    on conflict (team_id,user_id) do update set role=excluded.role,updated_at=now();
  end if;
  update public.organization_invitations set status='accepted',accepted_by=uid,accepted_at=now(),updated_at=now() where id=inv.id;
  return query select inv.organization_id,inv.team_id,inv.role;
end;
$$;
revoke execute on function public.accept_organization_invitation(uuid) from public, anon;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;
