import { SubmissionDetail } from '@/components/submissions/SubmissionDetail'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/pengajuan">
          <Button variant="outline">← Kembali</Button>
        </Link>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <SubmissionDetail id={resolvedParams.id} />
      </div>
    </div>
  )
}
