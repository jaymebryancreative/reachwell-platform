-- ReachWell: audit console and notification security hardening
-- Mirrors the migration applied to the live Supabase project.

revoke execute on function public.notify_follow_up_assignment() from public, anon, authenticated;

create or replace function public.record_reachwell_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) else null end;
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) else null end;
  v_org_id uuid;
  v_actor_id uuid;
begin
  v_org_id := coalesce((v_new->>'organization_id')::uuid, (v_old->>'organization_id')::uuid);
  v_actor_id := auth.uid();

  if v_org_id is null then
    return coalesce(new, old);
  end if;

  insert into public.audit_log (organization_id, actor_id, entity_type, entity_id, action, old_data, new_data)
  values (
    v_org_id,
    v_actor_id,
    tg_table_name,
    coalesce((v_new->>'id')::uuid, (v_old->>'id')::uuid),
    lower(tg_op),
    v_old,
    v_new
  );

  return coalesce(new, old);
end;
$$;

revoke execute on function public.record_reachwell_audit() from public, anon, authenticated;

drop policy if exists audit_log_org_admin_select on public.audit_log;
drop policy if exists audit_log_read_admin on public.audit_log;
create policy audit_log_read_admin
on public.audit_log
for select
to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner','admin','director']::text[]
  )
);

drop trigger if exists audit_organization_members on public.organization_members;
create trigger audit_organization_members after insert or update or delete on public.organization_members for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_organization_invitations on public.organization_invitations;
create trigger audit_organization_invitations after insert or update or delete on public.organization_invitations for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_people on public.people;
create trigger audit_people after insert or update or delete on public.people for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_teams on public.teams;
create trigger audit_teams after insert or update or delete on public.teams for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_events on public.events;
create trigger audit_events after insert or update or delete on public.events for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_assignments on public.assignments;
create trigger audit_assignments after insert or update or delete on public.assignments for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_follow_ups on public.follow_ups;
create trigger audit_follow_ups after insert or update or delete on public.follow_ups for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_needs on public.needs;
create trigger audit_needs after insert or update or delete on public.needs for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_prayer_requests on public.prayer_requests;
create trigger audit_prayer_requests after insert or update or delete on public.prayer_requests for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_financial_transactions on public.financial_transactions;
create trigger audit_financial_transactions after insert or update or delete on public.financial_transactions for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_giving_transactions on public.giving_transactions;
create trigger audit_giving_transactions after insert or update or delete on public.giving_transactions for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_sales_transactions on public.sales_transactions;
create trigger audit_sales_transactions after insert or update or delete on public.sales_transactions for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_projects on public.projects;
create trigger audit_projects after insert or update or delete on public.projects for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_tasks on public.tasks;
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_communication_channels on public.communication_channels;
create trigger audit_communication_channels after insert or update or delete on public.communication_channels for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_communication_messages on public.communication_messages;
create trigger audit_communication_messages after insert or update or delete on public.communication_messages for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_communication_announcements on public.communication_announcements;
create trigger audit_communication_announcements after insert or update or delete on public.communication_announcements for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_organization_files on public.organization_files;
create trigger audit_organization_files after insert or update or delete on public.organization_files for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_organization_exports on public.organization_exports;
create trigger audit_organization_exports after insert or update or delete on public.organization_exports for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_assignment_safety_alerts on public.assignment_safety_alerts;
create trigger audit_assignment_safety_alerts after insert or update or delete on public.assignment_safety_alerts for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_assignment_objectives on public.assignment_objectives;
create trigger audit_assignment_objectives after insert or update or delete on public.assignment_objectives for each row execute function public.record_reachwell_audit();
drop trigger if exists audit_assignment_visits on public.assignment_visits;
create trigger audit_assignment_visits after insert or update or delete on public.assignment_visits for each row execute function public.record_reachwell_audit();

create index if not exists audit_log_org_created_idx on public.audit_log (organization_id, created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (organization_id, entity_type, entity_id, created_at desc);
create index if not exists audit_log_action_idx on public.audit_log (organization_id, action, created_at desc);
create index if not exists assignment_safety_alerts_acknowledged_by_idx on public.assignment_safety_alerts (acknowledged_by);
create index if not exists assignment_safety_alerts_reporter_id_idx on public.assignment_safety_alerts (reporter_id);
create index if not exists assignment_safety_alerts_resolved_by_idx on public.assignment_safety_alerts (resolved_by);

drop index if exists public.financial_org_date_idx;
