-- ReachWell: notification and finance query indexes
-- Mirrors the additive indexes already applied to the live Supabase project.

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create index if not exists financial_transactions_org_date_idx
  on public.financial_transactions (organization_id, transaction_date desc);

create index if not exists financial_transactions_org_status_idx
  on public.financial_transactions (organization_id, status);

create index if not exists financial_transactions_org_source_idx
  on public.financial_transactions (organization_id, source_type, source_id);
