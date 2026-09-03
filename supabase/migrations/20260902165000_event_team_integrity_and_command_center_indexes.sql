create unique index if not exists event_teams_event_team_unique_idx on public.event_teams(event_id, team_id);
create index if not exists event_teams_event_idx on public.event_teams(event_id);
create index if not exists event_teams_team_idx on public.event_teams(team_id);
create index if not exists event_participants_event_team_idx on public.event_participants(event_id, team_id);
create index if not exists event_participants_event_person_idx on public.event_participants(event_id, person_id);
