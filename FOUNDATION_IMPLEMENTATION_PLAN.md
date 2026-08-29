# Reachwell Foundation Implementation Plan

## Build rule
No module is marked complete because a screen exists. Completion requires a tested workflow with persistent organization-scoped data, authorization, validation, meaningful errors, responsive behavior, and connected records.

## Foundation vertical slices

### 1. Organization and access
- Organization profile and details
- Membership and invitations
- Owner/admin/leader/member roles
- Server-side permission enforcement
- Organization data isolation

### 2. People and profiles
- Complete profile creation and editing
- Identity, contact, household, emergency contact, skills, interests and availability
- Search, filters, tags, archive/restore
- Serving, attendance, communication and follow-up history

### 3. Roles, teams and groups
- Create/edit/archive teams and groups
- Leaders and coordinators
- Person-to-team and team-to-person views
- Role assignment and leadership responsibilities
- Rosters and availability

### 4. Communication
- Organization announcements
- Team channels
- Direct/group conversations
- Event/project conversations
- Read state, notifications, history and search

### 5. Events and scheduling
- Event CRUD
- Teams, rosters and assignments
- Scheduling from person availability and serving history
- Event communication
- Attendance and follow-up

## Acceptance tests
For the core relationship, verify:
1. Create a person with a complete profile.
2. Save and reload; the person remains in the organization.
3. Assign one or more teams and roles.
4. Open the team and see the person and role.
5. Open the person and see the team assignment.
6. Add the person to an event roster.
7. Use the event/team communication context.
8. Record attendance and serving history.
9. Verify permissions prevent unauthorized financial/sensitive access.

## Preview versus production
The preview demonstrates workflows. Production completion requires the same flows to use the existing Supabase organization-scoped schema and row-level authorization rather than browser-only storage.
