# Reachwell Frontend Integration Requirements

## Source of truth
The original Reachwell frontend supplied by the product owner is the starting point for the application interface. Preserve approved functionality while refactoring implementation quality where needed.

## Product direction
The visual system may evolve when doing so improves Reachwell. Do not preserve an interface merely because it already exists. The intended direction is original, professional, mission-focused, dark/light balanced, accessible, and consistent with Reachwell's gradient identity. Avoid copying proprietary layouts, branding, source code, or distinctive protected UI from Planning Center, Monday.com, Jira, QuickBooks, or other products.

## Mandatory operational capabilities

### Organizations and people
- Organization-scoped data and tenant isolation
- Owner, administrator, director, leader and scoped operational roles
- People database and households
- Onboarding and invitations
- Scoped permissions rather than one global role wherever possible

### Teams
- Permanent organization teams
- Event-specific setup teams
- Custom teams for each organization's needs
- Team leaders and membership
- Team communication
- Team-scoped responsibilities

### Communication
- Organization communication
- Team, event and project communication where appropriate
- Private channels
- Announcements
- Message read tracking
- Notifications

### Mission Mode
- Phone and tablet first
- Professionally designed Reachwell-branded Mission Mode header with dark background and gradient identity
- Current Home / Assignment section
- Assignments displayed as selectable buttons directly within that section, not a dropdown
- Note, Need, Prayer and Complete are mutually exclusive selected controls with the active control visibly highlighted
- Completing an assignment adds a check mark to its displayed name and automatically advances to the next assignment
- Submitted notes remain editable for correction with revision/audit history
- Mission workflows must remain touch-friendly and responsive

### Projects and work management
- Simple vocabulary: Projects, Tasks, Milestones, Teams, Owners, Due Dates, Status, Priority, Goals, Outcomes
- No software-development jargon required for normal nonprofit users
- Overview, Work/List, Board, Schedule, Team, Communication, Events, Finance and Impact views as applicable
- Same underlying records across views; no duplicate data systems
- Projects connect to people, teams, events, communication, budgets, goals and impact
- Statuses: Not Started, In Progress, Waiting, Completed
- Project roles: Owner, Manager, Collaborator, Viewer
- Desktop, tablet and mobile responsive behavior

### Events
- Events connect to projects, teams, participants, communication and follow-up work
- Setup teams and custom teams supported

### Finance and giving
- Detailed giving and donor records
- Donor identification and tax-relevant record keeping
- Donations, campaigns, funds, accounts, categories, budgets and transactions
- Merchandise/sales fundraising support
- Future payment-provider and Tap to Pay integrations should use compliant providers and never store card data directly in Reachwell
- Owner/admin reporting and printable/exportable records with finance-specific permissions

### Activity and notifications
- Notifications for assignments, project membership and other relevant operational events
- Audit history for important project/task changes
- Clear activity history for accountable work

## Backend integration rule
Replace demo arrays and browser-localStorage persistence in the original frontend with authenticated Supabase-backed data incrementally. Keep temporary UI behavior only where necessary during migration and label/track remaining demo behavior.

## Security rule
Every live organization-scoped feature must enforce authorization server-side through Supabase RLS and scoped policies. Frontend visibility alone is never sufficient authorization.

## Responsive rule
Core field workflows must work on phones and tablets. Management workflows must remain practical on desktop and adapt gracefully to tablet widths.

## Quality bar
Before production release, test the same workflows under Owner, Admin, Director, Team Leader, Project Manager, Collaborator, Volunteer and Viewer-style scopes where applicable. Verify empty states, loading states, errors, unauthorized access, cross-organization isolation and mobile touch behavior.
