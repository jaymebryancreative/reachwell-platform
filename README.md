# ReachWell

**Field Operations & Community Impact Platform**

ReachWell helps organizations manage teams, coordinate outreach, run Mission Mode, track assignments, record needs, manage follow-ups, track volunteer activity, and measure community impact.

## Current Implementation Status

### Backend

The Supabase/PostgreSQL foundation is already implemented, including:

- Organizations, members, and role-based access
- Teams and team membership
- Households and people
- Events and participants
- Assignments and operational workflow
- Prayer requests and needs
- Follow-ups
- Assignment notes and activity history
- Notifications and audit logging
- Row Level Security policies across the application data model

See [Backend Status](docs/BACKEND_STATUS.md) and [Backend Architecture](docs/BACKEND_ARCHITECTURE.md) for the current backend inventory.

### Frontend

The active ReachWell frontend source is not currently present in this repository. The next priority is to recover the current application source and commit it here so the frontend can be connected to the existing backend and tested as one system.

## Technology

- **Frontend:** React + TypeScript
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Hosting:** Cloudflare

## Immediate Priorities

1. Recover and commit the active ReachWell frontend source.
2. Connect the application to Supabase using environment variables.
3. Implement authentication and organization context.
4. Connect People, Teams, Events, and Mission Mode to the existing backend.
5. Fix and test Mission Mode interactions, including the Prayer / Need / Complete selection state.
6. Add automated validation and deployment configuration.

## Repository Rule

This repository should be the source of truth for ReachWell application code and implementation documentation. Secrets and Supabase service keys must never be committed.
