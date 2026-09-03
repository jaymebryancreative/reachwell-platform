-- ReachWell: optimize high-traffic RLS policies
-- Mirrors the additive migration applied to the live Supabase project.

-- Notifications had duplicate SELECT and UPDATE policies with identical predicates.
drop policy if exists notifications_recipient_select on public.notifications;
drop policy if exists notifications_recipient_update on public.notifications;

alter policy notifications_read_own on public.notifications
  using ((recipient_id = (select auth.uid())));

alter policy notifications_update_own on public.notifications
  using ((recipient_id = (select auth.uid())))
  with check ((recipient_id = (select auth.uid())));

alter policy profiles_select_self_or_same_org on public.profiles
  using (
    (id = (select auth.uid()))
    or exists (
      select 1
      from public.organization_members me
      join public.organization_members them on them.organization_id = me.organization_id
      where me.user_id = (select auth.uid())
        and them.user_id = public.profiles.id
        and me.status = 'active'
        and them.status = 'active'
    )
  );

alter policy profiles_insert_self on public.profiles
  with check ((id = (select auth.uid())));

alter policy profiles_update_self on public.profiles
  using ((id = (select auth.uid())))
  with check ((id = (select auth.uid())));

alter policy event_participants_read_event on public.event_participants
  using (
    (user_id = (select auth.uid()))
    or exists (
      select 1
      from public.events e
      where e.id = public.event_participants.event_id
        and public.is_org_member(e.organization_id)
    )
  );
