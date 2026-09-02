# ReachWell

**Field Operations & Community Impact Platform**

ReachWell helps organizations manage people, teams, events, outreach assignments, Mission Mode, needs, prayer, follow-ups, communication, notifications, audit history, and financial accountability in one connected workspace.

## Current Implementation Status

### Backend

The live Supabase/PostgreSQL foundation is implemented across the core operational domains, including:

- Organizations, members, roles, and authenticated organization context
- People, households, and team memberships
- Events, person-based participants, and attendance
- Assignments, objectives, visits, notes, needs, prayer, and follow-ups
- Durable assignment activity and audit history
- Field safety alerts and team progress
- Communication channels, messages, and organization-scoped message search
- Notifications, notification preferences, and realtime delivery
- Giving/finance foundations and Money Trail reporting
- Files, exports, projects/tasks, and continuity foundations
- Row Level Security across the application data model

The latest live security advisor check reports **zero active security lints**. Performance optimization work is ongoing; remaining advisor warnings are documented rather than hidden.

See `docs/BACKEND_STATUS.md` and `docs/BACKEND_ARCHITECTURE.md` for the deeper inventory.

### Frontend

The active React + TypeScript application is maintained on the `build/backend-finish-line` branch and includes the integrated shell plus People, Teams, Projects, Events, Sign-In Mode, Mission Mode, Follow-Ups, Team Progress, History, Relationship Health, Communication, Communication Search, Resources, Giving & Finance, Money Trail, Administration, Audit Console, and Notifications workspaces.

The production completion standard is intentionally higher than simply rendering a screen: important workflows must persist to Supabase, respect server-side authorization, handle loading/empty/error states, survive reloads, and have automated validation.

## Quality Gate

GitHub Actions runs:

1. `npm ci`
2. `npm run build`
3. `npm run lint`
4. `npm test`

The latest verified quality run completed successfully across all four checks.

## Technology

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Source control:** GitHub
- **Design / rapid iteration:** Floot
- **Hosting target:** Vercel/Cloudflare deployment can be reconciled during launch hardening

## Active Build Priorities

1. Event Command Center production pass
2. Sign-In Mode persistence and attendance corrections/reasons
3. Mission Mode 2.0 and reliability hardening
4. Live team operations and field safety
5. Relationship Health and contextual resources
6. Communication 2.0 and unified search
7. Finance reporting and Money Trail expansion
8. Administration and Audit Console 2.0
9. Automated end-to-end browser testing
10. Controlled field-test readiness and 1.0 launch hardening

## Repository Rule

This repository is the source of truth for ReachWell application code and migration source. Secrets and Supabase service keys must never be committed. Changes applied to the live Supabase project should be mirrored here so a fresh environment can be reproduced safely.
