create or replace function public.mark_giving_receipt_issued(p_gift_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_org uuid;
begin
  select organization_id into v_org from public.giving_transactions where id=p_gift_id;
  if v_org is null then raise exception 'Gift not found'; end if;
  if not public.can_manage_finance(v_org) then raise exception 'Not authorized'; end if;
  update public.giving_transactions set receipt_status='issued' where id=p_gift_id;
end; $$;
revoke all on function public.mark_giving_receipt_issued(uuid) from public,anon,authenticated;
grant execute on function public.mark_giving_receipt_issued(uuid) to authenticated;
