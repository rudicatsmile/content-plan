'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppMessage } from '@/lib/wablas'

export async function reviewSubmission(submissionId: string, decision: 'approved' | 'rejected', notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    if (!user) return { error: 'Unauthorized' }

    // Check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any
    if (!profile || profile.role !== 'media_admin') {
      return { error: 'Only media admin can review submissions' }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Konfigurasi Server bermasalah: SUPABASE_SERVICE_ROLE_KEY belum di-set di Vercel.' }
    }

    // Create admin client to bypass RLS for this specific update
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

  // 1. Insert review
  const { error: reviewError } = await supabaseAdmin.from('submission_reviews').insert({
    submission_id: submissionId,
    reviewer_id: user.id,
    decision,
    notes,
  } as any)

  if (reviewError) throw reviewError

  // 2. Update submission status
  const query = supabaseAdmin.from('content_submissions') as any
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
    const { data: pimpinans } = await supabaseAdmin.from('profiles').select('id, phone_number').eq('role', 'pimpinan') as any
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
    await supabaseAdmin.from('notifications').insert(notificationPayloads as any)

    // 4. Send WhatsApp Notifications
    const waMessage = decision === 'approved' 
      ? `✅ *PENGAJUAN DISETUJUI* ✅\n\nHalo,\nPengajuan konten "${submission.title}" telah disetujui oleh Tim Media.\n\n*Catatan:* ${notes || '-'}\n\nSilakan cek dasbor untuk detail lebih lanjut.`
      : `❌ *PENGAJUAN DITOLAK/REVISI* ❌\n\nHalo,\nPengajuan konten "${submission.title}" telah diperiksa oleh Tim Media dan membutuhkan revisi atau ditolak.\n\n*Catatan:* ${notes || '-'}\n\nSilakan cek dasbor untuk detail lebih lanjut.`;

    const phonesToNotify = new Set<string>()

    // Get creator phone
    const { data: creatorProfile } = await supabaseAdmin.from('profiles').select('phone_number').eq('id', submission.created_by).single() as any
    if (creatorProfile?.phone_number) {
      phonesToNotify.add(creatorProfile.phone_number)
    }

    // Get pimpinan phones
    if (pimpinans && pimpinans.length > 0) {
      for (const p of pimpinans) {
        if (p.phone_number) {
          phonesToNotify.add(p.phone_number)
        }
      }
    }

    // Send to all unique phones
    for (const phone of Array.from(phonesToNotify)) {
      await sendWhatsAppMessage(phone, waMessage)
    }
  }

    revalidatePath('/media/pengajuan')
    revalidatePath(`/media/pengajuan/${submissionId}`)
    revalidatePath(`/pengajuan/${submissionId}`) // also revalidate for lembaga admin view
    
    return { success: true }
  } catch (err: any) {
    console.error('reviewSubmission error:', err)
    return { error: err.message || 'Terjadi kesalahan pada server saat memproses ulasan' }
  }
}
