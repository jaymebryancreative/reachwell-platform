-- Keep connected relationship history synchronized with durable field activity.
-- The trigger is organization-scoped through the source assignment and uses the
-- existing assignment_activity record as the timeline source id.

create or replace function public.sync_relationship_timeline_from_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid;
  v_household_id uuid;
  v_title text;
  v_detail text;
begin
  select a.person_id, a.household_id
    into v_person_id, v_household_id
  from public.assignments a
  where a.id = new.assignment_id
    and a.organization_id = new.organization_id;

  v_title := case new.activity_type
    when 'assignment_created' then coalesce(new.metadata->>'title', 'Assignment created')
    when 'assignment_status_changed' then 'Assignment status changed'
    when 'assignment_updated' then 'Assignment updated'
    when 'objective_created' then coalesce(new.metadata->>'title', 'Objective created')
    when 'objective_completed' then coalesce(new.metadata->>'title', 'Objective completed')
    when 'visit_started' then 'Visit started'
    when 'visit_finished' then 'Visit completed'
    when 'note_added' then 'Note added'
    when 'need_recorded' then coalesce(new.metadata->>'title', 'Need recorded')
    when 'prayer_recorded' then 'Prayer request recorded'
    when 'follow_up_created' then coalesce(new.metadata->>'title', 'Follow-up created')
    when 'follow_up_completed' then coalesce(new.metadata->>'title', 'Follow-up completed')
    when 'follow_up_updated' then coalesce(new.metadata->>'title', 'Follow-up updated')
    else replace(new.activity_type, '_', ' ')
  end;

  v_detail := coalesce(new.metadata->>'summary', new.metadata->>'address_label', new.metadata->>'status');

  insert into public.relationship_timeline (
    organization_id, person_id, household_id, assignment_id, source_id,
    activity_kind, title, detail, occurred_at, actor_id, status
  ) values (
    new.organization_id,
    v_person_id,
    v_household_id,
    new.assignment_id,
    new.id,
    case
      when new.activity_type like 'assignment_%' or new.activity_type like 'objective_%' then 'assignment'
      when new.activity_type like 'visit_%' then 'visit'
      when new.activity_type = 'note_added' then 'note'
      when new.activity_type = 'need_recorded' then 'need'
      when new.activity_type = 'prayer_recorded' then 'prayer'
      when new.activity_type like 'follow_up_%' then 'follow_up'
      else 'note'
    end,
    v_title,
    v_detail,
    new.created_at,
    new.actor_id,
    coalesce(new.metadata->>'status', 'recorded')
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists assignment_activity_relationship_timeline on public.assignment_activity;
create trigger assignment_activity_relationship_timeline
after insert on public.assignment_activity
for each row execute function public.sync_relationship_timeline_from_activity();