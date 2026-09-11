# ReachWell Testing Release Checklist

## Purpose

This checklist defines the smallest complete product loop required for hands-on organizational testing. A release is ready for testing when the workflows below can be completed using real authenticated accounts and persisted Supabase data.

## 1. Account and Organization

- [ ] Sign in successfully
- [ ] Create or join an organization
- [ ] Reload without losing organization context
- [ ] Confirm users cannot access another organization's data
- [ ] Confirm organization owner controls remain restricted to the owner

## 2. Scoped Permissions

- [ ] Organization member can perform only member actions
- [ ] Team leader can lead the assigned team without becoming an administrator
- [ ] Event leader can operate the assigned event without gaining organization-wide control
- [ ] Unauthorized direct writes are rejected by Supabase
- [ ] Navigation does not advertise actions the current user cannot perform

## 3. People and Households

- [ ] Create and edit a person
- [ ] Create and edit a household
- [ ] Connect people to households
- [ ] Open connected history
- [ ] Navigate from history records to their source event, assignment, team, or follow-up

## 4. Teams and Events

- [ ] Create a team
- [ ] Add members
- [ ] Assign scoped team leadership
- [ ] Create an event
- [ ] Attach teams and participants
- [ ] Assign scoped event leadership
- [ ] Create assignments tied to the event

## 5. Event Day

- [ ] Open Sign-In Mode from the event
- [ ] Mark present
- [ ] Mark not present
- [ ] Record a reason, including Other
- [ ] Correct attendance after saving
- [ ] Add a person during sign-in without granting platform administration

## 6. Mission Mode

- [ ] Enter Mission Mode without freezing the application
- [ ] Select an active assignment
- [ ] Start and complete objectives
- [ ] Record notes
- [ ] Record needs
- [ ] Record prayer
- [ ] Create follow-up work
- [ ] Request Back Up
- [ ] Complete assignment
- [ ] Receive the next assignment when one exists
- [ ] Verify skipped/cancelled work is not treated as active
- [ ] Reload and confirm persisted state

## 7. Connected Operations

Trace one real workflow:

Person → Household → Team → Event → Attendance → Assignment → Mission Visit → Note/Need/Prayer → Follow-Up → History

Every link should remain organization-scoped, permission-aware, and persistent.

## 8. Communication

- [ ] Open the correct operational channel
- [ ] Send a message
- [ ] Verify authorized recipients can see it
- [ ] Verify unauthorized users cannot
- [ ] Search for communication in global search
- [ ] Confirm related team/event context is preserved

## 9. Home

- [ ] Volunteer sees personal work
- [ ] Team leader sees team attention items
- [ ] Event leader sees event readiness/progress
- [ ] Organization leadership sees organization-level attention
- [ ] All cards lead to real underlying work

## 10. Release Safety

- [ ] Build passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production deployment is READY
- [ ] No current Vercel runtime errors
- [ ] Empty/loading/error states are understandable
- [ ] Phone and tablet workflows are usable
- [ ] Failure/recovery behavior is tested
- [ ] A second authenticated user verifies realtime behavior

## Exit Criteria

The testing release is ready when an organization can complete the full operational loop without developer intervention and no P0/P1 defects remain.
