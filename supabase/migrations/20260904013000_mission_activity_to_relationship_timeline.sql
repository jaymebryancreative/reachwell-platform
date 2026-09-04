create or replace function public.sync_assignment_activity_to_relationship_timeline()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment record;
  v_person_id uuid;
  v_household_id uuid;
  v_title text;
  v_detail text;
  v_status text;
begin
  select a.person_id, a.household_id, a.title, a.status into v_assignment
  from public.assignments a where a.id = new.assignment_id;
  v_person_id := v_assignment.person_id;
  v_household_id := v_assignment.household_id;
  v_title := case new.activity_type
    when 'assignment_created' then 'Assignment created'
    when 'assignment_status_changed' then 'Assignment status changed'
    when 'objective_created' then 'Objective created'
    when 'objective_completed' then 'Objective completed'
    when 'visit_started' then 'Visit started'
    when 'visit_finished' then 'Visit completed'
    when 'note_added' then 'Outreach note added'
    when 'need_recorded' then 'Need recorded'
    when 'prayer_recorded' then 'Prayer request recorded'
    when 'follow_up_created' then 'Follow-up created'
    when 'follow_up_completed' then 'Follow-up completed'
    else replace(new.activity_type, '_', ' ')
  end;
  v_detail := coalesce(new.metadata->>'summary', new.metadata->>'title', v_assignment.title, 'Mission activity recorded');
  v_status := coalesce(new.metadata->>'status', v_assignment.status);
  if v_person_id is null and v_household_id is null then return new; end if;
  insert into public.relationship_timeline (organization_id, person_id, household_id, assignment_id, source_id, activity_kind, title, detail, occurred_at, actor_id, status)
  values (new.organization_id, v_person_id, v_household_id, new.assignment_id, new.id, 'mission', v_title, v_detail, new.created_at, new.actor_id, v_status);
  return new;
end;
$$;

drop trigger if exists assignment_activity_relationship_timeline on public.assignment_activity;
create trigger assignment_activity_relationship_timeline
after insert on public.assignment_activity
for each row execute function public.sync_assignment_activity_to_relationship_timeline();
