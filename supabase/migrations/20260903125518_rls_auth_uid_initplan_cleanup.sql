DO $$
DECLARE
  p record;
  q text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual,'') LIKE '%auth.uid()%' OR coalesce(with_check,'') LIKE '%auth.uid()%')
  LOOP
    q := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF p.qual IS NOT NULL THEN
      q := q || ' USING (' || replace(p.qual, 'auth.uid()', '(select auth.uid())') || ')';
    END IF;
    IF p.with_check IS NOT NULL THEN
      q := q || ' WITH CHECK (' || replace(p.with_check, 'auth.uid()', '(select auth.uid())') || ')';
    END IF;
    EXECUTE q;
  END LOOP;
END $$;
