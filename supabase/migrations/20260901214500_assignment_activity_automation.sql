create or replace function public.record_assignment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_id uuid;
  v_actor_id uuid := auth.uid();
  v_fallback_actor uuid;
  v_organization_id uuid;
  v_type text;
  v_metadata jsonb;
begin
  if tg_table_name = 'assignments' then
    v_assignment_id := coalesce(new.id, old.id);
    v_organization_id := coalesce(new.organization_id, old.organization_id);
    v_fallback_actor := coalesce(new.created_by, old.created_by);
    if tg_op = 'INSERT' then v_type := 'assignment_created';
    elsif new.status is distinct from old.status then v_type := 'assignment_status_changed';
    else v_type := 'assignment_updated'; end if;
    v_metadata := jsonb_build_object('status', new.status, 'title', new.title, 'address_label', new.address_label);
  elsif tg_table_name = 'assignment_objectives' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := coalesce(new.created_by, old.created_by);
    v_type := case when tg_op = 'INSERT' then 'objective_created' when new.status is distinct from old.status and new.status = 'complete' then 'objective_completed' else 'objective_updated' end;
    v_metadata := jsonb_build_object('objective_id', new.id, 'title', new.title, 'status', new.status);
  elsif tg_table_name = 'assignment_visits' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := coalesce(new.created_by, old.created_by);
    v_type := case when tg_op = 'INSERT' then 'visit_started' when new.ended_at is distinct from old.ended_at and new.ended_at is not null then 'visit_finished' else 'visit_updated' end;
    v_metadata := jsonb_build_object('visit_id', new.id, 'outcome', new.outcome, 'summary', new.summary);
  elsif tg_table_name = 'assignment_notes' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := new.author_id;
    v_type := 'note_added'; v_metadata := jsonb_build_object('note_id', new.id);
  elsif tg_table_name = 'needs' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := new.created_by;
    v_type := 'need_recorded'; v_metadata := jsonb_build_object('need_id', new.id, 'title', new.title, 'status', new.status);
  elsif tg_table_name = 'prayer_requests' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := new.created_by;
    v_type := 'prayer_recorded'; v_metadata := jsonb_build_object('prayer_request_id', new.id, 'status', new.status);
  elsif tg_table_name = 'follow_ups' then
    v_assignment_id := new.assignment_id; v_organization_id := new.organization_id; v_fallback_actor := coalesce(new.created_by, old.created_by);
    if v_assignment_id is null then return new; end if;
    v_type := case when tg_op = 'INSERT' then 'follow_up_created' when new.status is distinct from old.status and new.status = 'complete' then 'follow_up_completed' else 'follow_up_updated' end;
    v_metadata := jsonb_build_object('follow_up_id', new.id, 'title', new.title, 'status', new.status, 'due_at', new.due_at);
  else return new;
  end if;
  if v_assignment_id is not null and coalesce(v_actor_id, v_fallback_actor) is not null then
    insert into public.assignment_activity (organization_id, assignment_id, actor_id, activity_type, metadata)
    values (v_organization_id, v_assignment_id, coalesce(v_actor_id, v_fallback_actor), v_type, coalesce(v_metadata, '{}'::jsonb));
  end if;
  return new;
end;
$$;

create trigger assignments_activity_log after insert or update on public.assignments for each row execute function public.record_assignment_activity();
create trigger assignment_objectives_activity_log after insert or update on public.assignment_objectives for each row execute function public.record_assignment_activity();
create trigger assignment_visits_activity_log after insert or update on public.assignment_visits for each row execute function public.record_assignment_activity();
create trigger assignment_notes_activity_log after insert on public.assignment_notes for each row execute function public.record_assignment_activity();
create trigger needs_activity_log after insert on public.needs for each row execute function public.record_assignment_activity();
create trigger prayer_requests_activity_log after insert on public.prayer_requests for each row execute function public.record_assignment_activity();
create trigger follow_ups_activity_log after insert or update on public.follow_ups for each row execute function public.record_assignment_activity();
