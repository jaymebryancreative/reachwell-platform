# Reachwell Connected Operations Architecture

## Product principle

**Connected by default. Optional when unnecessary.**

Reachwell is a mission-operations platform, not a collection of isolated tools. People, teams, projects, events, communication, assignments, finance, and impact may connect through explicit relationships while remaining independently usable.

## Core relationship model

- Organizations own all tenant-scoped records.
- People can participate in multiple teams, projects, events, and assignments.
- Teams can be permanent organization teams or event-specific teams.
- Projects can connect to people, teams, tasks, events, channels, budgets, campaigns, and outcomes.
- Events can connect to projects, teams, participants, assignments, communication, and follow-up.
- Tasks can be assigned to people and/or teams and can belong to a project and optionally an event.
- Communication channels can be scoped to an organization, team, event, project, or assignment.
- Finance records remain permission-scoped even when connected to projects or events.

## Simple work-management vocabulary

Reachwell uses familiar operational language rather than software-development jargon:

- Project
- Task
- Milestone
- Owner
- Team
- Due date
- Status
- Priority
- Goal
- Outcome

Default task statuses:

1. Not Started
2. In Progress
3. Waiting
4. Completed

## Views are projections of the same data

A project may expose:

- Overview
- Work (list)
- Board
- Schedule
- Team
- Communication
- Events
- Finance (authorized users only)
- Impact

Views must not create duplicate records. They are alternate presentations of the same underlying work.

## Permission principle

Access follows responsibility and scope.

A person may be a volunteer organization-wide, a leader for one team, an event manager for one event, and a project collaborator for one project. Those scoped responsibilities must not automatically grant organization-wide administration.

## Mobile-first field operations

Mission Mode and event execution are designed for phones and tablets first. Management views progressively enhance for larger screens. Desktop-only assumptions are prohibited for core field workflows.

## Originality and legal guardrails

Reachwell may study market capabilities and public workflows but must not copy proprietary source code, branding, visual assets, distinctive screen layouts, or protected text from other products. Product terminology, visual identity, implementation, and interaction design should remain independently created for Reachwell.

## Production rule

No feature is considered production-ready solely because a database table or frontend mockup exists. Production readiness requires appropriate authorization, tenant isolation, validation, error handling, auditability where appropriate, responsive usability, and real-world testing.
