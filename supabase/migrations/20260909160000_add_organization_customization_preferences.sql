-- Organization-level customization without allowing arbitrary platform changes.
CREATE TABLE IF NOT EXISTS public.organization_preferences (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  mission_statement text,
  home_welcome_message text,
  scripture_enabled boolean NOT NULL DEFAULT true,
  scripture_style text NOT NULL DEFAULT 'tasteful' CHECK (scripture_style IN ('off','tasteful','featured')),
  terminology jsonb NOT NULL DEFAULT '{}'::jsonb,
  experience_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_preferences_read ON public.organization_preferences FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id=organization_preferences.organization_id AND om.user_id=auth.uid() AND om.status='active'));
CREATE POLICY organization_preferences_manage ON public.organization_preferences FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id=organization_preferences.organization_id AND om.user_id=auth.uid() AND om.status='active' AND om.role IN ('owner','admin','director'))) WITH CHECK (EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id=organization_preferences.organization_id AND om.user_id=auth.uid() AND om.status='active' AND om.role IN ('owner','admin','director')));
CREATE INDEX IF NOT EXISTS organization_preferences_updated_idx ON public.organization_preferences (updated_at DESC);
CREATE OR REPLACE FUNCTION public.set_organization_preferences_updated_at() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS set_organization_preferences_updated_at ON public.organization_preferences;
CREATE TRIGGER set_organization_preferences_updated_at BEFORE UPDATE ON public.organization_preferences FOR EACH ROW EXECUTE FUNCTION public.set_organization_preferences_updated_at();
REVOKE EXECUTE ON FUNCTION public.set_organization_preferences_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_organization_preferences_updated_at() TO postgres, service_role;