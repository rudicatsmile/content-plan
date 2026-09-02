import { SubmissionDetail } from '@/components/submissions/SubmissionDetail'
import { ReviewForm } from '@/components/submissions/ReviewForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function MediaSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()

  // Authorization Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any
  if (!profile || profile.role !== 'media_admin') {
    return <div className="p-8">Akses Ditolak</div>
  }

  // Fetch minimal submission data to check status
  const { data: submission } = await supabase
    .from('content_submissions')
    .select('status')
    .eq('id', resolvedParams.id)
    .single() as any

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/media/pengajuan">
          <Button variant="outline">← Kembali ke Daftar</Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <SubmissionDetail id={resolvedParams.id} userRole={profile.role} />
      </div>

      {submission?.status === 'pending_review' && (
        <ReviewForm submissionId={resolvedParams.id} />
      )}
    </div>
  )
}
