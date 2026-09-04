# ReachWell 1.0 — Finish Line

Updated: 2026-09-03

## Canonical architecture

- **GitHub:** reproducible application source, migrations, tests, and documentation.
- **Supabase:** production PostgreSQL, authentication/session infrastructure, RLS, storage, and realtime data layer.
- **Floot:** rapid UI/design iteration and visual direction. The current Floot project is the design reference, but production-critical behavior must remain represented in GitHub/Supabase.
- **Vercel:** preview/production hosting for the GitHub application.

## Product completion rule

A feature is not complete because its screen or button exists. A release-ready feature must pass the relevant create/view/edit/search/filter/connect/persist/reload/permission/error/empty/responsive/audit checks.

## Current state

### Foundation — substantially complete

- Organization and membership model
- People and households
- Multi-team membership
- Scoped team/project/event leadership
- Projects with multiple teams
- Events, participants, assignments and attendance model
- Outreach field model
- Notes, needs, prayer and follow-ups
- Communication model
- Giving and finance model
- Notifications
- Audit trail
- Files and exports foundations
- RLS across public application tables

### Operations — substantially complete, final verification required

- Today Command Center
- Assignment Command Center
- Team Progress
- Relationship Health
- Connected History
- Follow-Up Center
- Mission Mode field workflows
- Safety/Back Up alerts
- Realtime field operations
- Money Trail
- Finance Reporting

### Finalization work

1. Authentication UX and session lifecycle verification.
2. Organization-context verification for authenticated users; no environment-selected organization as a source of truth.
3. Complete People → Teams → Events → Attendance vertical slice.
4. Complete Events → Sign-In → Attendance persistence vertical slice.
5. Complete Event → Assignment → Visit → Note/Need/Prayer → Follow-up → History Mission Mode slice.
6. Complete contextual communication and notifications.
7. Complete Projects → Teams → Tasks → Events → Impact connections.
8. Complete Giving/Finance → Money Trail → Reporting permissions and exports.
9. Complete Administration → members → scoped access → audit → exports.
10. Run browser-level end-to-end tests on desktop, tablet, and phone-sized viewports.
11. Run cross-organization isolation tests with separate authenticated users.
12. Run realtime and network-failure tests for field operations.
13. Resolve only performance findings that are demonstrated bottlenecks; do not remove useful indexes solely because the current low-volume database has not used them yet.
14. Review and consolidate redundant permissive RLS policies only after verifying that the combined predicates preserve the existing scoped-access semantics.
15. Run production build and deployment smoke tests.
16. Conduct a real controlled field pilot before declaring 1.0.

## Acceptance gates

### Gate A — Identity

- [ ] Sign in
- [ ] Sign out
- [ ] Session survives reload
- [ ] Password recovery
- [ ] Authenticated user without membership gets a safe access state
- [ ] Membership determines organization context
- [ ] No secret is exposed client-side

### Gate B — Core records

- [ ] Person CRUD persists
- [ ] Household relationships persist
- [ ] Person can belong to multiple teams
- [ ] Team-specific role remains scoped
- [ ] Project can contain multiple teams
- [ ] Project leadership does not grant organization-wide access

### Gate C — Event operations

- [ ] Event CRUD persists
- [ ] Teams connect to events
- [ ] People connect to event rosters
- [ ] Sign-In selects an event
- [ ] Present/Not Present/Late/custom status persists
- [ ] Absence reason persists
- [ ] Mistaken attendance can be corrected
- [ ] Attendance appears in person history

### Gate D — Mission Mode

- [ ] Mission Mode starts OFF
- [ ] Toggle enters full-screen field experience on small screens
- [ ] Assignment/location is visible
- [ ] Objectives can be completed
- [ ] Team progress updates
- [ ] Note survives category switching
- [ ] Need survives category switching
- [ ] Prayer survives category switching
- [ ] Follow-up can be created from field activity
- [ ] Back Up alert is selectable and safe from accidental activation
- [ ] Reload preserves completed field work
- [ ] Realtime updates work across authorized users

### Gate E — Connected care

- [ ] Relationship Health reflects real data
- [ ] Connected History shows relevant activity
- [ ] Follow-up status and ownership persist
- [ ] Completing an assignment produces the intended history
- [ ] Sensitive notes/needs/prayer obey authorization

### Gate F — Communication

- [ ] Team/project/event communication is contextual
- [ ] Messages persist
- [ ] Search works
- [ ] Read/unread state works
- [ ] Notifications are permission-scoped

### Gate G — Finance

- [ ] Giving records persist
- [ ] Donor history works
- [ ] Funds/designations work
- [ ] Receipts/annual statements obey finance permissions
- [ ] Money Trail identifies actor, amount, date, and status
- [ ] Reporting is restricted to authorized users
- [ ] Exports are authorized and auditable

### Gate H — Administration

- [ ] Member management works
- [ ] Invitations work
- [ ] Scoped roles work
- [ ] Audit history works
- [ ] Files obey access rules
- [ ] Organization isolation passes with two test organizations

### Gate I — Reliability

- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Slow-network behavior
- [ ] Session expiry
- [ ] Duplicate-submit protection where needed
- [ ] Desktop responsive pass
- [ ] Tablet responsive pass
- [ ] Phone responsive pass
- [ ] Browser E2E suite passes
- [ ] Production build passes

## Current database quality notes

The production Supabase project currently has a clean security-advisor result. The performance advisor currently reports unused-index INFO findings and multiple-permissive-policy WARN findings. Unused indexes are not automatically defects while usage volume is low; they should be reviewed against query plans before removal. Multiple permissive policies should be consolidated carefully because policy semantics are security-sensitive even when the advisor categorizes them under performance.

## Release rule

Do not label ReachWell 1.0 complete until the acceptance gates above have been verified against the real application and database. A passing build alone is not a release certificate.
