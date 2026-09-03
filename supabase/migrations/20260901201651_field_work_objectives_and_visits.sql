create table if not exists public.assignment_objectives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  sort_order integer not null default 0,
  completed_at timestamptz,
  completed_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_visits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  person_id uuid references public.people(id),
  household_id uuid references public.households(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  outcome text,
  summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assignment_objectives enable row level security;
alter table public.assignment_visits enable row level security;

create policy assignment_objectives_manage on public.assignment_objectives for all to authenticated using (has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader'])) with check (has_org_role(organization_id, array['owner','admin','director','coordinator','team_leader']));
create policy assignment_objectives_read on public.assignment_objectives for select to authenticated using (is_org_member(organization_id));
create policy assignment_visits_manage on public.assignment_visits for all to authenticated using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy assignment_visits_read on public.assignment_visits for select to authenticated using (is_org_member(organization_id));

create index if not exists assignment_objectives_assignment_idx on public.assignment_objectives(assignment_id);
create index if not exists assignment_objectives_org_status_idx on public.assignment_objectives(organization_id, status);
create index if not exists assignment_visits_assignment_idx on public.assignment_visits(assignment_id);
create index if not exists assignment_visits_org_started_idx on public.assignment_visits(organization_id, started_at desc);
