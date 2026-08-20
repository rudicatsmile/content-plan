import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmissionForm } from '@/components/submissions/SubmissionForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EditSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('lembaga_id, role').eq('id', user.id).single() as any
  
  if (!profile || profile.role !== 'lembaga_admin' || !profile.lembaga_id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
        <p>Hanya Admin Lembaga yang dapat mengedit pengajuan.</p>
      </div>
    )
  }

  // Fetch the submission
  const { data: submission } = await supabase
    .from('content_submissions')
    .select(`
      *,
      platforms:content_submission_platforms(platform_id)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!submission) {
    return <div className="p-8 text-center">Pengajuan tidak ditemukan</div>
  }

  if (submission.status !== 'planning' && submission.status !== 'draft' && submission.status !== 'pending_review') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
        <p>Hanya pengajuan dengan status RENCANA, DRAFT atau PENDING REVIEW yang dapat diedit.</p>
      </div>
    )
  }

  const { data: platforms } = await supabase.from('social_platforms').select('id, name').order('name')
  const { data: contentTypes } = await supabase.from('content_types').select('id, name').order('name')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Pengajuan Konten</h1>
        <Link href={`/pengajuan/${resolvedParams.id}`}>
          <Button variant="outline">Batal</Button>
        </Link>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <SubmissionForm 
          lembagaId={profile.lembaga_id} 
          platforms={platforms || []} 
          contentTypes={contentTypes || []}
          initialData={submission}
        />
      </div>
    </div>
  )
}
