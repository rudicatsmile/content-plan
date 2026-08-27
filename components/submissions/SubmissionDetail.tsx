'use client'

import { useSubmission } from '@/hooks/useSubmissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { cancelSubmission, submitSubmission } from '@/app/actions/submissions'
import Link from 'next/link'

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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{submission.title}</h2>
            {submission.priority === 'urgent' && (
              <Badge variant="destructive" className="h-6 mt-1">URGENT</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{submission.lembaga?.name}</p>
        </div>
        <Badge variant={submission.status === 'draft' ? 'secondary' : submission.status === 'approved' ? 'default' : 'outline'}>
          {submission.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {submission.media_urls && submission.media_urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {submission.media_urls.map((media: any, index: number) => {
            const isImage = media.type.startsWith('image/')
            const isVideo = media.type.startsWith('video/')
            const isPdf = media.type === 'application/pdf'

            if (isImage) {
              return (
                <a key={index} href={media.url} target="_blank" rel="noreferrer" className="block w-full aspect-square border rounded-xl overflow-hidden bg-slate-50 hover:opacity-90">
                  <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                </a>
              )
            } else if (isVideo) {
              return (
                <div key={index} className="w-full aspect-square border rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-4">
                  <video src={media.url} controls className="w-full max-h-32 mb-2" />
                  <a href={media.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate w-full text-center hover:underline">{media.name}</a>
                </div>
              )
            } else if (isPdf) {
              return (
                <a key={index} href={media.url} target="_blank" rel="noreferrer" className="w-full aspect-square border rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-4 hover:bg-slate-100">
                  <div className="text-red-500 mb-2 font-bold text-3xl">PDF</div>
                  <span className="text-xs text-center text-slate-700 truncate w-full">{media.name}</span>
                </a>
              )
            }
            return null
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold block mb-1">Tanggal Upload:</span>
          {format(new Date(submission.upload_date), 'dd-MM-yyyy')}
        </div>
        <div>
          <span className="font-semibold block mb-1">Jenis Konten:</span>
          {submission.content_types?.name || '-'}
        </div>
        <div className="col-span-2">
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

      <div className="flex flex-wrap gap-4 pt-4 border-t">
        {(submission.status === 'planning' || submission.status === 'draft' || submission.status === 'pending_review') && (
          <Link href={`/pengajuan/${id}/edit`}>
            <Button variant="outline">Edit Pengajuan</Button>
          </Link>
        )}
        
        {submission.status === 'planning' && (
          <Button variant="destructive" onClick={handleCancel}>Hapus Rencana</Button>
        )}

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
