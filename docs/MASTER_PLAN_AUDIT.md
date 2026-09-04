# ReachWell Master Plan Audit

This document is the release gate for the ReachWell master build plan. A feature is not considered complete merely because a UI exists; it must be persistent, organization-scoped, permission-aware, connected to related records, resilient to reload/error states, and appropriate for its target device.

## Release gates

- Foundation: organization isolation, authentication, memberships, roles, scoped leadership.
- People: complete profiles, households, teams, roles, history, search/filter/archive/restore/export.
- Teams: CRUD/archive, membership, scoped roles, leadership, events/projects/tasks/communication/serving connections.
- Events and scheduling: event CRUD, teams, rosters, assignments, attendance, availability and serving history.
- Sign-In Mode: event selection, participant search, Present/Not Present/Late/Other, absence reasons, persistence/history.
- Mission Mode: assignments, locations/routes, team and overall progress, Note/Need/Prayer state preservation, follow-ups, people/teams connections, safety/back-up.
- Care: notes, needs, prayer, follow-ups, assignment/status tracking, sensitive-record authorization and relationship history.
- Projects: projects, leads, members, tasks, people/teams, status/priority/dates/progress, events/files/communication, scoped permissions.
- Communication: organization/team/event/project/task/direct/group communication, search/history/read state/notifications/mentions/attachments/membership, and real email provider delivery when enabled.
- Giving: donors, gifts, history, funds/designations, payment method, receipts/tax records, search/filter/report/export.
- Finance: accounts/categories/budgets/expenses/transactions/reporting with restricted finance permissions and export/print.
- Payments/fundraising: provider-based architecture; no unnecessary card-data storage; online giving/fundraising/merchandise/tap-to-pay where provider-supported.
- Impact: connected outreach, mission, team, serving, attendance, event and follow-up reporting.
- Files: secure organization-scoped storage, authorized access/deletion, ownership and history.
- Continuity: authorized data export/retrieval and subscription/cancellation continuity.
- Settings: organization, members, invitations, roles/permissions, teams, notifications, communications, security, data controls, integrations and billing surfaces as applicable.
- Notifications: operational producers, recipient scoping, preferences, mentions, assignments and event/follow-up changes.
- AI: permission-aware contextual Help Center/assistance; no fake provider behavior.
- Integrations: real provider configuration/status/error handling; no false success states.
- UX: desktop/tablet/mobile responsive behavior, touch targets, field usability, ReachWell visual system.
- Security: RLS, org isolation, scoped authorization, SECURITY DEFINER search_path/grants, safe errors, auditability, no client secrets.
- Persistence: reload/close/reopen survival for all material records; loading, empty and failure states.
- QA: automated build/lint/tests plus authenticated end-to-end acceptance where the available tooling permits it. No claim of browser E2E without browser evidence.

## Certification rule

Green means implemented and verified. Yellow means implementation exists but complete acceptance evidence is still required. Red means missing or non-production. The release decision must remain blocked while any material requirement is Yellow/Red.
