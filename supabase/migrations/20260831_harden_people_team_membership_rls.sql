-- Harden people/team membership access and preserve organization boundaries.
-- Members can read memberships within their organization.
-- Organization leaders and team leaders can manage memberships within their scope.
-- Inserts/updates must reference people and teams belonging to the same organization.

create policy "people_team_memberships_member_read"
  on public.people_team_memberships
  for select
  to authenticated
  using (is_org_member(organization_id));

create policy "people_team_memberships_manage_scoped"
  on public.people_team_memberships
  for all
  to authenticated
  using (
    has_org_role(organization_id, ARRAY['owner'::text, 'admin'::text, 'director'::text, 'coordinator'::text, 'team_leader'::text])
    or is_team_leader(team_id)
  )
  with check (
    (
      has_org_role(organization_id, ARRAY['owner'::text, 'admin'::text, 'director'::text, 'coordinator'::text, 'team_leader'::text])
      or is_team_leader(team_id)
    )
    and exists (
      select 1
      from public.people p
      where p.id = person_id
        and p.organization_id = people_team_memberships.organization_id
    )
    and exists (
      select 1
      from public.teams t
      where t.id = team_id
        and t.organization_id = people_team_memberships.organization_id
    )
  );
