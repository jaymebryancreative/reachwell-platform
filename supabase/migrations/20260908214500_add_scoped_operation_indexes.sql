CREATE INDEX IF NOT EXISTS idx_event_participants_event_user_role ON public.event_participants(event_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user_role ON public.team_members(team_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_assignment_assignees_assignment_user ON public.assignment_assignees(assignment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_event_team_status ON public.assignments(event_id, assigned_team_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_user_status ON public.assignments(assigned_user_id, status);
