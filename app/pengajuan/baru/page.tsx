import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmissionForm } from '@/components/submissions/SubmissionForm'

export default async function CreateSubmissionPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('lembaga_id, role').eq('id', user.id).single() as any
  
  if (!profile || profile.role !== 'lembaga_admin' || !profile.lembaga_id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
        <p>Hanya Admin Lembaga yang dapat membuat pengajuan baru.</p>
      </div>
    )
  }

  const { data: platforms } = await supabase.from('social_platforms').select('id, name').order('name')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Buat Pengajuan Konten Baru</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <SubmissionForm lembagaId={profile.lembaga_id} platforms={platforms || []} />
      </div>
    </div>
  )
}
