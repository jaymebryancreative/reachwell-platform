# ReachWell Field Workflow Finish Line — Steps 121–140

This checklist is evidence-driven. A step is not complete because a screen exists; it requires persistent organization-scoped behavior, authorization, error handling, responsive behavior, and verification.

| Step | Area | Acceptance criterion | Status |
|---|---|---|---|
| 121 | Sign-In | One canonical attendance write path | In progress |
| 122 | Sign-In | Attendance survives reload and correction | In progress |
| 123 | Sign-In | Duplicate event enrollment is prevented/handled | Backend protected; UI verification pending |
| 124 | Sign-In | Person shows role and team context | In progress |
| 125 | Sign-In | Mobile/tablet roster is field usable | In progress |
| 126 | Mission | ON/OFF transitions are deterministic and cannot retain stale selection | Helper + regression tests added |
| 127 | Mission | Fresh Mission Mode entry starts OFF | Helper invariant added; UI wiring pending |
| 128 | Mission | Assignment visibility follows authorization | Backend RLS verified; UI verification pending |
| 129 | Mission | Assignment opens correct person/household context | Pending |
| 130 | Mission | Objectives persist open → complete | Backend/API exists; regression pending |
| 131 | Mission | Visit persists start → end → outcome | Backend lifecycle hardened; UI regression pending |
| 132 | Mission | Notes retain assignment/organization context | Backend/API exists; field verification pending |
| 133 | Mission | Needs and prayer persist from field workflow | Backend/API exists; field verification pending |
| 134 | Mission | Follow-up retains assignment/person/household context | Backend/API exists; field verification pending |
| 135 | Mission | Completion updates assignment and activity history | Backend automation exists; end-to-end verification pending |
| 136 | Live Ops | Team progress reflects completed work, not active work | Deterministic progress helper + tests added |
| 137 | Live Ops | Realtime changes reconcile across clients | Realtime enabled; multi-client verification pending |
| 138 | Safety | Back Up alert lifecycle is reliable | Backend policies exist; field verification pending |
| 139 | Relationships | Person/household timeline exposes connected operational history | Pending |
| 140 | QA | Full field workflow passes end-to-end | Pending browser/device field test |

## Current evidence

- Supabase migration history contains the field-work lifecycle, realtime, permission, finance, and event/team integrity migrations through `20260902142540`.
- Live RLS inspection confirms sensitive field-work policies are `authenticated` and assignment objective/visit access is scoped.
- Live duplicate event/team pair check is zero.
- A deterministic field-work state helper and Vitest regression suite cover Mission Mode reset/selection and completed-work progress semantics.
- The branch's latest Vercel status is currently pending; it must be green before the latest changes are considered verified.
