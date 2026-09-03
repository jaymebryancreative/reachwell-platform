revoke execute on function public.record_assignment_activity() from public, anon, authenticated;

create index if not exists assignment_objectives_completed_by_idx on public.assignment_objectives (completed_by);
create index if not exists assignment_objectives_created_by_idx on public.assignment_objectives (created_by);
create index if not exists assignment_visits_created_by_idx on public.assignment_visits (created_by);
create index if not exists assignment_visits_household_id_idx on public.assignment_visits (household_id);
create index if not exists assignment_visits_person_id_idx on public.assignment_visits (person_id);
