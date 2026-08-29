# Reachwell AI Assistant Architecture

## Purpose

The AI Assistant is a permission-aware help, troubleshooting, and operations layer. It must not function as an unrestricted database chatbot.

## Modes

1. **Help** — explains features and guides users through workflows.
2. **Troubleshooting** — checks approved diagnostics and explains common problems.
3. **Operations** — for authorized leaders, summarizes approved operational information.
4. **Proposed Actions** — AI proposes a change; the user explicitly confirms before execution.

## Required request flow

```text
User
  -> Authenticated app session
  -> Supabase Edge Function
  -> Validate user/session
  -> Resolve organization + permissions
  -> Select approved tools/context
  -> AI model
  -> Answer or proposed action
```

The browser must never contain an AI provider secret.

## Tooling principle

Never expose unrestricted SQL or a service-role database client to the model. Approved tools should be narrow, permission-aware operations such as:

- `search_help_articles`
- `get_my_overdue_followups`
- `get_assignment_status`
- `get_event_staffing_status`
- `get_project_health`
- `get_team_workload`

Each server-side tool must independently enforce the authenticated user's organization membership and permissions.

## High-impact actions

The AI may explain or prepare actions, but these require explicit confirmation and/or elevated safeguards:

- permanent deletion
- organization ownership changes
- permission elevation
- sensitive financial actions
- serious safety incident decisions

## Auditability

Log important AI-proposed and AI-executed actions with:

- organization id
- user id
- tool/action type
- timestamp
- confirmation state
- outcome

Do not log more sensitive content than is necessary for support and auditing.

## Implementation stages

### Stage 1 — Help Center
Knowledge-grounded answers about platform features.

### Stage 2 — Diagnostics
Approved checks for common user and configuration issues.

### Stage 3 — Operations Copilot
Permission-filtered summaries and prioritization for leaders.

### Stage 4 — Confirmed Actions
The assistant proposes actions; users explicitly approve execution.
