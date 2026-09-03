# ReachWell Permission Matrix

This matrix is the launch-audit baseline. Database RLS remains authoritative; UI visibility must not be treated as authorization.

| Area | Owner/Admin/Director | Coordinator | Team Leader | Member/Volunteer |
|---|---|---|---|---|
| People | Manage | Manage | Manage scoped to team | Read organization |
| Teams | Manage | Manage | Manage scoped to team | Read organization |
| Events | Manage | Manage | Read / scoped operations | Read organization |
| Attendance | Manage | Manage | Manage | Read own/event-visible |
| Assignments | Manage | Manage | Manage | Update assigned work |
| Objectives | Manage | Manage | Manage | Read; completion requires verified policy |
| Visits | Manage | Manage | Manage | Create/update org-scoped visit |
| Notes | Manage | Manage | Manage | Create own; private notes remain restricted |
| Needs | Manage | Manage | Manage | Create/manage own or owned needs |
| Prayer | Manage | Manage | Manage | Create/manage own requests; private requests restricted |
| Follow-ups | Manage | Manage | Manage | Manage assigned/created follow-ups |
| Safety alerts | Manage | Manage | Manage | Create/read org-scoped alerts |
| Communication | Manage | Channel management | Team/channel access | Accessible channels |
| Finance | Full finance access when explicitly authorized | Explicit finance access only | Explicit finance access only | No implicit finance access |
| Audit | Read | No implicit access | No implicit access | No access |
| Notifications | Own | Own | Own | Own |

## Verification rules

1. Every write must be enforced by RLS or an explicitly authorized server-side function.
2. Organization ownership must be checked through the organization relationship, never only through a client-supplied organization ID.
3. Team-scoped writes must verify the user's active team leadership/membership relationship.
4. Finance access is explicit and is not granted merely because a UI route exists.
5. Private notes and prayer requests require the additional author/role predicate defined by their RLS policies.
6. Historical memberships must remain readable without allowing ended memberships to become active authorization paths.
7. Tests should cover both allowed and denied cases for each sensitive write surface before launch.
