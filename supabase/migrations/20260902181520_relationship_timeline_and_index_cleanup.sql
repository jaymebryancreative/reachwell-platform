drop index if exists public.event_teams_team_idx;
drop index if exists public.event_teams_event_team_unique_idx;

create or replace view public.relationship_timeline
with (security_invoker = true) as
select
  a.organization_id,
  a.person_id,
  a.household_id,
  a.id as assignment_id,
  a.id as source_id,
  'assignment'::text as activity_kind,
  a.title,
  coalesce(a.address_label, 'Field assignment') as detail,
  coalesce(a.updated_at, a.created_at) as occurred_at,
  a.assigned_user_id as actor_id,
  a.status
from public.assignments a
union all
select
  n.organization_id,
  n.person_id,
  n.household_id,
  n.assignment_id,
  n.id,
  'need'::text,
  n.title,
  n.description,
  n.created_at,
  n.created_by,
  n.status
from public.needs n
union all
select
  p.organization_id,
  p.person_id,
  p.household_id,
  p.assignment_id,
  p.id,
  'prayer'::text,
  'Prayer request'::text,
  p.request_text,
  p.created_at,
  p.created_by,
  p.status
from public.prayer_requests p
union all
select
  f.organization_id,
  f.person_id,
  f.household_id,
  f.assignment_id,
  f.id,
  'follow_up'::text,
  f.title,
  f.description,
  f.created_at,
  f.created_by,
  f.status
from public.follow_ups f
union all
select
  v.organization_id,
  v.person_id,
  v.household_id,
  v.assignment_id,
  v.id,
  'visit'::text,
  coalesce(v.outcome, 'Visit') as title,
  v.summary,
  v.started_at,
  v.created_by,
  case when v.ended_at is null then 'in_progress' else 'completed' end
from public.assignment_visits v
union all
select
  an.organization_id,
  a.person_id,
  a.household_id,
  an.assignment_id,
  an.id,
  'note'::text,
  'Field note'::text,
  an.body,
  an.created_at,
  an.author_id,
  case when an.is_current then 'current' else 'archived' end
from public.assignment_notes an
join public.assignments a on a.id = an.assignment_id;

comment on view public.relationship_timeline is 'Organization-scoped connected operational timeline for people and households; security_invoker preserves source-table RLS.';
