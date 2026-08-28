# Reachwell Production Readiness

## Current backend foundation

Reachwell currently has database support for organizations, profiles, memberships, teams, households, people, events, assignments, Mission Mode notes and revisions, needs, prayer requests, follow-ups, notifications, activity history, and audit records.

## Role model

Organization roles:

- Owner — full authority, including ownership-level administration.
- Admin — broad administration, but cannot assign Owner or Admin through the controlled role function.
- Director — operational leadership.
- Coordinator — delegated operational coordination.
- Team Leader — field/team leadership.
- Volunteer — assigned participation.
- Viewer — read-only/limited participation.

Team roles:

- Leader
- Member

### Controlled promotion

Organization role changes should use `assign_organization_role`.

- Owners may assign all organization roles.
- Admins may assign Director, Coordinator, Team Leader, Volunteer, and Viewer.
- Admins cannot assign Owner or Admin through this function.

Team leadership should use `assign_team_role`.

Owner, Admin, Director, and Coordinator can assign a member as a Team Leader or Member.

## Onboarding

The first authenticated user can bootstrap a new organization using `bootstrap_organization_owner(name, slug)`. The function creates the organization, ensures a profile exists, and makes that user the active Owner.

## Invitations

`organization_invitations` stores pending invitations. `create_organization_invitation` provides controlled creation of invitations. Email delivery and acceptance UI still need to be wired to an authentication/email workflow.

## Backup and recovery

Reachwell does not pretend that an application table is a substitute for database backup. The production recovery strategy must include:

1. Verify the Supabase plan's managed backup/PITR capabilities before launch.
2. Document restore ownership and emergency contacts.
3. Periodically test recovery in a non-production environment.
4. Provide organization-level export tools for operational portability.
5. Record requested exports, restore requests, and integrity checks in `recovery_jobs`.

No production launch should claim a recovery SLA until the managed Supabase backup settings and restore procedure have been verified.

## Remaining launch-critical work

1. Wire Supabase Auth into the frontend.
2. Build sign-up, sign-in, onboarding, and invitation acceptance screens.
3. Build Owner/Admin people and role-management UI.
4. Build team-lead assignment UI.
5. Connect Mission Mode to live assignments and RPC completion flow.
6. Configure secure Storage buckets for attachments.
7. Configure email delivery for invitations and notifications.
8. Add automated integration/security tests.
9. Deploy a staging environment and test multi-organization isolation.
10. Locate/import the existing Reachwell frontend code before production deployment.
