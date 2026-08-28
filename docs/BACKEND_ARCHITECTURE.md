# Reachwell Backend Architecture

## Foundation

Reachwell is designed as a multi-organization field operations and community impact platform.

### Core hierarchy

- Organization
  - Members
  - Teams
  - Events
  - Community households and people
  - Assignments
  - Needs
  - Prayer requests
  - Follow-ups

## Organization roles

- **Owner** — highest organization-level authority; manages administrators and critical organization settings.
- **Admin** — broad operational and administrative access.
- **Director** — manages organization operations, teams, events, and field programs.
- **Coordinator** — coordinates events, assignments, teams, and workflows.
- **Team Leader** — leads assigned teams and manages field work within delegated scope.
- **Volunteer** — participates in assigned events and assignments with limited access.
- **Viewer** — read-only access where granted.

The model is inspired by the principle used by mature operational platforms: global organization authority should be separate from scoped product/team authority, and higher roles should not be granted unnecessarily.

## Mission Mode

Mission Mode is backed by:

- `assignments`
- `assignment_assignees`
- `assignment_notes`
- `assignment_note_revisions`
- `needs`
- `prayer_requests`
- `follow_ups`
- `assignment_activity`

### Key workflow

1. User opens an authorized assignment.
2. Assignment can move from `pending` to `in_progress`.
3. User records notes, needs, and/or prayer requests.
4. Notes remain editable after submission.
5. A revision record preserves the prior note body when a note changes.
6. Completing an assignment records completion details and activity history.
7. `complete_assignment_and_get_next()` can return the next authorized assignment for the user in sequence.

## Security

All current Reachwell application tables have Row Level Security enabled.

Authorization is based on:

- authenticated user identity
- active organization membership
- organization role
- team membership and team leadership where applicable
- assignment ownership/assignee relationships
- privacy levels for sensitive notes and prayer requests

Broad public access policies are intentionally avoided.

## Current database tables

### Foundation
- organizations
- profiles
- organization_members
- teams
- team_members

### Core operations
- households
- people
- events
- event_teams
- event_participants
- assignments
- assignment_assignees

### Mission and care operations
- assignment_notes
- assignment_note_revisions
- needs
- prayer_requests
- follow_ups
- assignment_activity

### Platform operations
- notifications
- audit_log

## Next implementation priorities

1. Authentication onboarding and organization creation flow.
2. Initial owner bootstrap flow.
3. Frontend-to-Supabase integration.
4. Storage buckets and secure file attachments.
5. Automated notifications.
6. Full permission test matrix using real test accounts.
7. Audit triggers for critical record changes.
8. Data retention and archival policies.
9. Production deployment and monitoring.
