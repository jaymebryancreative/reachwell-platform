create unique index if not exists assignment_visits_one_active_idx on public.assignment_visits(assignment_id) where ended_at is null;

create or replace function public.sync_assignment_from_visit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.assignments
    set status = case when status = 'pending' then 'in_progress' else status end,
        started_at = coalesce(started_at, new.started_at),
        updated_at = now()
    where id = new.assignment_id;
    return new;
  end if;

  if tg_op = 'UPDATE' and old.ended_at is null and new.ended_at is not null then
    update public.assignments
    set updated_at = now()
    where id = new.assignment_id;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists assignment_visits_sync_assignment on public.assignment_visits;
create trigger assignment_visits_sync_assignment
after insert or update of ended_at on public.assignment_visits
for each row execute function public.sync_assignment_from_visit();
