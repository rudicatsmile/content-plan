'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSubmission(data: any, targetStatus: 'planning' | 'draft' | 'pending_review') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get user profile to get lembaga_id
  const { data: profile } = await supabase.from('profiles').select('lembaga_id').eq('id', user.id).single() as any
  
  if (!profile?.lembaga_id) throw new Error('User does not belong to any lembaga')

  const submissionId = data.id // Client-generated UUID

  // 1. Insert into content_submissions
  const { error: insertError } = await supabase.from('content_submissions').insert({
    id: submissionId,
    lembaga_id: profile.lembaga_id,
    created_by: user.id,
    content_type_id: data.content_type_id,
    title: data.title,
    description: data.description,
    media_urls: data.media_urls,
    upload_date: data.upload_date,
    status: targetStatus,
    submitted_at: targetStatus === 'pending_review' ? new Date().toISOString() : null,
  } as any)

  if (insertError) throw insertError

  // 2. Insert into content_submission_platforms
  if (data.platforms && data.platforms.length > 0) {
    const platformsData = data.platforms.map((platformId: string) => ({
      submission_id: submissionId,
      platform_id: platformId,
    }))
    
    const { error: platformsError } = await supabase.from('content_submission_platforms').insert(platformsData)
    if (platformsError) throw platformsError
  }

  revalidatePath('/pengajuan')
  return { success: true, id: submissionId }
}

export async function updateSubmission(id: string, data: any, targetStatus: 'planning' | 'draft' | 'pending_review') {
  const supabase = await createClient()
  
  // 1. Update content_submissions
  const query = supabase.from('content_submissions') as any
  const { error: updateError } = await query
    .update({
      title: data.title,
      description: data.description,
      content_type_id: data.content_type_id,
      media_urls: data.media_urls,
      upload_date: data.upload_date,
      status: targetStatus,
      submitted_at: targetStatus === 'pending_review' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .in('status', ['planning', 'draft', 'pending_review']) // Allow editing for planning, draft, or pending_review

  if (updateError) throw updateError

  // 2. Update platforms (delete old, insert new)
  if (data.platforms) {
    await supabase.from('content_submission_platforms').delete().eq('submission_id', id)
    
    const platformsData = data.platforms.map((platformId: string) => ({
      submission_id: id,
      platform_id: platformId,
    }))
    await supabase.from('content_submission_platforms').insert(platformsData)
  }

  revalidatePath('/pengajuan')
  revalidatePath(`/pengajuan/${id}`)
  return { success: true }
}

export async function submitSubmission(id: string) {
  const supabase = await createClient()
  const query = supabase.from('content_submissions') as any
  const { error } = await query
    .update({ 
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'draft')

  if (error) throw error
  revalidatePath('/pengajuan')
  revalidatePath(`/pengajuan/${id}`)
  return { success: true }
}

export async function cancelSubmission(id: string) {
  const supabase = await createClient()
  // Cancel means delete if draft, or what? PRD says "membatalkan". 
  // We can just delete if it's draft or pending_review
  const { error } = await supabase.from('content_submissions')
    .delete()
    .eq('id', id)
    .in('status', ['planning', 'draft', 'pending_review'])

  if (error) throw error
  revalidatePath('/pengajuan')
  return { success: true }
}
