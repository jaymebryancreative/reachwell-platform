-- Reachwell people and team membership foundation
-- People are organization records and do not require authentication accounts.
-- Authenticated users may later be linked separately without changing team history.

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists people_org_email_unique
  on public.people (organization_id, lower(email))
  where email is not null;

create table if not exists public.people_team_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null default 'member',
  is_leader boolean not null default false,
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (person_id, team_id)
);

create index if not exists people_team_memberships_org_idx on public.people_team_memberships (organization_id);
create index if not exists people_team_memberships_person_idx on public.people_team_memberships (person_id);
create index if not exists people_team_memberships_team_idx on public.people_team_memberships (team_id);

alter table public.people enable row level security;
alter table public.people_team_memberships enable row level security;
