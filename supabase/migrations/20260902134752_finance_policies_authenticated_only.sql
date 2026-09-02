alter policy accounts_finance_manage on public.finance_accounts to authenticated;
alter policy accounts_finance_select on public.finance_accounts to authenticated;

alter policy financial_attachments_insert on public.financial_attachments to authenticated;
alter policy financial_attachments_select on public.financial_attachments to authenticated;
alter policy financial_attachments_update on public.financial_attachments to authenticated;

alter policy categories_finance_manage on public.financial_categories to authenticated;
alter policy categories_finance_select on public.financial_categories to authenticated;

alter policy transactions_finance_insert on public.financial_transactions to authenticated;
alter policy transactions_finance_select on public.financial_transactions to authenticated;
alter policy transactions_finance_update on public.financial_transactions to authenticated;

alter policy giving_receipts_insert on public.giving_receipts to authenticated;
alter policy giving_receipts_select on public.giving_receipts to authenticated;
alter policy giving_receipts_update on public.giving_receipts to authenticated;

alter policy giving_finance_insert on public.giving_transactions to authenticated;
alter policy giving_finance_select on public.giving_transactions to authenticated;
alter policy giving_finance_update on public.giving_transactions to authenticated;

alter policy finance_access_manage on public.organization_finance_access to authenticated;
alter policy finance_access_select on public.organization_finance_access to authenticated;
