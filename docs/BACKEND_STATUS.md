# ReachWell Backend Status

## Current State

The Supabase backend is live and the core schema has already been created. The GitHub repository should be treated as the source of truth for application code and backend documentation going forward.

## Supabase Foundation

The current project contains these completed migrations:

- `20260828151747_create_reachwell_foundation`
- `20260828152012_create_reachwell_core_operations`
- `20260828152042_add_reachwell_permissions_and_mission_logic`

## Core Domains Already Implemented

- Organizations and organization membership
- User profiles
- Teams and team membership
- Households and people
- Events, event teams, and participants
- Assignments and assignment assignees
- Assignment notes and revision history
- Needs
- Prayer requests
- Follow-ups
- Assignment activity
- Notifications
- Audit logging

## Security

Row Level Security is enabled across the application tables. Authorization helpers exist for organization membership, organization roles, team leadership, and team membership.

## Mission Operations

The database already includes assignment workflow support and a `complete_assignment_and_get_next` routine for advancing through operational work.

## Repository Gap

The current GitHub repository does not yet contain the active ReachWell frontend source code. The immediate priority is to locate or recover that frontend, add it to this repository, and then connect it to the existing Supabase backend.

Until the frontend source is available, backend schema work should avoid duplicating the existing foundation.

## Next Implementation Priorities

1. Recover and commit the active ReachWell frontend source.
2. Add Supabase client configuration using environment variables only.
3. Connect authentication and organization context.
4. Connect People, Teams, Events, and Mission Mode to the existing database.
5. Fix and test Mission Mode state transitions and selection behavior.
6. Add automated checks and deployment configuration once the application source is present.
