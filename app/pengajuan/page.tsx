import { SubmissionList } from '@/components/submissions/SubmissionList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PengajuanPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Pengajuan Konten</h1>
        <Link href="/pengajuan/baru">
          <Button>+ Buat Pengajuan</Button>
        </Link>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <SubmissionList />
      </div>
    </div>
  )
}
