# Reachwell Frontend Rebuild Charter

## Purpose
Rebuild the Reachwell prototype into an original, maintainable, responsive application for nonprofit and community organizations.

## Originality and IP guardrails
- Do not copy third-party source code, proprietary text, graphics, logos, screenshots, or distinctive visual layouts.
- Use mature products such as Planning Center only as capability references for categories such as permissions, teams, events, and scheduling.
- Implement Reachwell's own information architecture, visual language, terminology, components, workflows, and source code.
- Use only assets with clear ownership or compatible licenses; record third-party licenses before production release.
- Do not represent legal review as complete. Perform trademark clearance and final counsel review before public launch.

## Design direction
Reachwell should feel like a modern mission operations platform rather than accounting software:
- dark grounded navigation and mission-control surfaces;
- purposeful violet/blue gradient accents;
- breathable content areas;
- fewer generic KPI-card grids;
- clear hierarchy and strong field usability;
- Mission Mode as a signature focused experience.

## Responsive requirements
The application must be designed mobile-first for field use while remaining excellent on desktop:
- phones: 320px+;
- tablets: 768px+;
- desktop/laptop: 1024px+;
- large desktop: 1440px+.

Mission Mode requirements:
- large touch targets;
- one-handed-friendly primary actions where practical;
- no hidden horizontal layout dependencies;
- readable outdoor/field contrast;
- resilient forms and assignment controls;
- desktop/tablet/phone layouts intentionally designed rather than merely scaled.

## Core architecture direction
Separate concerns into:
- application shell/navigation;
- authentication/session;
- organization context;
- people and households;
- teams and team membership;
- communication;
- events and event teams;
- assignments and Mission Mode;
- onboarding/training;
- permissions;
- notifications.

## Definition of done
A feature is not complete merely because it renders. It must have:
1. a defined permission model;
2. loading, empty, and error states;
3. responsive behavior;
4. keyboard/touch accessibility;
5. backend integration where applicable;
6. realistic data-flow tests;
7. no copied proprietary assets or code.
