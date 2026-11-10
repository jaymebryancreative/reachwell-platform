# ReachWell — Build Vision & Product Blueprint

**Tagline:** Outreach made simple.  
**Status:** Strategic product target; feature availability and production readiness must be verified against code and database.

## 1. Vision

ReachWell is the connected operating system for outreach and community impact. It helps churches, faith-based nonprofits, and compatible community organizations understand who they serve, coordinate the people who serve, run events and field activity, respond to needs, maintain relationships, steward resources, and measure outcomes.

The product connects people, households, teams, events, assignments, visits, care, follow-ups, communication, giving, and reporting through shared records, permissions, and history.

**Primary market:** churches and faith-based nonprofits. Keep the architecture configurable for broader nonprofit/community use without diluting ministry-first workflows.

## 2. Purpose and outcomes

- **Coordinate outreach:** plan initiatives, assign teams, schedule work, and coordinate field activity.
- **Build relationships:** maintain people and household records, interaction history, needs, prayer requests, and follow-ups.
- **Run organized events:** manage setup, registration, check-in, waivers, attendance, and historical records.
- **Support teams:** coordinate employees and volunteers with scoped roles, schedules, assignments, communication, and goals.
- **Practice stewardship:** record giving, maintain donor histories, generate statements, and support reconciliation/export.
- **Learn and improve:** report on activity, engagement, follow-through, event outcomes, goals, and community impact.

## 3. Product principles

1. People before records: preserve relationship context, not just data.
2. Connected by design: shared entities and workflows reduce duplicate entry.
3. Mobile-first field use: Mission Mode and check-in work well on phones and weak connections.
4. Least privilege: scope access by organization, team, event, responsibility, and sensitivity.
5. Reliable before clever: persistence, auditability, clear errors, and recoverable workflows.
6. Accessible, calm UI: simple navigation, readable contrast, consistent controls.
7. Honest product states: unfinished features are never represented as operational.

## 4. Feature systems and functions

### A. Organization and administration
- Organization profiles, campuses, legal/contact details, preferences, and branding.
- Member invitations, onboarding, account lifecycle, organization switching, and owner bootstrap.
- Separate platform roles from scoped operational permissions; delegate by team, event, or module.
- Subscription plans, entitlements, usage limits, billing status, and feature availability.
- Audit history for sensitive actions, permission changes, exports, and financial corrections.

### B. People and households
- Individual profiles: contact details, preferred contact method, status, tags, custom fields, and consent.
- Household records, addresses, members, family relationships, and shared contact context.
- Interaction timeline for attendance, visits, notes, needs, prayer, and follow-ups.
- Search, filters, duplicate detection/merge, bulk import/export, and data correction.
- Privacy-aware notes and sensitive fields with access logging and retention controls.

### C. Teams, workforce, and goals
- Employee and volunteer profiles, team membership, leaders, role assignments, availability, and schedules.
- Work assignments with owner, due date, status, priority, related person/event/project, and activity history.
- Team communication and shared operational views.
- Organization, ministry, team, quarterly, and annual goals with milestones, owners, metrics, and progress.
- Scoped permissions so a team leader can manage their team without organization-wide authority.

### D. Mission Mode and field outreach
- Mobile-first assignment queue with map/address context where permitted and useful.
- Capture a person or household, visit outcome, notes, needs, prayer requests, and next action.
- Create follow-ups directly from a visit and assign them to a person or team.
- Track assignment status, visit history, team progress, safety alerts, and completion details.
- Offline-capable capture with queued sync, conflict handling, and visible sync status.
- Optional location capture with explicit policy and user consent.

### E. Events and Sign-In Mode
- Events with dates, locations, capacity, registration, event teams, and event-specific permissions.
- Attendee/volunteer check-in, attendance corrections and reasons, bulk actions, and exports.
- Digital waiver templates, versioned consent text, signed records, timestamps, and retrieval.
- Event history linked to People profiles.
- Post-event reports for attendance, volunteer participation, follow-ups, and outcomes.
- Sign-In Mode remains an event workspace, not a competing top-level navigation system.

### F. Giving and financial accountability
- Gifts by donor, date, amount, fund/campaign, payment method, and transaction reference.
- Online giving through an established processor; never store card details.
- Recurring gift metadata, donor history, corrections, refunds, and reconciliation workflows.
- Annual donor statements and exports with organization identity and contribution detail.
- Distinguish donations from event fees, purchases, benefits, and noncash contributions.
- Financial permissions and audit trails separate from general outreach access.

**Tax safeguard:** annual statements and deductibility rules require qualified nonprofit accountant/tax-professional review. ReachWell supports accurate records and disclosures; it must not imply every payment is tax-deductible.

### G. Communication and notifications
- Team channels, direct messages, announcements, and organization communication spaces.
- Membership-aware access, participant management, unread state, read tracking, and preferences.
- Secure attachments and authorized search.
- Event reminders, assignment alerts, follow-up reminders, and configurable workflows.

### H. Reporting, insights, and AI
- Dashboards for people engagement, household reach, event attendance, field activity, follow-up completion, team capacity, and goals.
- Exportable operational and financial reports with role-based visibility.
- AI summaries, overdue follow-up signals, staffing gaps, event outcome summaries, and goal-planning assistance.
- AI respects existing permissions, references source records where possible, avoids autonomous sensitive decisions, and keeps a human accountable.

## 5. Connected workflows

- **Outreach → relationship:** a visit creates/updates a person or household, stores the outcome, records needs/prayer, and creates an assigned follow-up.
- **Event → ongoing care:** check-in links attendance to a profile; requested support becomes an owned follow-up.
- **Team → execution:** goals/projects create assignments; completion rolls progress into team and organization views.
- **Giving → stewardship:** gifts link to donor and fund; corrections are auditable; statements and reconciliation remain traceable.
- **Communication → action:** messages reference events, assignments, and follow-ups without bypassing access rules.

## 6. Proposed subscription model

Capability-based tiers: organizations pay for operational complexity and advanced capabilities—not simply for how many people they serve. Keep essential outreach accessible to smaller ministries.

| Plan | Intended fit | Included capabilities |
|---|---|---|
| **Essential** | Small churches and volunteer teams | People/households; basic teams; events and attendance; basic communication; limited Mission Mode; basic reports; core permissions. |
| **Growth** | Active outreach and multi-team operations | All Essential; advanced Mission Mode and follow-ups; household history; event waivers and advanced controls; goals/objectives; advanced permissions; giving records/statements; expanded reporting. |
| **Impact** | Larger or more complex organizations | All Growth; advanced automation; AI assistance; advanced finance/impact reporting; multi-campus; integrations; custom workflows. |
| **Enterprise** | Networks and large multi-site organizations | Custom onboarding; organization-wide governance; advanced integrations; negotiated usage/service terms; enhanced support and implementation. |

**Pricing is not fixed in this blueprint.** Final pricing requires competitor research, customer interviews, willingness-to-pay tests, payment/infrastructure costs, support burden, and value validation. Publish clear limits and avoid surprise overages.

### Entitlements and billing rules
- Build entitlements into the architecture early, even while features remain free during development.
- Enforce entitlements server-side; hiding a button is not access control.
- Support trial, active, past-due, grace-period, cancelled, and grandfathered states.
- Use usage limits only where they map to real cost or value.
- Do not paywall basic safeguarding, privacy, data export, or essential record access in a way that traps organizations.

## 7. Delivery roadmap

1. **Foundation and audit:** verify codebase, schema, RLS, permissions, deployment, tests, design system, environments, and observability.
2. **People and relationships:** complete people/households, relationships, contact history, notes, needs, prayer, follow-ups, consent, dedupe, import/export.
3. **Teams and permissions:** complete employees/volunteers, membership, schedules, assignments, scoped roles, and team communication access.
4. **Mission Mode:** harden mobile workflows, visit capture, follow-up creation, progress, safety, offline sync, and reliability.
5. **Events and sign-in:** complete event administration, registration, check-in, waivers, corrections, history, and reporting.
6. **Giving and finance:** processor integration, giving records, donor histories, statements, corrections/refunds, and reconciliation.
7. **Goals and accountability:** goals, milestones, objectives, progress rollups, and dashboards.
8. **Communication and automation:** chat, announcements, notifications, reminders, and configurable workflows.
9. **AI and intelligence:** permission-aware summaries, trend analysis, recommendations, and report assistance.
10. **Launch and scale:** subscriptions, onboarding, docs, support, security/privacy, monitoring, load tests, and native apps when justified.

## 8. Technical and quality standards

- Preserve existing React + TypeScript, Supabase/PostgreSQL, GitHub, and Vercel unless audit evidence supports change.
- Use organization-scoped records, foreign keys/indexes, and RLS on exposed data.
- Enforce sensitive authorization server-side/database-side; never rely on client role checks alone.
- Use migrations for schema changes and keep migration history reproducible.
- Protect secrets; never expose service-role credentials in browser code or commit them.
- Test core workflows and permission boundaries with representative roles, including negative unauthorized-access tests.
- Require build, lint, automated tests, preview acceptance, production checks, monitoring, and rollback planning.
- Scale from measured query patterns, indexes, pooling, storage, background work, and observability.

## 9. AI-assisted engineering workflow

Use one primary repository-level coding agent (Codex) for scoped implementation. Use an independent reviewer for architecture, security, and code review—not parallel uncontrolled edits.

**Release gates:** define requirement and acceptance criteria → inspect current implementation/schema/permissions → design data/API/UX/migration → implement on a branch → run build/lint/tests/permission checks → independent review → preview acceptance → production deployment, monitoring, and rollback readiness.

## 10. What not to build yet

- Full payroll or accounting replacement.
- Custom payment processing or card-data storage.
- Complex HR, social network, or broad integration marketplace.
- Autonomous AI agents making sensitive decisions or contacting people without approval.
- Native apps before mobile web workflows are stable and validated.

## 11. Immediate next steps

1. Audit active frontend branch, repository history, build/test workflows, Supabase schema/migrations, RLS, functions, storage, and production deployment.
2. Resolve source-of-truth discrepancies between branches and documentation before feature work.
3. Create a feature inventory: verified complete, partial, planned, blocked, and needs validation.
4. Turn the roadmap into epics, acceptance criteria, dependencies, and a prioritized backlog.
5. Fix high-risk security, data integrity, and broken core workflows before expanding scope.
6. Validate with churches/outreach organizations; field-test Mission Mode and event workflows.
7. Set launch criteria for workflow success, permission tests, reliability, response times, support, and onboarding.

**North-star outcome:** an organization can plan outreach, mobilize people, engage households, run events, respond to needs, follow through, steward resources, and understand its impact—all in one trustworthy system.
