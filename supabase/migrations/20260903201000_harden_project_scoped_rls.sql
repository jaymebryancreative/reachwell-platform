-- Prevent organization membership alone from granting project-wide write authority.
-- Reads remain organization-scoped; writes use project ownership/management helpers.

drop policy if exists projects_access on public.projects;
create policy projects_select_org on public.projects for select to authenticated using (is_org_member(organization_id));
create policy projects_insert_owner on public.projects for insert to authenticated with check (is_org_member(organization_id) and owner_id = auth.uid());

drop policy if exists project_members_access on public.project_members;
create policy project_members_select on public.project_members for select to authenticated using (exists (select 1 from public.projects p where p.id = project_members.project_id and is_org_member(p.organization_id)));
create policy project_members_write on public.project_members for insert to authenticated with check (can_manage_project(project_id));
create policy project_members_update on public.project_members for update to authenticated using (can_manage_project(project_id)) with check (can_manage_project(project_id));
create policy project_members_delete on public.project_members for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_teams_access on public.project_teams;
create policy project_teams_select on public.project_teams for select to authenticated using (exists (select 1 from public.projects p where p.id = project_teams.project_id and is_org_member(p.organization_id)));
create policy project_teams_write on public.project_teams for insert to authenticated with check (can_manage_project(project_id));
create policy project_teams_update on public.project_teams for update to authenticated using (can_manage_project(project_id)) with check (can_manage_project(project_id));
create policy project_teams_delete on public.project_teams for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_channels_access on public.project_channels;
create policy project_channels_select on public.project_channels for select to authenticated using (exists (select 1 from public.projects p where p.id = project_channels.project_id and is_org_member(p.organization_id)));
create policy project_channels_write on public.project_channels for insert to authenticated with check (can_edit_project(project_id));
create policy project_channels_update on public.project_channels for update to authenticated using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_channels_delete on public.project_channels for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_events_access on public.project_events;
create policy project_events_select on public.project_events for select to authenticated using (exists (select 1 from public.projects p where p.id = project_events.project_id and is_org_member(p.organization_id)));
create policy project_events_write on public.project_events for insert to authenticated with check (can_edit_project(project_id));
create policy project_events_update on public.project_events for update to authenticated using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_events_delete on public.project_events for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_goals_access on public.project_goals;
create policy project_goals_select on public.project_goals for select to authenticated using (exists (select 1 from public.projects p where p.id = project_goals.project_id and is_org_member(p.organization_id)));
create policy project_goals_write on public.project_goals for insert to authenticated with check (can_edit_project(project_id));
create policy project_goals_update on public.project_goals for update to authenticated using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_goals_delete on public.project_goals for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_milestones_access on public.project_milestones;
create policy project_milestones_select on public.project_milestones for select to authenticated using (exists (select 1 from public.projects p where p.id = project_milestones.project_id and is_org_member(p.organization_id)));
create policy project_milestones_write on public.project_milestones for insert to authenticated with check (can_edit_project(project_id));
create policy project_milestones_update on public.project_milestones for update to authenticated using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_milestones_delete on public.project_milestones for delete to authenticated using (can_manage_project(project_id));

drop policy if exists project_impact_access on public.project_impact_records;
create policy project_impact_select on public.project_impact_records for select to authenticated using (exists (select 1 from public.projects p where p.id = project_impact_records.project_id and is_org_member(p.organization_id)));
create policy project_impact_write on public.project_impact_records for insert to authenticated with check (can_edit_project(project_id));
create policy project_impact_update on public.project_impact_records for update to authenticated using (can_edit_project(project_id)) with check (can_edit_project(project_id));
create policy project_impact_delete on public.project_impact_records for delete to authenticated using (can_manage_project(project_id));

drop policy if exists tasks_access on public.tasks;
create policy tasks_select_org on public.tasks for select to authenticated using (is_org_member(organization_id));
create policy tasks_insert_scoped on public.tasks for insert to authenticated with check (is_org_member(organization_id) and ((project_id is not null and can_edit_project(project_id)) or (project_id is null and created_by = auth.uid())));

drop policy if exists task_assignees_access on public.task_assignees;
create policy task_assignees_select on public.task_assignees for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_assignees.task_id and is_org_member(t.organization_id)));
create policy task_assignees_write on public.task_assignees for insert to authenticated with check (exists (select 1 from public.tasks t where t.id = task_assignees.task_id and t.project_id is not null and can_edit_project(t.project_id)));
create policy task_assignees_update on public.task_assignees for update to authenticated using (exists (select 1 from public.tasks t where t.id = task_assignees.task_id and t.project_id is not null and can_edit_project(t.project_id))) with check (exists (select 1 from public.tasks t where t.id = task_assignees.task_id and t.project_id is not null and can_edit_project(t.project_id)));
create policy task_assignees_delete on public.task_assignees for delete to authenticated using (exists (select 1 from public.tasks t where t.id = task_assignees.task_id and t.project_id is not null and can_manage_project(t.project_id)));

drop policy if exists task_teams_access on public.task_teams;
create policy task_teams_select on public.task_teams for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_teams.task_id and is_org_member(t.organization_id)));
create policy task_teams_write on public.task_teams for insert to authenticated with check (exists (select 1 from public.tasks t where t.id = task_teams.task_id and t.project_id is not null and can_edit_project(t.project_id)));
create policy task_teams_update on public.task_teams for update to authenticated using (exists (select 1 from public.tasks t where t.id = task_teams.task_id and t.project_id is not null and can_edit_project(t.project_id))) with check (exists (select 1 from public.tasks t where t.id = task_teams.task_id and t.project_id is not null and can_edit_project(t.project_id)));
create policy task_teams_delete on public.task_teams for delete to authenticated using (exists (select 1 from public.tasks t where t.id = task_teams.task_id and t.project_id is not null and can_manage_project(t.project_id)));