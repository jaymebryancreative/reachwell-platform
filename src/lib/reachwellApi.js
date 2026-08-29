import { supabase } from './supabaseClient.js';

/**
 * Reachwell data layer.
 * UI code calls these functions instead of talking to localStorage directly.
 * RLS remains the final authority for every query and mutation.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function listPeople(organizationId) {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAssignments(organizationId) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAssignmentNote(payload) {
  const { data, error } = await supabase
    .from('assignment_notes')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createNeed(payload) {
  const { data, error } = await supabase
    .from('needs')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createPrayerRequest(payload) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createFollowUp(payload) {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssignmentStatus(assignmentId, status) {
  const { data, error } = await supabase
    .from('assignments')
    .update({ status })
    .eq('id', assignmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
