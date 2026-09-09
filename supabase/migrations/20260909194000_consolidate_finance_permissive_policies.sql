drop policy if exists budget_lines_org_manage on public.budget_lines;
drop policy if exists budgets_org_manage on public.budgets;
drop policy if exists campaigns_org_manage on public.campaigns;
drop policy if exists funds_org_manage on public.funds;
drop policy if exists merch_products_org_manage on public.merch_products;

create policy budget_lines_org_manage on public.budget_lines for insert to authenticated with check (exists (select 1 from public.budgets b where b.id = budget_lines.budget_id and public.has_org_role(b.organization_id, array['owner','admin','director','coordinator']::text[])));
create policy budget_lines_org_manage_update on public.budget_lines for update to authenticated using (exists (select 1 from public.budgets b where b.id = budget_lines.budget_id and public.has_org_role(b.organization_id, array['owner','admin','director','coordinator']::text[]))) with check (exists (select 1 from public.budgets b where b.id = budget_lines.budget_id and public.has_org_role(b.organization_id, array['owner','admin','director','coordinator']::text[])));
create policy budget_lines_org_manage_delete on public.budget_lines for delete to authenticated using (exists (select 1 from public.budgets b where b.id = budget_lines.budget_id and public.has_org_role(b.organization_id, array['owner','admin','director','coordinator']::text[])));

create policy budgets_org_manage_insert on public.budgets for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy budgets_org_manage_update on public.budgets for update to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[])) with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy budgets_org_manage_delete on public.budgets for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));

create policy campaigns_org_manage_insert on public.campaigns for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy campaigns_org_manage_update on public.campaigns for update to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[])) with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy campaigns_org_manage_delete on public.campaigns for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));

create policy funds_org_manage_insert on public.funds for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy funds_org_manage_update on public.funds for update to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[])) with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy funds_org_manage_delete on public.funds for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));

create policy merch_products_org_manage_insert on public.merch_products for insert to authenticated with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy merch_products_org_manage_update on public.merch_products for update to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[])) with check (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));
create policy merch_products_org_manage_delete on public.merch_products for delete to authenticated using (public.has_org_role(organization_id, array['owner','admin','director','coordinator']::text[]));