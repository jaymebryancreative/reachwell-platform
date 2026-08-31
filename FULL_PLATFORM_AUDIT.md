# Reachwell Full Platform Audit

This audit replaces the old "page exists = built" standard. Every module must have complete create, view, edit, search/filter, permissions, persistence, connected relationships, and appropriate export/audit behavior.

## 1. People & Profiles
### Identity
- First, middle, last, preferred name, suffix
- Date of birth (age derived, not manually maintained)
- Contact information and preferred language
- Address
- Marital status
- Household relationships
### Care & safety
- Emergency contact
- Sensitive notes with permission-aware access
- Communication consent/preferences
### Organization context
- Teams and ministry groups
- Roles and permissions
- Skills, availability and tags
- Serving history and last served
- Events/attendance
- Follow-ups, needs and prayer records
- Communication history
### Actions
- Create, edit, archive/restore, search, filter
- Assign/remove teams
- Assign event participation
- Start message/email workflow
- Print/export authorized records

## 2. Teams & Groups
- Built-in and custom teams
- Ministry groups
- Leaders and members
- Roster and availability
- Team channel
- Announcements
- Event/project/task links
- Scheduling and serving history
- Search/filter/archive

## 3. Communication
- Organization announcements
- Team channels
- Event channels
- Project/task discussion
- Direct/group conversations
- Read state, unread counts, notifications, search
- Attachments through authorized storage
- Email composition, provider delivery, delivery history

## 4. Events
- Complete event details, location and timezone
- Event teams and setup teams
- People/rosters and roles
- Scheduling and availability
- Event channel
- Sign-In/attendance and absence reasons
- Follow-ups and outcomes
- Tasks and workspace links

## 5. Mission Mode
- Switch-based entry/exit
- Assignment/route context
- Persistent Note/Need/Prayer per assignment
- Team and overall progress percentages
- Completion and follow-up
- Phone/tablet-friendly controls
- Permission-aware sensitive data

## 6. Workspace
- Projects, goals and milestones
- Tasks with assignees/teams/dependencies
- Event connections
- Status, priority and due dates
- Contextual discussion

## 7. Giving & Finance
- Donor records and giving history
- Funds/campaigns/receipts/statements
- Budgets and budget lines
- Accounts, categories and transactions
- Restricted finance access and approval
- Export/print reporting
- Payment-provider integration architecture

## 8. Settings & Administration
- Organization profile
- Members/invitations
- Roles and granular permissions
- Teams/groups configuration
- Notifications and communication preferences
- Security/recovery
- Files/retention
- Integrations
- Subscription/data continuity

## 9. Data, Files & Continuity
- Authorized file upload/delete
- Organization export jobs
- Print/download workflows
- Cancellation/non-renewal continuity window
- Recovery and audit history

## 10. AI Help
- Context-aware help
- Permission-aware answers/actions
- Clear escalation boundaries
- No exposure of restricted records

## Acceptance rule
No feature is marked complete until the user can perform the real workflow end-to-end and the result persists in organization-scoped storage with authorization enforced server-side.
