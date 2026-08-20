import { SubmissionList } from '@/components/submissions/SubmissionList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PengajuanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as any
  if (!profile) redirect('/login')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Pengajuan Konten</h1>
        {profile.role === 'lembaga_admin' && (
          <Link href="/pengajuan/baru">
            <Button>+ Buat Pengajuan</Button>
          </Link>
        )}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <SubmissionList userRole={profile.role} />
      </div>
    </div>
  )
}
