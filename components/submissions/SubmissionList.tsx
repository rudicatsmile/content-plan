'use client'

import { useSubmissions } from '@/hooks/useSubmissions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function SubmissionList({ filters, linkPrefix = '/pengajuan' }: { filters?: any, linkPrefix?: string }) {
  const { data: submissionsRaw, isLoading } = useSubmissions(filters)
  const submissions = submissionsRaw as any[]

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tanggal Upload</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.title}</TableCell>
                <TableCell>{format(new Date(sub.upload_date), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'draft' ? 'secondary' : sub.status === 'approved' ? 'default' : 'outline'}>
                    {sub.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`${linkPrefix}/${sub.id}`}>
                    <Button variant="ghost" size="sm">Detail</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!submissions?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Belum ada data pengajuan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
