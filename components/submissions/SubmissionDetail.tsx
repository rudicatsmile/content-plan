'use client'

import { useSubmission } from '@/hooks/useSubmissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { cancelSubmission, submitSubmission } from '@/app/actions/submissions'

export function SubmissionDetail({ id }: { id: string }) {
  const { data: submissionRaw, isLoading, refetch } = useSubmission(id)
  const submission = submissionRaw as any

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
  if (!submission) return <div className="p-8 text-center text-muted-foreground">Pengajuan tidak ditemukan</div>

  const handleCancel = async () => {
    if (confirm('Yakin ingin membatalkan pengajuan ini?')) {
      await cancelSubmission(id)
      alert('Berhasil dibatalkan')
      // router.push('/pengajuan') // Usually passed as prop or handled in parent
    }
  }

  const handleSubmit = async () => {
    if (confirm('Ajukan konten ini sekarang?')) {
      await submitSubmission(id)
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{submission.title}</h2>
          <p className="text-muted-foreground">{submission.lembaga?.name}</p>
        </div>
        <Badge variant={submission.status === 'draft' ? 'secondary' : submission.status === 'approved' ? 'default' : 'outline'}>
          {submission.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {submission.image_url && (
        <img src={submission.image_url} alt={submission.title} className="w-full max-h-96 object-cover rounded-xl border" />
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold block mb-1">Tanggal Upload:</span>
          {format(new Date(submission.upload_date), 'PPP')}
        </div>
        <div>
          <span className="font-semibold block mb-1">Platform:</span>
          <div className="flex gap-2 flex-wrap">
            {submission.platforms?.map((p: any) => (
              <Badge key={p.social_platforms.id} variant="secondary">{p.social_platforms.name}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="font-semibold block mb-1">Keterangan:</span>
        <p className="text-gray-700 whitespace-pre-wrap">{submission.description || '-'}</p>
      </div>

      {submission.reviews && submission.reviews.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Riwayat Ulasan</h3>
          <div className="space-y-4">
            {submission.reviews.map((rev: any) => (
              <div key={rev.id} className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">{rev.reviewer?.full_name || 'Reviewer'}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {format(new Date(rev.created_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  </div>
                  <Badge variant={rev.decision === 'approved' ? 'default' : 'destructive'}>
                    {rev.decision.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {rev.notes || 'Tidak ada catatan.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t">
        {submission.status === 'draft' && (
          <>
            <Button onClick={handleSubmit}>Ajukan Sekarang</Button>
            <Button variant="destructive" onClick={handleCancel}>Hapus Draft</Button>
          </>
        )}
        {submission.status === 'pending_review' && (
          <Button variant="destructive" onClick={handleCancel}>Batalkan Pengajuan</Button>
        )}
      </div>
    </div>
  )
}
