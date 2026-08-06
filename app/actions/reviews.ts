'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewSubmission(submissionId: string, decision: 'approved' | 'rejected', notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any
  if (!profile || profile.role !== 'media_admin') {
    throw new Error('Only media admin can review submissions')
  }

  // 1. Insert review
  const { error: reviewError } = await supabase.from('submission_reviews').insert({
    submission_id: submissionId,
    reviewer_id: user.id,
    decision,
    notes,
  } as any)

  if (reviewError) throw reviewError

  // 2. Update submission status
  const query = supabase.from('content_submissions') as any
  const { error: updateError } = await query
    .update({ 
      status: decision,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId)

  if (updateError) throw updateError

  // 3. Create Notification
  // Find creator of the submission
  const { data: submission } = await query.select('created_by, title').eq('id', submissionId).single()
  
  if (submission) {
    const statusText = decision === 'approved' ? 'disetujui' : 'ditolak/revisi'
    const notificationPayloads = []

    // 3a. Notify creator
    notificationPayloads.push({
      recipient_id: submission.created_by,
      submission_id: submissionId,
      title: `Pengajuan ${statusText}`,
      message: `Pengajuan konten "${submission.title}" telah ${statusText} oleh Media Admin.`,
    })

    // 3b. Notify pimpinan
    const { data: pimpinans } = await supabase.from('profiles').select('id').eq('role', 'pimpinan') as any
    if (pimpinans && pimpinans.length > 0) {
      for (const p of pimpinans) {
        notificationPayloads.push({
          recipient_id: p.id,
          submission_id: submissionId,
          title: `Info: Pengajuan ${statusText}`,
          message: `Pengajuan "${submission.title}" telah ${statusText} oleh Media Admin.`,
        })
      }
    }

    // Insert all notifications
    await supabase.from('notifications').insert(notificationPayloads as any)
  }

  revalidatePath('/media/pengajuan')
  revalidatePath(`/media/pengajuan/${submissionId}`)
  revalidatePath(`/pengajuan/${submissionId}`) // also revalidate for lembaga admin view
  
  return { success: true }
}
