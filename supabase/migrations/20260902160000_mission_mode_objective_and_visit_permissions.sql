drop policy if exists assignment_objectives_manage on public.assignment_objectives;
create policy assignment_objectives_manage on public.assignment_objectives
for all to authenticated
using (
  has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_objectives.assignment_id
      and (a.assigned_user_id = (select auth.uid()) or exists (
        select 1 from public.assignment_assignees aa
        where aa.assignment_id = a.id and aa.user_id = (select auth.uid())
      ))
  )
)
with check (
  has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_objectives.assignment_id
      and (a.assigned_user_id = (select auth.uid()) or exists (
        select 1 from public.assignment_assignees aa
        where aa.assignment_id = a.id and aa.user_id = (select auth.uid())
      ))
  )
);

drop policy if exists assignment_visits_manage on public.assignment_visits;
create policy assignment_visits_insert on public.assignment_visits
for insert to authenticated
with check (is_org_member(organization_id) and created_by = (select auth.uid()));

create policy assignment_visits_update on public.assignment_visits
for update to authenticated
using (
  created_by = (select auth.uid())
  or has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
)
with check (
  created_by = (select auth.uid())
  or has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
);

create policy assignment_visits_delete on public.assignment_visits
for delete to authenticated
using (
  created_by = (select auth.uid())
  or has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
);
