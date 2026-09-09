-- ReachWell: keep relationship-record access scoped to active organization membership.
-- Cross-organization/person/household/assignment integrity remains enforced by database triggers.

drop policy if exists followups_access on public.follow_ups;
drop policy if exists needs_access on public.needs;
drop policy if exists prayer_access on public.prayer_requests;

create policy followups_select on public.follow_ups for select using (is_org_member(organization_id));
create policy followups_insert on public.follow_ups for insert with check (is_org_member(organization_id));
create policy followups_update on public.follow_ups for update using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy followups_delete on public.follow_ups for delete using (is_org_member(organization_id));

create policy needs_select on public.needs for select using (is_org_member(organization_id));
create policy needs_insert on public.needs for insert with check (is_org_member(organization_id));
create policy needs_update on public.needs for update using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy needs_delete on public.needs for delete using (is_org_member(organization_id));

create policy prayer_select on public.prayer_requests for select using (is_org_member(organization_id));
create policy prayer_insert on public.prayer_requests for insert with check (is_org_member(organization_id));
create policy prayer_update on public.prayer_requests for update using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy prayer_delete on public.prayer_requests for delete using (is_org_member(organization_id));
