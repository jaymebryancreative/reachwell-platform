create index if not exists communication_messages_body_search_idx on public.communication_messages using gin (to_tsvector('simple', body));
create index if not exists assignment_activity_org_created_idx on public.assignment_activity (organization_id, created_at desc);
create index if not exists financial_org_type_date_idx on public.financial_transactions (organization_id, transaction_type, transaction_date desc);
