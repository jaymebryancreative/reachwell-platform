-- ReachWell: avoid per-row auth.uid() evaluation in high-traffic RLS policies.
-- Applied to the live Supabase project on 2026-09-08.

DROP POLICY IF EXISTS "org_members_select_own" ON public.organization_members;
CREATE POLICY "org_members_select_own"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING ((user_id = (SELECT auth.uid())) AND (status = 'active'));

DROP POLICY IF EXISTS "leaders can request exports" ON public.organization_exports;
CREATE POLICY "leaders can request exports"
  ON public.organization_exports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.organization_id = organization_exports.organization_id
        AND m.user_id = (SELECT auth.uid())
        AND m.status = 'active'
        AND m.role = ANY (ARRAY['owner','admin','director'])
    )
  );

DROP POLICY IF EXISTS "leaders can update exports" ON public.organization_exports;
CREATE POLICY "leaders can update exports"
  ON public.organization_exports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.organization_id = organization_exports.organization_id
        AND m.user_id = (SELECT auth.uid())
        AND m.status = 'active'
        AND m.role = ANY (ARRAY['owner','admin','director'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.organization_id = organization_exports.organization_id
        AND m.user_id = (SELECT auth.uid())
        AND m.status = 'active'
        AND m.role = ANY (ARRAY['owner','admin','director'])
    )
  );

DROP POLICY IF EXISTS "leaders can view exports" ON public.organization_exports;
CREATE POLICY "leaders can view exports"
  ON public.organization_exports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.organization_id = organization_exports.organization_id
        AND m.user_id = (SELECT auth.uid())
        AND m.status = 'active'
        AND m.role = ANY (ARRAY['owner','admin','director'])
    )
  );
