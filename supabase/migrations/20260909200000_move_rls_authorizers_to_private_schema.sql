create schema if not exists private;

create or replace function private.can_access_communication_channel(target_channel uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.communication_channels c where c.id = target_channel and public.is_org_member(c.organization_id) and (c.is_private = false or exists (select 1 from public.communication_channel_members cm where cm.channel_id = c.id and cm.user_id = auth.uid()) or public.has_org_role(c.organization_id, array['owner','admin'])));
$$;
create or replace function private.can_manage_communication_channel(target_channel uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.communication_channels c where c.id = target_channel and (public.has_org_role(c.organization_id, array['owner','admin']) or c.created_by = auth.uid() or exists (select 1 from public.communication_channel_members cm where cm.channel_id = c.id and cm.user_id = auth.uid() and cm.member_role = 'manager')));
$$;
create or replace function private.can_manage_event(target_event uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.events e where e.id = target_event and (public.has_org_role(e.organization_id, array['owner','admin','director','coordinator']) or exists (select 1 from public.event_participants ep where ep.event_id = e.id and ep.user_id = auth.uid() and ep.role in ('event_lead','event_coordinator','team_lead','leader','coordinator'))));
$$;
create or replace function private.can_manage_team(target_team uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.teams t where t.id = target_team and (public.has_org_role(t.organization_id, array['owner','admin','director','coordinator']) or public.is_team_leader(t.id)));
$$;
create or replace function private.can_manage_assignment(target_assignment uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.assignments a where a.id = target_assignment and (public.has_org_role(a.organization_id, array['owner','admin','director','coordinator']) or a.assigned_user_id = auth.uid() or exists (select 1 from public.assignment_assignees aa where aa.assignment_id = a.id and aa.user_id = auth.uid()) or (a.assigned_team_id is not null and public.is_team_leader(a.assigned_team_id)) or (a.event_id is not null and private.can_manage_event(a.event_id))));
$$;

revoke execute on function private.can_access_communication_channel(uuid), private.can_manage_communication_channel(uuid), private.can_manage_event(uuid), private.can_manage_team(uuid), private.can_manage_assignment(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_access_communication_channel(uuid), private.can_manage_communication_channel(uuid), private.can_manage_event(uuid), private.can_manage_team(uuid), private.can_manage_assignment(uuid) to authenticated;

DO $$
declare r record; q text; w text;
begin
  for r in select schemaname, tablename, policyname, qual, with_check from pg_policies where schemaname='public' and (position('can_access_communication_channel(' in coalesce(qual,'') ) > 0 or position('can_manage_communication_channel(' in coalesce(qual,'') ) > 0 or position('can_manage_assignment(' in coalesce(qual,'') ) > 0 or position('can_manage_event(' in coalesce(qual,'') ) > 0 or position('can_manage_team(' in coalesce(qual,'') ) > 0 or position('can_access_communication_channel(' in coalesce(with_check,'') ) > 0 or position('can_manage_communication_channel(' in coalesce(with_check,'') ) > 0 or position('can_manage_assignment(' in coalesce(with_check,'') ) > 0 or position('can_manage_event(' in coalesce(with_check,'') ) > 0 or position('can_manage_team(' in coalesce(with_check,'') ) > 0) loop
    q := r.qual; w := r.with_check;
    if q is not null then
      q := replace(q, 'can_access_communication_channel(', 'private.can_access_communication_channel(');
      q := replace(q, 'can_manage_communication_channel(', 'private.can_manage_communication_channel(');
      q := replace(q, 'can_manage_assignment(', 'private.can_manage_assignment(');
      q := replace(q, 'can_manage_event(', 'private.can_manage_event(');
      q := replace(q, 'can_manage_team(', 'private.can_manage_team(');
    end if;
    if w is not null then
      w := replace(w, 'can_access_communication_channel(', 'private.can_access_communication_channel(');
      w := replace(w, 'can_manage_communication_channel(', 'private.can_manage_communication_channel(');
      w := replace(w, 'can_manage_assignment(', 'private.can_manage_assignment(');
      w := replace(w, 'can_manage_event(', 'private.can_manage_event(');
      w := replace(w, 'can_manage_team(', 'private.can_manage_team(');
    end if;
    if q is not null and w is not null then execute format('alter policy %I on %I.%I using (%s) with check (%s)', r.policyname, r.schemaname, r.tablename, q, w);
    elsif q is not null then execute format('alter policy %I on %I.%I using (%s)', r.policyname, r.schemaname, r.tablename, q);
    elsif w is not null then execute format('alter policy %I on %I.%I with check (%s)', r.policyname, r.schemaname, r.tablename, w);
    end if;
  end loop;
end $$;

DROP FUNCTION public.can_access_communication_channel(uuid);
DROP FUNCTION public.can_manage_communication_channel(uuid);
DROP FUNCTION public.can_manage_event(uuid);
DROP FUNCTION public.can_manage_team(uuid);
DROP FUNCTION public.can_manage_assignment(uuid);
