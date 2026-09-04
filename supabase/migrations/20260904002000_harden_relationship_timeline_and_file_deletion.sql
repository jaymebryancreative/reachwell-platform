-- Keep the derived relationship timeline subject to the caller's underlying RLS policies.
alter view public.relationship_timeline set (security_invoker = true);

-- File records are soft-deletable, but permanent record deletion remains owner/admin only.
create policy "owners admins can delete file records"
on public.organization_files
for delete
to authenticated
using (
  exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_files.organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any (array['owner','admin'])
  )
);
