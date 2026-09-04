-- ReachWell finish-line: establish private organization file storage.
-- Storage paths are prefixed with the organization UUID so storage RLS can enforce org isolation.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-files',
  'organization-files',
  false,
  52428800,
  array[
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "organization members can upload organization files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'organization-files'
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = split_part(name, '/', 1)::uuid
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any(array['owner','admin','director','coordinator','team_leader'])
  )
);

create policy "organization members can read organization files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'organization-files'
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = split_part(name, '/', 1)::uuid
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy "organization file managers can delete storage files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'organization-files'
  and exists (
    select 1
    from public.organization_members m
    where m.organization_id = split_part(name, '/', 1)::uuid
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any(array['owner','admin'])
  )
);
