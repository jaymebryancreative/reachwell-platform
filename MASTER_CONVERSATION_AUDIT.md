# Reachwell — Master Conversation-to-Platform Audit

This document converts the agreed product direction into implementation requirements. A requirement is not complete because a screen exists; it requires a usable workflow, persistent organization-scoped data in production, authorization, validation, responsive behavior, and connected records where applicable.

## 1. Product identity and experience
- Original Reachwell visual identity and terminology; do not copy competitor UI/code/branding.
- Calm, premium, approachable experience inspired by what users like about modern consumer software without copying a specific product.
- Large, readable navigation; rounded, visible surfaces; generous touch targets.
- Purple/violet/pink gradient accents used consistently without making the product visually noisy.
- Responsive desktop, tablet and phone layouts.
- Field Mode optimized especially for phone and tablet.

## 2. Navigation and modes
- Today is the default home.
- Organization identity is clickable for organization details.
- Mission Mode and Sign-In Mode are prominent top-level switch controls.
- Click/touch friendly; only one mode active at once.
- Turning either switch off returns automatically to Today.

## 3. People and profiles
- Full create/view/edit profile workflow, not a single-name prompt.
- Identity: first/middle/last/preferred name, photo, birthday and calculated age, marital status.
- Contact: email, phone, address, preferred contact method, emergency contact.
- Relationships: household/family relationships and ministry/custom groups.
- Engagement: teams, roles, skills, interests, availability, serving history, event history, attendance, communication history, authorized follow-ups/notes.
- Actions: assign/remove teams and roles, schedule, message, email, archive/restore, authorized export/print.
- Search, filters, tags and useful saved views.
- Sensitive fields visible only to authorized roles.

## 4. Teams and ministry groups
- Create/manage custom teams and groups.
- Leaders, coordinators, members and rosters.
- Search/filter teams and people.
- Team progress, schedules, events, projects/tasks and serving context.
- Dedicated team communication.

## 5. Communication
- Organization announcements.
- Dedicated team channels.
- Direct messages and group conversations.
- Event conversations and project/task discussions.
- History, search, read/unread state, notifications, mentions and authorized attachments.
- Message/email actions available from appropriate profiles and records.
- Production email delivery must use a configured provider with delivery records and preferences.

## 6. Events and scheduling
- Create/edit events with date, location, details and connected teams.
- Rosters and people assignments.
- Scheduling informed by serving history/availability.
- Event-specific communication.
- Attendance and follow-up workflows.

## 7. Sign-In Mode
- Top switch launches mode.
- Select the event being used.
- View people already added to that event.
- Present / not present / reason selection / custom reason.
- Persistent attendance records.
- Switch off returns to Today.

## 8. Mission / Field Mode
- Top switch launches touch-friendly field experience.
- Note, Need and Prayer inputs retain separate text while moving between categories before completing the assignment.
- Selecting a category clears the visible editor for that category while preserving text entered in the others.
- Team progress and overall mission progress remain visible, including percentages.
- Completion, follow-up and persistent records.
- Phone/tablet friendly operation.
- Switch off returns to Today.

## 9. Workspace and project management
- Simple, non-technical project management inspired by the clarity users value in Jira/Monday-style workflows without copying them.
- Projects, tasks, statuses, assignees, due dates and priorities.
- Connected to teams, people, events and communication when relevant.
- Workspace opens directly rather than showing an unnecessary intermediate 'Open Workspace' screen.

## 10. Giving, donations and finance
- Donors and detailed giving history.
- Who gave, amount, date, fund/designation, receipt/tax record context.
- Budgets, spending, categories, accounts and reporting.
- Owner/admin financial permissions and audit history.
- Print/download/export reporting.
- Evaluate secure account/payment integrations and approved providers for online giving, fundraising and merchandise; do not store raw payment card data.
- Tap-to-pay/point-of-sale support only through an appropriate compliant payment provider/integration.

## 11. Files, records and continuity
- Organization file/document management and authorized deletion.
- Access controls and auditability.
- Detailed export/print capability for important records.
- Subscription cancellation/non-renewal continuity workflow that gives organizations a reasonable opportunity to export/print important information before data-access changes, subject to the published retention policy.

## 12. Settings and administration
- Clean Apple-inspired information architecture without copying Apple's UI.
- Organization profile, members/invitations, roles/permissions, teams/groups.
- Communication/notification preferences.
- Security, recovery and audit history.
- Integrations, billing/subscription and data controls.
- Every settings item must open a real workflow or clearly indicate that it is not yet available.

## 13. AI Help Center
- Context-aware help based on the platform's actual capabilities.
- Permission-aware answers.
- Real-time help for minor/medium issues, safe recommendations and escalation paths.
- Must not expose sensitive organization information to unauthorized users.

## 14. Production quality gates
For every feature: Create, Read, Update, appropriate Archive/Delete, validation, persistence, organization isolation, server-side authorization, responsive layout, loading/error/empty states, accessibility and audit logging where warranted.

## Priority implementation sequence
1. Visual shell consistency + restore exact mode-switch interaction.
2. Complete People and profile workflows.
3. Teams/groups and membership.
4. Connected communication.
5. Events, scheduling and Sign-In.
6. Mission/Field Mode persistence and follow-up.
7. Workspace connections.
8. Settings and permissions.
9. Finance/giving/reporting/payment integrations.
10. Files/data continuity and AI Help.
