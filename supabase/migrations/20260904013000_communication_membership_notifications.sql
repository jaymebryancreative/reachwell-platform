-- Keep communication membership and in-app notifications connected.
create or replace function public.ensure_communication_channel_creator_member()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.created_by is not null then
    insert into public.communication_channel_members(channel_id,user_id,member_role)
    values(new.id,new.created_by,'owner')
    on conflict (channel_id,user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists communication_channel_creator_membership on public.communication_channels;
create trigger communication_channel_creator_membership
after insert on public.communication_channels
for each row execute function public.ensure_communication_channel_creator_member();

create or replace function public.notify_communication_message()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  channel_record record;
  recipient record;
begin
  select id, organization_id, name into channel_record
  from public.communication_channels where id=new.channel_id;
  if channel_record.id is null then return new; end if;

  for recipient in
    select user_id from public.communication_channel_members
    where channel_id=new.channel_id and user_id <> new.author_id
      and (muted_until is null or muted_until < now())
  loop
    perform public.create_reachwell_notification(
      channel_record.organization_id,
      recipient.user_id,
      'communication_message',
      'New message in ' || channel_record.name,
      left(new.body, 180),
      jsonb_build_object('channel_id', new.channel_id, 'message_id', new.id)
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists communication_message_notification on public.communication_messages;
create trigger communication_message_notification
after insert on public.communication_messages
for each row execute function public.notify_communication_message();

revoke all on function public.ensure_communication_channel_creator_member() from public, anon, authenticated;
revoke all on function public.notify_communication_message() from public, anon, authenticated;
