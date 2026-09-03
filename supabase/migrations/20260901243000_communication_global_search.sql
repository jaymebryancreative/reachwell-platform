-- ReachWell: communication global search
-- Mirrors the migration applied to the live Supabase project.

create or replace function public.search_communication_messages(
  p_organization_id uuid,
  p_query text,
  p_limit integer default 50
)
returns table (
  message_id uuid,
  channel_id uuid,
  channel_name text,
  author_id uuid,
  body text,
  created_at timestamptz,
  rank real
)
language sql
security invoker
set search_path = ''
as $$
  select
    m.id,
    m.channel_id,
    c.name,
    m.author_id,
    m.body,
    m.created_at,
    ts_rank(to_tsvector('simple', m.body), websearch_to_tsquery('simple', p_query))::real
  from public.communication_messages m
  join public.communication_channels c on c.id = m.channel_id
  where c.organization_id = p_organization_id
    and c.archived_at is null
    and m.deleted_at is null
    and p_query is not null
    and length(trim(p_query)) > 0
    and to_tsvector('simple', m.body) @@ websearch_to_tsquery('simple', p_query)
  order by ts_rank(to_tsvector('simple', m.body), websearch_to_tsquery('simple', p_query)) desc, m.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

revoke execute on function public.search_communication_messages(uuid,text,integer) from public, anon;
grant execute on function public.search_communication_messages(uuid,text,integer) to authenticated;
