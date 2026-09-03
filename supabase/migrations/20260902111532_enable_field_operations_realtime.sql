do $$
begin
  begin alter publication supabase_realtime add table public.assignments; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.assignment_visits; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.assignment_safety_alerts; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.event_participants; exception when duplicate_object then null; end;
end $$;
