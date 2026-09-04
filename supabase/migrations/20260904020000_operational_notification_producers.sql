create or replace function public.notify_message_recipients()
returns trigger language plpgsql security definer set search_path=public as $$
declare r record; v_name text; v_org uuid;
begin
  select organization_id into v_org from public.communication_channels where id=new.channel_id;
  select coalesce(p.full_name, concat_ws(' ',p.first_name,p.last_name), p.email, 'A ReachWell member') into v_name from public.profiles p where p.id=new.author_id;
  for r in select user_id from public.communication_channel_members where channel_id=new.channel_id and user_id is not null and user_id <> coalesce(new.author_id,'00000000-0000-0000-0000-000000000000') loop
    perform public.create_reachwell_notification(r.user_id,v_org,'message','New message',v_name || ' posted in your channel.',jsonb_build_object('channel_id',new.channel_id,'message_id',new.id));
  end loop;
  return new;
end; $$;

create or replace function public.notify_followup_assignment()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.assigned_to is not null and (tg_op='INSERT' or old.assigned_to is distinct from new.assigned_to) then
    perform public.create_reachwell_notification(new.assigned_to,new.organization_id,'follow_up','Follow-up assigned',new.title,jsonb_build_object('follow_up_id',new.id));
  end if;
  return new;
end; $$;

create or replace function public.notify_task_assignment()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_org uuid; v_title text;
begin
  select organization_id,title into v_org,v_title from public.tasks where id=new.task_id;
  if v_org is not null then
    perform public.create_reachwell_notification(new.user_id,v_org,'task_assignment','Task assigned',coalesce(v_title,'New task'),jsonb_build_object('task_id',new.task_id));
  end if;
  return new;
end; $$;

drop trigger if exists communication_message_notification on public.communication_messages;
create trigger communication_message_notification after insert on public.communication_messages for each row execute function public.notify_message_recipients();
drop trigger if exists follow_up_assignment_notification on public.follow_ups;
create trigger follow_up_assignment_notification after insert or update of assigned_to on public.follow_ups for each row execute function public.notify_followup_assignment();
drop trigger if exists task_assignee_notification on public.task_assignees;
create trigger task_assignee_notification after insert on public.task_assignees for each row execute function public.notify_task_assignment();

revoke all on function public.notify_message_recipients() from public,anon,authenticated;
revoke all on function public.notify_followup_assignment() from public,anon,authenticated;
revoke all on function public.notify_task_assignment() from public,anon,authenticated;
