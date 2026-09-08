create or replace function public.can_manage_event(target_event uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event
      and (
        public.has_org_role(e.organization_id, array['owner','admin','director','coordinator'])
        or exists (
          select 1 from public.event_participants ep
          where ep.event_id = e.id
            and ep.user_id = auth.uid()
            and ep.role = 'event_lead'
        )
        or exists (
          select 1 from public.event_participants ep
          where ep.event_id = e.id
            and ep.user_id = auth.uid()
            and ep.role = 'team_lead'
        )
      )
  );
$$;

drop policy if exists people_team_memberships_manage_team on public.people_team_memberships;
create policy people_team_memberships_manage_team on public.people_team_memberships
for all to authenticated
using (public.can_manage_team(team_id))
with check (
  public.can_manage_team(team_id)
  and exists (
    select 1 from public.people p
    where p.id = people_team_memberships.person_id
      and p.organization_id = people_team_memberships.organization_id
  )
  and exists (
    select 1 from public.teams t
    where t.id = people_team_memberships.team_id
      and t.organization_id = people_team_memberships.organization_id
  )
);

create index if not exists idx_event_participants_event_role_user on public.event_participants(event_id, role, user_id);
