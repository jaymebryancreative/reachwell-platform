# ReachWell Finish-Line Status

Updated 2026-09-01.

## Verified live backend

- Supabase project is live.
- 60 public tables are present and all 60 currently have Row Level Security enabled.
- Core operational domains exist for people, teams, events, assignments, notes, needs, prayer, follow-ups, activity, notifications, audit, projects, communication, finance, files, and continuity.
- Live migration history contains 22 applied migrations.
- Live security advisor currently reports zero active security lints.
- Core relationship indexes have been added for event, assignment, people/team membership, notes, needs, prayer, and follow-up access paths.

## Corrections completed

- Fixed the assignment update authorization predicate so an assigned user can actually match their assignment through `assignment_assignees`.
- Removed the duplicate event/team unique index.
- Removed the historical membership uniqueness constraint that prevented re-joining a team after an earlier membership ended; active memberships remain unique through the partial unique index.
- Added attendance/event and foreign-key access indexes where they materially support field workflows.

## Verified application state

The integration branch contains the React shell, People, Teams, Projects, Mission Mode, Supabase client, TypeScript/Vite configuration, package lockfile, and a Vitest test foundation. The Mission Mode stabilization commit is present, but Mission Mode is still a demo-state workflow: its assignments and Note/Need/Prayer actions are not yet persisted from the React screen.

People and Teams currently use an explicit environment organization ID rather than authenticated organization context. This is intentionally not marked production-complete.

## Current blockers to production completion

1. Authentication/session-driven organization context.
2. Complete People profile CRUD and team assignment UI using authenticated context.
3. Event CRUD + Sign-In Mode persistence, including person-based participants and absence reasons.
4. Mission Mode persistence for assignment completion, notes, needs, prayer, follow-up, and progress.
5. Production communication persistence and permission-aware channels.
6. Production Projects/Tasks persistence rather than seeded client state.
7. Settings/Administration UI wired to the permission model.
8. End-to-end browser tests against a controlled Supabase environment.
9. Reconcile all 22 live migrations into repository migration history so a fresh environment can reproduce production safely.

## Acceptance rule

A module is not complete because its screen renders. It is complete only when its real workflow persists to organization-scoped Supabase data, server-side authorization is enforced, errors are handled, and the workflow survives reload and is covered by automated validation.
