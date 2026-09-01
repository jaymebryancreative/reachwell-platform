-- ReachWell backend hardening: authorization correctness, relationship history, and field-work indexes.
-- Applied to the live Supabase project before being recorded here.

drop policy if exists assignments_update_authorized on public.assignments;
create policy assignments_update_authorized on public.assignments
for update to authenticated
using (
  has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
  or assigned_user_id = auth.uid()
  or exists (
    select 1 from public.assignment_assignees aa
    where aa.assignment_id = assignments.id
      and aa.user_id = auth.uid()
  )
)
with check (
  has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])
  or assigned_user_id = auth.uid()
  or exists (
    select 1 from public.assignment_assignees aa
    where aa.assignment_id = assignments.id
      and aa.user_id = auth.uid()
  )
);

-- Memberships are historical records; only one active membership may exist at a time.
alter table public.people_team_memberships drop constraint if exists people_team_memberships_person_id_team_id_key;

-- The table already has a unique event/team constraint; remove the redundant duplicate index.
drop index if exists public.event_teams_event_team_uidx;

create index if not exists event_participants_event_attendance_idx
  on public.event_participants (event_id, attendance_status);
create index if not exists event_teams_team_id_idx
  on public.event_teams (team_id);
create index if not exists assignment_assignees_assignment_id_idx
  on public.assignment_assignees (assignment_id);
create index if not exists assignment_notes_author_id_idx
  on public.assignment_notes (author_id);
create index if not exists assignments_event_id_idx
  on public.assignments (event_id);
create index if not exists assignments_organization_id_idx
  on public.assignments (organization_id);
create index if not exists events_created_by_idx
  on public.events (created_by);
create index if not exists event_participants_event_id_idx
  on public.event_participants (event_id);
create index if not exists follow_ups_created_by_idx
  on public.follow_ups (created_by);
create index if not exists follow_ups_completed_by_idx
  on public.follow_ups (completed_by);
create index if not exists needs_created_by_idx
  on public.needs (created_by);
create index if not exists prayer_requests_created_by_idx
  on public.prayer_requests (created_by);
