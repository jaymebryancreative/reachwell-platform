ALTER TABLE public.event_participants
  DROP CONSTRAINT IF EXISTS event_participants_role_check;

ALTER TABLE public.event_participants
  ADD CONSTRAINT event_participants_role_check
  CHECK (role = ANY (ARRAY['event_lead','event_coordinator','team_lead','participant','viewer']::text[]));
