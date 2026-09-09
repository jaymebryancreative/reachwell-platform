-- ReachWell: prevent cross-organization relationships in core field operations.

create or replace function public.enforce_core_org_boundaries()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.organization_id is distinct from new.organization_id then
    raise exception 'organization_id cannot be changed';
  end if;

  if tg_table_name = 'assignments' then
    if new.event_id is not null and not exists (
      select 1 from public.events e
      where e.id = new.event_id and e.organization_id = new.organization_id
    ) then raise exception 'Assignment event must belong to the same organization'; end if;
    if new.person_id is not null and not exists (
      select 1 from public.people p
      where p.id = new.person_id and p.organization_id = new.organization_id
    ) then raise exception 'Assignment person must belong to the same organization'; end if;
    if new.household_id is not null and not exists (
      select 1 from public.households h
      where h.id = new.household_id and h.organization_id = new.organization_id
    ) then raise exception 'Assignment household must belong to the same organization'; end if;
    if new.assigned_team_id is not null and not exists (
      select 1 from public.teams t
      where t.id = new.assigned_team_id and t.organization_id = new.organization_id
    ) then raise exception 'Assignment team must belong to the same organization'; end if;
  elsif tg_table_name = 'event_participants' then
    if not exists (
      select 1 from public.events e
      where e.id = new.event_id
        and exists (select 1 from public.people p where p.id = new.person_id and p.organization_id = e.organization_id)
    ) then raise exception 'Event participant person must belong to the event organization'; end if;
    if new.team_id is not null and not exists (
      select 1 from public.events e join public.teams t on t.organization_id = e.organization_id
      where e.id = new.event_id and t.id = new.team_id
    ) then raise exception 'Event participant team must belong to the event organization'; end if;
  elsif tg_table_name = 'event_teams' then
    if not exists (
      select 1 from public.events e join public.teams t on t.organization_id = e.organization_id
      where e.id = new.event_id and t.id = new.team_id
    ) then raise exception 'Event team must belong to the same organization'; end if;
  elsif tg_table_name = 'people_team_memberships' then
    if not exists (
      select 1 from public.people p join public.teams t on t.organization_id = p.organization_id
      where p.id = new.person_id and t.id = new.team_id and p.organization_id = new.organization_id
    ) then raise exception 'Person and team must belong to the same organization'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assignments_org_boundary on public.assignments;
create trigger trg_assignments_org_boundary before insert or update on public.assignments
for each row execute function public.enforce_core_org_boundaries();

drop trigger if exists trg_event_participants_org_boundary on public.event_participants;
create trigger trg_event_participants_org_boundary before insert or update on public.event_participants
for each row execute function public.enforce_core_org_boundaries();

drop trigger if exists trg_event_teams_org_boundary on public.event_teams;
create trigger trg_event_teams_org_boundary before insert or update on public.event_teams
for each row execute function public.enforce_core_org_boundaries();

drop trigger if exists trg_people_team_memberships_org_boundary on public.people_team_memberships;
create trigger trg_people_team_memberships_org_boundary before insert or update on public.people_team_memberships
for each row execute function public.enforce_core_org_boundaries();
