create or replace function public.notify_followup_assignment()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.assigned_to is not null then
    if tg_op='INSERT' then
      perform public.create_reachwell_notification(new.assigned_to,new.organization_id,'follow_up','Follow-up assigned',new.title,jsonb_build_object('follow_up_id',new.id));
    elsif tg_op='UPDATE' and old.assigned_to is distinct from new.assigned_to then
      perform public.create_reachwell_notification(new.assigned_to,new.organization_id,'follow_up','Follow-up assigned',new.title,jsonb_build_object('follow_up_id',new.id));
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists follow_up_assignment_notification on public.follow_ups;
create trigger follow_up_assignment_notification after insert or update of assigned_to on public.follow_ups for each row execute function public.notify_followup_assignment();

revoke all on function public.notify_followup_assignment() from public,anon,authenticated;
