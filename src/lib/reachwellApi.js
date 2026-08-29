import { supabase } from './supabaseClient.js';

/**
 * Reachwell application data layer.
 * UI code calls these functions instead of talking to localStorage directly.
 * RLS remains the final authority for every query and mutation.
 */

const FILE_BUCKET = 'organization-files';
const EXPORT_BUCKET = 'organization-exports';

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
  const { data, error } = await supabase
    .from('assignments')
    .update({ status })
    .eq('id', assignmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Organization data lifecycle -------------------------------------------------
export async function getOrganizationSubscription(organizationId) {
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOrganizationLifecycle(organizationId, patch) {
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .update(patch)
    .eq('organization_id', organizationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Starts a cancellation request without deleting data. The server/RLS policy must
 * restrict this to the organization owner and calculate the applicable dates.
 */
export async function requestOrganizationCancellation({ organizationId, reason = null }) {
  return updateOrganizationLifecycle(organizationId, {
    status: 'canceling',
    cancellation_requested_at: new Date().toISOString(),
    cancellation_reason: reason
  });
}

// Data Center / exports --------------------------------------------------------
export async function requestOrganizationExport({
  organizationId,
  exportType = 'full_archive',
  format = 'zip',
  metadata = {}
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('organization_exports')
    .insert({
      organization_id: organizationId,
      requested_by: user?.id ?? null,
      export_type: exportType,
      format,
      metadata
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listOrganizationExports(organizationId) {
  const { data, error } = await supabase
    .from('organization_exports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrganizationExport(exportId) {
  const { data, error } = await supabase
    .from('organization_exports')
    .select('*')
    .eq('id', exportId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Creates a short-lived signed URL only after RLS authorizes access to the
 * Storage object. Never expose a permanent public URL for private records.
 */
export async function createOrganizationExportDownloadUrl(storagePath, expiresIn = 60 * 15) {
  const { data, error } = await supabase.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// File records + organization trash ------------------------------------------
export async function listOrganizationFiles(organizationId, { includeTrash = false } = {}) {
  let query = supabase
    .from('organization_files')
    .select('*')
    .eq('organization_id', organizationId)
    .is('permanently_deleted_at', null)
    .order('created_at', { ascending: false });

  query = includeTrash ? query : query.is('deleted_at', null);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listOrganizationTrash(organizationId) {
  const { data, error } = await supabase
    .from('organization_files')
    .select('*')
    .eq('organization_id', organizationId)
    .not('deleted_at', 'is', null)
    .is('permanently_deleted_at', null)
    .order('deleted_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Uploads a private object and then records its metadata. If metadata insertion
 * fails, the uploaded object is removed so orphaned private files do not pile up.
 */
export async function uploadOrganizationFile({ organizationId, file, folderPath = '', metadata = {} }) {
  if (!file) throw new Error('A file is required.');

  const user = await getCurrentUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectPath = `${organizationId}/${folderPath ? `${folderPath.replace(/^\/+|\/+$/g, '')}/` : ''}${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(FILE_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type || undefined,
      upsert: false
    });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('organization_files')
    .insert({
      organization_id: organizationId,
      storage_path: objectPath,
      file_name: file.name,
      content_type: file.type || null,
      file_size: file.size,
      folder_path: folderPath || null,
      uploaded_by: user?.id ?? null,
      metadata
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(FILE_BUCKET).remove([objectPath]);
    throw error;
  }

  return data;
}

export async function createOrganizationFileDownloadUrl(storagePath, expiresIn = 60 * 15) {
  const { data, error } = await supabase.storage
    .from(FILE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function softDeleteOrganizationFile(fileId) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('organization_files')
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null })
    .eq('id', fileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function restoreOrganizationFile(fileId) {
  const { data, error } = await supabase
    .from('organization_files')
    .update({ deleted_at: null, deleted_by: null })
    .eq('id', fileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Final deletion is intentionally a separate action. The database record is
 * retained as an audit marker while the private Storage object is removed.
 */
export async function permanentlyDeleteOrganizationFile(fileRecord) {
  if (!fileRecord?.id || !fileRecord?.storage_path) {
    throw new Error('A file record with id and storage_path is required.');
  }

  const { error: storageError } = await supabase.storage
    .from(FILE_BUCKET)
    .remove([fileRecord.storage_path]);
  if (storageError) throw storageError;

  const { data, error } = await supabase
    .from('organization_files')
    .update({ permanently_deleted_at: new Date().toISOString() })
    .eq('id', fileRecord.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
