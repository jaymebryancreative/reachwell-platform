-- Keep giving and finance connected without storing payment credentials.
create or replace function public.sync_giving_transaction_to_finance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.financial_transactions (
    organization_id, transaction_type, amount, currency, transaction_date,
    payee_or_source, description, status, entered_by, source_type, source_id, metadata
  ) values (
    new.organization_id,
    'income',
    new.amount,
    new.currency,
    new.received_at::date,
    case when new.donor_id is null then 'Giving' else 'Donor contribution' end,
    coalesce(new.note, 'Giving transaction'),
    case when new.status = 'completed' then 'posted' when new.status in ('pending','processing') then 'pending_approval' else new.status end,
    new.recorded_by,
    'giving_transaction',
    new.id,
    jsonb_build_object('giving_transaction_id', new.id, 'fund_id', new.fund_id, 'campaign_id', new.campaign_id, 'provider', new.provider, 'payment_method', new.payment_method)
  )
  on conflict (source_type, source_id) where source_id is not null
  do update set
    organization_id = excluded.organization_id,
    amount = excluded.amount,
    currency = excluded.currency,
    transaction_date = excluded.transaction_date,
    payee_or_source = excluded.payee_or_source,
    description = excluded.description,
    status = excluded.status,
    entered_by = excluded.entered_by,
    metadata = excluded.metadata,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists giving_transactions_finance_sync on public.giving_transactions;
create trigger giving_transactions_finance_sync
after insert or update on public.giving_transactions
for each row execute function public.sync_giving_transaction_to_finance();

revoke all on function public.sync_giving_transaction_to_finance() from public, anon, authenticated;
