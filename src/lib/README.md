# Reachwell application services

This directory contains browser-side application integrations.

## Supabase

`supabaseClient.js` initializes the Supabase JavaScript client using Vite environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Use only the browser-safe publishable/anon key here. Authorization and tenant isolation are enforced by Supabase Auth and Row Level Security policies.

The next integration stages connect this client to:

1. Auth and organization context
2. People and households
3. Teams and memberships
4. Mission assignments and encounters
5. Needs, prayer, and follow-up
6. Projects, tasks, events, and communication
