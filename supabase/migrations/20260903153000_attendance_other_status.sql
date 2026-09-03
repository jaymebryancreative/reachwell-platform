alter table public.event_participants
  drop constraint if exists event_participants_attendance_status_check;

alter table public.event_participants
  add constraint event_participants_attendance_status_check
  check (attendance_status = any (array[
    'invited'::text,
    'confirmed'::text,
    'checked_in'::text,
    'no_show'::text,
    'cancelled'::text,
    'present'::text,
    'late'::text,
    'absent'::text,
    'other'::text,
    'not_marked'::text
  ]));
