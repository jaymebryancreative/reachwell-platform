# ReachWell Finish-Line Execution

## Phase 1 — Production Foundation

**Status: Active / hardening in progress**

The current application has a green local-quality contract in `package.json` for build, lint, and Vitest, and GitHub Actions runs those same checks on pushes and pull requests. The live Supabase project currently reports 65 public tables with RLS enabled on all 65 and 180 public policies. Production security-definer functions were audited: public authenticated execution is limited to the intended client workflows (invitation acceptance/creation, organization bootstrap, assignment completion workflow, and current membership lookup), while authorization helpers and trigger functions are not directly executable by authenticated clients.

Remaining acceptance work: authenticated browser regression, failure/recovery testing, and fresh-environment migration reproducibility.

## Phase 2 — People & Relationships

**Status: Foundation present; deep operational profile pass next.**

People, households, assignments, visits, needs, prayer, follow-ups, team memberships, Relationship Health, and Connected History are connected at the data-model/API level. Acceptance requires traversing Person → Household → Team → Event → Assignment → Field History → Follow-Up without losing organization context.

## Phase 3 — Mission Mode & Sign-In Mode

**Status: Core workflows implemented; field regression pass active.**

Mission Mode now has dedicated workflow-state regression coverage and its assignment progress helper is aligned with the production assignment state constraint: `pending`, `in_progress`, `completed`, `skipped`, and `cancelled`. Progress no longer treats skipped/cancelled work as open work. Sign-In and Mission Mode still require authenticated browser verification, persistence/reload testing, objective testing, visit outcomes, corrections, realtime multi-client verification, and mobile/tablet field testing.

## Phase 4 — Communication

**Status: Backend foundation present; production workflow pass next.**

The target remains channel creation, membership, messages, search, assignment-linked context, person/household context, notifications, and auditability against Supabase. Global search already includes communication channels/messages and organization files; authenticated workflow verification remains required.

## Phase 5 — Leadership & Reporting

**Status: Foundation present; reporting completion pass next.**

The target is team performance, outreach, attendance, volunteer engagement, follow-up effectiveness, need resolution, finance, Money Trail, and printable operational reporting. Reporting must use real persisted records and remain permission-scoped.

## Phase 6 — Production Hardening

**Status: Active.**

RLS coverage and public security-definer execution were re-audited against the live Supabase project. Mission workflow tests were strengthened to protect assignment-state invariants. The remaining hardening targets are browser regression, realtime multi-client verification, loading/error/empty-state audit, resilience checks, and fresh-environment migration reproducibility.

## Phase 7 — Field Test

**Status: Formal cycle pending.**

Use a controlled organization and execute a realistic outreach event with multiple teams, attendance, assignments, visits, notes, needs, prayer, follow-ups, safety alerts, and completion. Deliberately test corrections, reconnects, authorization boundaries, and failure recovery.

## Phase 8 — Final Polish

**Status: Ongoing.**

Preserve the current simple, professional, high-end visual direction while removing duplicate controls, inconsistent terminology, dead interactions, weak empty states, and mobile friction. Do not introduce decorative UI that is not backed by real behavior.

## Release rule

ReachWell 1.0 must not be represented as fully production-certified until authenticated browser acceptance evidence, mobile/tablet field evidence, realtime verification, provider configuration, data-integrity review, and deployment/recovery verification are complete. Implementation continues on the hardening branch without destructive production changes.
