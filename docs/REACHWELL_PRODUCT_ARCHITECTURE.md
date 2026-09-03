# ReachWell Product Architecture

## Canonical relationship chain

ReachWell treats operational data as one connected system:

**Organization → Person → Household → Team → Project → Event → Assignment → Mission Activity → Follow-Up → Outcome → History**

Not every record must use every link. The rule is that when a relationship exists, the product should preserve it rather than creating a disconnected copy.

## Identity rules

- `auth.users` represents a login identity.
- `people` represents the person an organization serves, schedules, communicates with, or records attendance for.
- A Person does not need a login account.
- A Household groups people who share a household relationship/address.
- Team membership is represented separately from login identity so a person can serve on multiple teams.
- Event participation can reference a Person without requiring that person to have an account.

## Operational rules

1. Organization scope is always enforced server-side/database-side.
2. Team leadership does not imply organization administration.
3. Assignments may target a person and/or household and may be assigned to a team and/or user.
4. Mission Mode is a field interface over real assignments, not a separate task system.
5. Notes, Needs, Prayer, Visits, Objectives, and Follow-Ups retain their assignment relationship when one exists.
6. Activity history is durable and generated from operational mutations rather than relying on client-only state.
7. Completed work remains queryable for history and reporting.

## Source of truth

- **GitHub:** application code and migration source.
- **Supabase:** production relational data, authorization policies, and database execution.
- **Floot:** product/design iteration and hosted app experience; changes that become production application behavior must be reconciled into the canonical codebase.

## Completion standard

A significant feature is complete only when its UI, persistence, authorization, validation, connected records, reload behavior, loading/empty/error states, and appropriate history/audit behavior have been verified.
