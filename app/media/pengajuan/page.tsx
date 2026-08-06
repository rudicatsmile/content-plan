import { SubmissionList } from '@/components/submissions/SubmissionList'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MediaPengajuanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any
  if (!profile || profile.role !== 'media_admin') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
        <p>Hanya Media Admin yang dapat mengakses halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Pengajuan (Menunggu Persetujuan)</h1>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {/* Only show pending_review by default for media admin */}
        <SubmissionList filters={{ status: 'pending_review' }} linkPrefix="/media/pengajuan" />
      </div>
    </div>
  )
}
