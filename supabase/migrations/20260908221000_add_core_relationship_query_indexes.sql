-- ReachWell: indexes for high-traffic relationship and field-operation queries.

create index if not exists idx_event_participants_event_person on public.event_participants (event_id, person_id);
create index if not exists idx_event_teams_event_team on public.event_teams (event_id, team_id);
create index if not exists idx_team_members_team_user on public.team_members (team_id, user_id);
create index if not exists idx_people_team_memberships_team_person on public.people_team_memberships (team_id, person_id);
create index if not exists idx_assignments_event_status on public.assignments (event_id, status);
create index if not exists idx_assignment_assignees_assignment_user on public.assignment_assignees (assignment_id, user_id);
create index if not exists idx_assignment_objectives_assignment_status on public.assignment_objectives (assignment_id, status);
create index if not exists idx_assignment_activity_assignment_created on public.assignment_activity (assignment_id, created_at desc);
