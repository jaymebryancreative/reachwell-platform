# ReachWell Product Reset and Engineering Audit

Date: 2026-10-20
Status: In progress
Working branch: build/product-reset-audit-20261020
Baseline: production branch at ff20cb386004227e6d4da24b570ddbfc3c1d4dfb

## Product north star

ReachWell is a connected operating platform for nonprofits, ministries, and community-serving teams. Its defining job is to turn plans and field activity into coordinated action, accountable follow-through, and credible outcomes.

The core loop:
1. Identify a person, household, community need, or organizational objective.
2. Assign an authorized owner/team and define the next action.
3. Carry out work in events, projects, and Mission Mode.
4. Capture the activity once, against the right operational records.
5. Create and track follow-up commitments until resolved or intentionally closed.
6. Report activity separately from outcomes, with provenance and privacy controls.

## Non-negotiable engineering rules

- GitHub is the source of truth for application code and migration source.
- Do not rewrite production, force-push, merge an old/diverged branch, or change production data as part of this reset.
- Preserve existing useful database and security work. "Starting from scratch" means resetting the product direction and quality bar, not destroying the live data or foundation.
- Work on this dedicated branch and use reviewed pull requests for integration.
- Never commit secrets, service-role keys, real constituent data, or credentials.
- No database migrations or live-data changes until the Supabase project is active, the target environment is confirmed, and the proposed migration is reviewed.
- Do not label a workflow complete until persistence, authorization, error/loading states, reload behavior, and relevant tests are verified.
- Do not advertise offline support until queued writes, retries, duplicate protection, conflict handling, and visible sync status are implemented and tested.
- Treat pastoral, prayer, family, safeguarding, and financial records as sensitive. Enforce least privilege in the database/server, not only in the UI.
- Do not finalize subscription prices until current implementation, cost drivers, competitor positioning, and customer willingness-to-pay are assessed.

## Audit workstreams

### 1. Source-of-truth and release path
- Compare production, main, and active feature branches.
- Inspect open pull requests and identify any unmerged security or operational work.
- Confirm which branch Vercel builds and which deployment/domain is actually live.
- Keep production untouched during audit.

### 2. Application inventory
- Enumerate routes, screens, shared components, data-access modules, API calls, and feature flags.
- Map every visible action to its implementation and persistence path.
- Identify placeholders, local-only state, duplicated data models, dead navigation, and inconsistent loading/empty/error handling.
- Inspect onboarding, authentication, organization context, user/role administration, settings, and billing.

### 3. Data and security
- Verify Supabase project status and access before attempting live inspection.
- Compare migration history with repository migrations and current schema when access is restored.
- Review RLS for organization isolation, role and team scope, sensitive data, storage, exports, and financial records.
- Review security/performance advisor findings, indexes, foreign keys, RPC grants, triggers, and audit trails.
- Never infer production safety from a passing static check alone.

### 4. Mission Mode and field operations
- Validate assignment selection, objectives, visit lifecycle, Notes/Needs/Prayer/Follow-up actions, backup requests, team progress, and safety escalation.
- Verify each action is authorized, saved, reload-safe, attributable, and reflected in connected views.
- Design for one-handed mobile use, poor connectivity, retries, idempotency, conflict resolution, and explicit sync status.
- Ensure an assignment location does not grant broad access to a person's complete profile.

### 5. Connected operations and impact
- Test the end-to-end mission-to-outcome loop.
- Verify event attendance, project/task ownership, communication notifications, follow-up queues, finance trails, exports, and history.
- Separate activity measures from outcomes and ensure reports trace back to authorized source records.

### 6. Plans and pricing
- Inventory current plan configuration, entitlements, usage limits, checkout/subscription logic, and upgrade/downgrade/cancellation flows.
- Propose plan boundaries around organizational complexity and advanced capability, not merely volunteer headcount.
- Keep core fieldwork, basic exports/data portability, and essential privacy controls available at appropriate levels.
- Do not alter billing configuration until the audit and pricing proposal are approved.

### 7. Quality gates
- Run and record build, lint, unit tests, and end-to-end checks where the environment allows.
- Add regression tests for high-risk workflows and organization isolation.
- Verify mobile/tablet/desktop behavior, accessibility, and readable light/dark states.
- Document failures and limitations honestly; do not claim unrun tests passed.

## Implementation sequence

1. Establish the correct source branch and deployment target.
2. Complete source, workflow, permission, and billing inventories.
3. Resolve environment/access blockers and verify the real backend state.
4. Fix high-risk security, data-loss, and misleading placeholder behavior.
5. Deliver one fully tested mission-to-outcome workflow end to end.
6. Build the broader Mission Mode 2.0 and follow-through engine.
7. Add impact reporting and validated subscription entitlements.
8. Conduct release-readiness and controlled field testing.

## First observed blocker

On 2026-10-20, Supabase project `qxjbzajxgeyqcarnxkkr` was returned by the connected project listing with status `INACTIVE`. Security and performance advisor calls returned empty lint lists, but those results do not prove that the database is active or that production workflows have been tested. No database writes should be attempted until project status/access and the intended environment are confirmed.

## Definition of done for each workflow

- A user can complete the task with the correct role.
- The data persists server-side and remains correct after reload and on another authorized session.
- Cross-organization and out-of-scope access are denied server-side.
- Loading, empty, success, validation, network failure, and retry states are understandable.
- Connected records and audit history update consistently.
- Automated tests cover success, failure, and permission boundaries.
- Documentation reflects the shipped behavior, not planned behavior.
