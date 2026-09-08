begin;

-- Replace legacy global team_leader write access with resource-scoped authorization.
drop policy if exists assignments_manage_staff on public.assignments;
drop policy if exists assignments_update_authorized on public.assignments;

create policy assignments_insert_scoped on public.assignments
for insert to authenticated
with check (
  public.has_org_role(organization_id, array['owner','admin','director','coordinator'])
  or (event_id is not null and public.can_manage_event(event_id))
  or (assigned_team_id is not null and public.can_manage_team(assigned_team_id))
);

create policy assignments_update_scoped on public.assignments
for update to authenticated
using (public.can_manage_assignment(id))
with check (public.can_manage_assignment(id));

-- Event roster/attendance management is event-scoped.
drop policy if exists event_participants_manage_staff on public.event_participants;
create policy event_participants_manage_scoped on public.event_participants
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

-- Event/team association management is event-scoped.
drop policy if exists event_teams_manage_staff on public.event_teams;
create policy event_teams_manage_scoped on public.event_teams
for all to authenticated
using (public.can_manage_event(event_id))
with check (public.can_manage_event(event_id));

-- Team membership management is team-scoped.
drop policy if exists team_members_manage_leadership on public.team_members;
create policy team_members_manage_scoped on public.team_members
for all to authenticated
using (public.can_manage_team(team_id))
with check (public.can_manage_team(team_id));

-- Person/team relationship management follows the same team scope.
drop policy if exists people_team_memberships_manage_scoped on public.people_team_memberships;
create policy people_team_memberships_manage_team on public.people_team_memberships
for all to authenticated
using (public.can_manage_team(team_id))
with check (
  public.can_manage_team(team_id)
  and exists (
    select 1 from public.people p
    where p.id = person_id
      and p.organization_id = organization_id
  )
  and exists (
    select 1 from public.teams t
    where t.id = team_id
      and t.organization_id = organization_id
  )
);

commit;
