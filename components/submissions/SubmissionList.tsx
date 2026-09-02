'use client'

import { useState, useEffect } from 'react'
import { useSubmissions } from '@/hooks/useSubmissions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

export function SubmissionList({ filters, linkPrefix = '/pengajuan', userRole }: { filters?: any, linkPrefix?: string, userRole?: string }) {
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [lembagasList, setLembagasList] = useState<any[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    if (userRole !== 'lembaga_admin') {
      supabase.from('lembaga').select('id, name').order('sort_order', { ascending: true }).then(({ data }) => {
        if (data) setLembagasList(data)
      })
    }
  }, [userRole, supabase])

  const effectiveFilters = {
    ...filters,
    ...(selectedLembagaId !== 'all' ? { lembagaId: selectedLembagaId } : {}),
    ...(selectedStatus !== 'all' ? { status: selectedStatus } : {})
  }

  const { data: submissionsRaw, isLoading } = useSubmissions(effectiveFilters)
  const submissions = submissionsRaw as any[]

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  const showLembagaColumn = userRole !== 'lembaga_admin'

  const getBadgeProps = (status: string, publish_permission: string) => {
    if (status === 'approved' && publish_permission === 'diizinkan') {
      return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700', label: 'SIAP TAYANG' };
    }
    if (status === 'approved' && publish_permission === 'ditolak') {
      return { variant: 'destructive' as const, className: '', label: 'TIDAK DIIZINKAN' };
    }
    if (status === 'approved') {
      return { variant: 'default' as const, className: '', label: 'APPROVED' };
    }
    if (status === 'draft') return { variant: 'secondary' as const, className: '', label: 'DRAFT' };
    if (status === 'planning') return { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-200', label: 'PLANNING' };
    if (status === 'pending_review') return { variant: 'destructive' as const, className: '', label: 'PENDING REVIEW' };
    return { variant: 'destructive' as const, className: '', label: status.replace('_', ' ').toUpperCase() };
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {userRole !== 'lembaga_admin' && (
          <div className="w-[250px]">
            <Select value={selectedLembagaId} onValueChange={(val) => setSelectedLembagaId(val || 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Lembaga">
                  {selectedLembagaId === 'all' 
                    ? 'Semua Lembaga' 
                    : lembagasList.find(l => l.id === selectedLembagaId)?.name || 'Semua Lembaga'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lembaga</SelectItem>
                {lembagasList.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-[200px]">
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status">
                {selectedStatus === 'all' ? 'Semua Status' : selectedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="approved_with_notes">Approved with Notes</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {submissions?.map((sub) => (
          <div key={sub.id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-slate-800 leading-tight">{sub.title}</h3>
                {sub.priority === 'urgent' && (
                  <Badge variant="destructive" className="w-fit text-[10px] h-4 px-1.5 leading-none">URGENT</Badge>
                )}
              </div>
              {(() => {
                const badge = getBadgeProps(sub.status, sub.publish_permission)
                return (
                  <Badge variant={badge.variant} className={`${badge.className} shrink-0`}>
                    {badge.label}
                  </Badge>
                )
              })()}
            </div>
            <div className="flex justify-between items-end">
              <div className="text-sm text-slate-500 space-y-1">
                {showLembagaColumn && <p className="font-medium text-slate-700">{sub.lembaga?.name || '-'}</p>}
                <p>{format(new Date(sub.upload_date), 'dd MMM yyyy')}</p>
              </div>
              <Link href={`${linkPrefix}/${sub.id}`}>
                <Button variant="outline" size="sm">Detail</Button>
              </Link>
            </div>
          </div>
        ))}
        {!submissions?.length && (
          <div className="text-center p-8 text-muted-foreground bg-white rounded-lg border shadow-sm">
            Belum ada data pengajuan
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Judul</TableHead>
                {showLembagaColumn && <TableHead>Lembaga</TableHead>}
                <TableHead>Tanggal Upload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1 items-start">
                      <span>{sub.title}</span>
                      {sub.priority === 'urgent' && (
                        <Badge variant="destructive" className="w-fit text-[10px] h-4 px-1.5 leading-none">URGENT</Badge>
                      )}
                    </div>
                  </TableCell>
                  {showLembagaColumn && (
                    <TableCell>{sub.lembaga?.name || '-'}</TableCell>
                  )}
                  <TableCell>{format(new Date(sub.upload_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    {(() => {
                      const badge = getBadgeProps(sub.status, sub.publish_permission)
                      return (
                        <Badge variant={badge.variant} className={badge.className}>
                          {badge.label}
                        </Badge>
                      )
                    })()}
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
                  <TableCell colSpan={showLembagaColumn ? 5 : 4} className="text-center h-24 text-muted-foreground">
                    Belum ada data pengajuan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
