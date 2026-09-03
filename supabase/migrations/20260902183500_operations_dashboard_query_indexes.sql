create index if not exists assignments_org_status_priority_sequence_idx on public.assignments(organization_id, status, priority desc, sequence_number asc, updated_at desc);
create index if not exists assignments_org_team_status_priority_idx on public.assignments(organization_id, assigned_team_id, status, priority desc, updated_at desc);
create index if not exists assignments_org_user_status_priority_idx on public.assignments(organization_id, assigned_user_id, status, priority desc, updated_at desc);
create index if not exists follow_ups_org_status_due_priority_idx on public.follow_ups(organization_id, status, due_at asc, priority desc);
create index if not exists needs_org_status_urgency_updated_idx on public.needs(organization_id, status, urgency, updated_at desc);
create index if not exists prayer_requests_org_status_updated_idx on public.prayer_requests(organization_id, status, updated_at desc);
create index if not exists event_participants_event_status_team_idx on public.event_participants(event_id, attendance_status, team_id);
