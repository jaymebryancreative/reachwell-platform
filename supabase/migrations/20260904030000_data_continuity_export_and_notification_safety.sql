create or replace function public.notify_followup_assignment()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.assigned_to is not null then
    if tg_op = 'INSERT' or old.assigned_to is distinct from new.assigned_to then
      perform public.create_reachwell_notification(new.assigned_to,new.organization_id,'follow_up','Follow-up assigned',new.title,jsonb_build_object('follow_up_id',new.id));
    end if;
  end if;
  return new;
end; $$;

create or replace function public.export_organization_data(p_organization_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid := auth.uid(); v_role text; v_result jsonb;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select organization_role into v_role from public.organization_members where organization_id=p_organization_id and user_id=v_user and status='active' limit 1;
  if v_role not in ('owner','admin','director') then raise exception 'Not authorized to export organization data'; end if;
  select jsonb_build_object(
    'exported_at', now(),
    'organization_id', p_organization_id,
    'people', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.people x where x.organization_id=p_organization_id),'[]'::jsonb),
    'giving_transactions', coalesce((select jsonb_agg(to_jsonb(x) order by x.received_at) from public.giving_transactions x where x.organization_id=p_organization_id),'[]'::jsonb),
    'financial_transactions', coalesce((select jsonb_agg(to_jsonb(x) order by x.transaction_date,x.created_at) from public.financial_transactions x where x.organization_id=p_organization_id),'[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;
revoke all on function public.export_organization_data(uuid) from public,anon,authenticated;
grant execute on function public.export_organization_data(uuid) to authenticated;
