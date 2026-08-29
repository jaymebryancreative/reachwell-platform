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
  const { data, error } = await supabase.from('people').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAssignments(organizationId) {
  const { data, error } = await supabase.from('assignments').select('*').eq('organization_id', organizationId).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAssignmentNote(payload) {
  const { data, error } = await supabase.from('assignment_notes').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function createNeed(payload) {
  const { data, error } = await supabase.from('needs').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function createPrayerRequest(payload) {
  const { data, error } = await supabase.from('prayer_requests').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function createFollowUp(payload) {
  const { data, error } = await supabase.from('follow_ups').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAssignmentStatus(assignmentId, status) {
  const { data, error } = await supabase.from('assignments').update({ status }).eq('id', assignmentId).select().single();
  if (error) throw error;
  return data;
}

// Organization data lifecycle -------------------------------------------------
export async function getOrganizationSubscription(organizationId) {
  const { data, error } = await supabase.from('organization_subscriptions').select('*').eq('organization_id', organizationId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function requestOrganizationExport({ organizationId, exportType = 'full_archive', format = 'zip', metadata = {} }) {
  const user = await getCurrentUser();
  const { data, error } = await supabase.from('organization_exports').insert({
    organization_id: organizationId,
    requested_by: user?.id ?? null,
    export_type: exportType,
    format,
    metadata
  }).select().single();
  if (error) throw error;
  return data;
}

export async function listOrganizationExports(organizationId) {
  const { data, error } = await supabase.from('organization_exports').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// File records use soft deletion first so accidental deletes can be recovered.
export async function listOrganizationFiles(organizationId, { includeTrash = false } = {}) {
  let query = supabase.from('organization_files').select('*').eq('organization_id', organizationId).is('permanently_deleted_at', null).order('created_at', { ascending: false });
  query = includeTrash ? query : query.is('deleted_at', null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function softDeleteOrganizationFile(fileId) {
  const user = await getCurrentUser();
  const { data, error } = await supabase.from('organization_files').update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null }).eq('id', fileId).select().single();
  if (error) throw error;
  return data;
}

export async function restoreOrganizationFile(fileId) {
  const { data, error } = await supabase.from('organization_files').update({ deleted_at: null, deleted_by: null }).eq('id', fileId).select().single();
  if (error) throw error;
  return data;
}

export async function markOrganizationFilePermanentlyDeleted(fileId) {
  const { data, error } = await supabase.from('organization_files').update({ permanently_deleted_at: new Date().toISOString() }).eq('id', fileId).select().single();
  if (error) throw error;
  return data;
}
