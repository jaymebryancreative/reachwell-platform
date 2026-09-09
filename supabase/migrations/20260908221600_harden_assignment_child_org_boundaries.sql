-- ReachWell: keep assignment child records inside their parent assignment organization.

create or replace function public.enforce_assignment_child_org_boundary()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  parent_org uuid;
begin
  if tg_op = 'UPDATE' and old.organization_id is distinct from new.organization_id then
    raise exception 'organization_id cannot be changed';
  end if;

  select a.organization_id into parent_org
  from public.assignments a
  where a.id = new.assignment_id;

  if parent_org is null or parent_org is distinct from new.organization_id then
    raise exception 'Assignment child must belong to the assignment organization';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assignment_notes_org_boundary on public.assignment_notes;
create trigger trg_assignment_notes_org_boundary before insert or update on public.assignment_notes
for each row execute function public.enforce_assignment_child_org_boundary();

drop trigger if exists trg_assignment_objectives_org_boundary on public.assignment_objectives;
create trigger trg_assignment_objectives_org_boundary before insert or update on public.assignment_objectives
for each row execute function public.enforce_assignment_child_org_boundary();

drop trigger if exists trg_assignment_visits_org_boundary on public.assignment_visits;
create trigger trg_assignment_visits_org_boundary before insert or update on public.assignment_visits
for each row execute function public.enforce_assignment_child_org_boundary();

drop trigger if exists trg_assignment_activity_org_boundary on public.assignment_activity;
create trigger trg_assignment_activity_org_boundary before insert or update on public.assignment_activity
for each row execute function public.enforce_assignment_child_org_boundary();
