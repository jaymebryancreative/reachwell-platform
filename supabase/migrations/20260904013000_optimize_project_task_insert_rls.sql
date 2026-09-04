-- ReachWell performance hardening: evaluate auth.uid() once per statement in insert RLS policies.

drop policy if exists projects_insert_owner on public.projects;
create policy projects_insert_owner on public.projects
for insert to authenticated
with check (is_org_member(organization_id) and owner_id = (select auth.uid()));

drop policy if exists tasks_insert_scoped on public.tasks;
create policy tasks_insert_scoped on public.tasks
for insert to authenticated
with check (
  is_org_member(organization_id)
  and (
    (project_id is not null and can_edit_project(project_id))
    or (project_id is null and created_by = (select auth.uid()))
  )
);
