-- ReachWell: communication search and operations indexes
-- This migration is already applied to the live Supabase project; this file mirrors the deployed schema change.

create index if not exists communication_messages_body_search_idx
  on public.communication_messages
  using gin (to_tsvector('simple', body));

create index if not exists communication_messages_channel_created_idx
  on public.communication_messages (channel_id, created_at desc);

create index if not exists communication_messages_author_idx
  on public.communication_messages (author_id);

create index if not exists communication_channels_org_idx
  on public.communication_channels (organization_id);

create index if not exists communication_channels_team_idx
  on public.communication_channels (team_id);

create index if not exists communication_channels_event_idx
  on public.communication_channels (event_id);

create index if not exists communication_channels_assignment_id_idx
  on public.communication_channels (assignment_id);

create index if not exists assignment_safety_alerts_assignment_idx
  on public.assignment_safety_alerts (assignment_id);

create index if not exists assignment_safety_alerts_org_status_idx
  on public.assignment_safety_alerts (organization_id, status);
