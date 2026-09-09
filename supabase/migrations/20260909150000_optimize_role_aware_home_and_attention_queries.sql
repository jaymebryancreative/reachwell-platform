-- Optimize role-aware Home queries: upcoming events, open assignments, attention items, and unread notifications.
CREATE INDEX IF NOT EXISTS events_org_status_starts_idx ON public.events (organization_id, status, starts_at);
CREATE INDEX IF NOT EXISTS assignments_org_user_open_idx ON public.assignments (organization_id, assigned_user_id, priority DESC, sequence_number, updated_at DESC) WHERE status NOT IN ('completed','cancelled');
CREATE INDEX IF NOT EXISTS assignments_org_team_open_idx ON public.assignments (organization_id, assigned_team_id, priority DESC, sequence_number, updated_at DESC) WHERE status NOT IN ('completed','cancelled');
CREATE INDEX IF NOT EXISTS follow_ups_org_assignee_open_due_idx ON public.follow_ups (organization_id, assigned_to, due_at, priority DESC) WHERE status NOT IN ('completed','cancelled');
CREATE INDEX IF NOT EXISTS notifications_recipient_unread_created_idx ON public.notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;