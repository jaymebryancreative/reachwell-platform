-- ReachWell: notification preferences and in-app notification automation
-- Mirrors the migration applied to the live Supabase project.

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  in_app_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, notification_type)
);

alter table public.notification_preferences enable row level security;

drop policy if exists notification_preferences_read on public.notification_preferences;
drop policy if exists notification_preferences_insert on public.notification_preferences;
drop policy if exists notification_preferences_update on public.notification_preferences;
create policy notification_preferences_read on public.notification_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy notification_preferences_insert on public.notification_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy notification_preferences_update on public.notification_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.set_notification_preferences_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences for each row execute function public.set_notification_preferences_updated_at();

create index if not exists notification_preferences_user_idx on public.notification_preferences (user_id);

create or replace function public.create_reachwell_notification(
  p_recipient_id uuid,
  p_organization_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_enabled boolean;
begin
  if p_recipient_id is null or p_organization_id is null then return null; end if;
  select coalesce(np.in_app_enabled, true) into v_enabled
  from public.notification_preferences np
  where np.user_id = p_recipient_id and np.notification_type = p_type;
  if coalesce(v_enabled, true) = false then return null; end if;
  insert into public.notifications (organization_id, recipient_id, type, title, body, data)
  values (p_organization_id, p_recipient_id, p_type, p_title, p_body, coalesce(p_data, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.create_reachwell_notification(uuid,uuid,text,text,text,jsonb) from public, anon, authenticated;
grant select, insert, update on public.notification_preferences to authenticated;

create or replace function public.notify_follow_up_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body text;
begin
  if new.assigned_to is null then return new; end if;
  if tg_op = 'UPDATE' and old.assigned_to is not distinct from new.assigned_to and old.due_at is not distinct from new.due_at and old.status is not distinct from new.status then
    return new;
  end if;
  v_title := case when tg_op = 'INSERT' then 'New follow-up assigned' else 'Follow-up updated' end;
  v_body := coalesce(new.title, 'Follow-up') || case when new.due_at is not null then ' · due ' || to_char(new.due_at, 'Mon DD, YYYY HH12:MI AM') else '' end;
  perform public.create_reachwell_notification(new.assigned_to, new.organization_id, 'follow_up', v_title, v_body, jsonb_build_object('follow_up_id', new.id, 'assignment_id', new.assignment_id));
  return new;
end;
$$;

drop trigger if exists follow_ups_notify_assignment on public.follow_ups;
create trigger follow_ups_notify_assignment after insert or update of assigned_to, due_at, status, title on public.follow_ups for each row execute function public.notify_follow_up_assignment();
