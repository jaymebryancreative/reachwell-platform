import { supabase } from './supabaseClient'

const BUCKET = 'organization-files'

type OrganizationFile = {
  id: string
  organization_id: string
  folder: string | null
  file_name: string
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\s+/g, ' ').trim() || 'file'

export async function uploadOrganizationFile(organizationId: string, userId: string, file: File, folder = 'General') {
  const path = `${organizationId}/${crypto.randomUUID()}-${safeName(file.name)}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
  if (uploadError) throw uploadError
  const { data, error } = await supabase.from('organization_files').insert({
    organization_id: organizationId,
    folder: folder.trim() || 'General',
    file_name: file.name,
    storage_path: path,
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: userId,
  }).select('*').single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw error
  }
  return data as OrganizationFile
}

export async function createOrganizationFileUrl(storagePath: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function softDeleteOrganizationFile(file: Pick<OrganizationFile, 'id' | 'storage_path'>, userId: string) {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storage_path])
  if (storageError) throw storageError
  const { error } = await supabase.from('organization_files').update({ deleted_at: new Date().toISOString(), deleted_by: userId }).eq('id', file.id).is('deleted_at', null)
  if (error) throw error
}

export type { OrganizationFile }
