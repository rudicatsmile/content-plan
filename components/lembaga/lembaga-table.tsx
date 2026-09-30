'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { LembagaForm } from './lembaga-form'
import { deleteLembaga } from '@/app/actions/lembaga'
import { format } from 'date-fns'

interface LembagaTableProps {
  lembagas: any[]
}

export function LembagaTable({ lembagas }: LembagaTableProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingLembaga, setEditingLembaga] = useState<any>(null)

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lembaga "${name}"? Data yang terhubung dengan lembaga ini mungkin akan terdampak.`)) {
      const res = await deleteLembaga(id)
      if (!res.success) {
        alert(res.error || 'Gagal menghapus lembaga')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Daftar Lembaga</h2>
        
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lembaga
        </Button>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Lembaga Baru</DialogTitle>
            </DialogHeader>
            <LembagaForm 
              onSuccess={() => setIsAddOpen(false)} 
              onCancel={() => setIsAddOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px] text-center">Urutan</TableHead>
              <TableHead>Nama Lembaga</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="text-right w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lembagas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Belum ada data lembaga.
                </TableCell>
              </TableRow>
            ) : (
              lembagas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-center font-medium text-slate-500">
                    {l.sort_order}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {l.name}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(new Date(l.created_at), 'dd MMM yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setEditingLembaga(l)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(l.id, l.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLembaga} onOpenChange={(open) => !open && setEditingLembaga(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lembaga</DialogTitle>
          </DialogHeader>
          {editingLembaga && (
            <LembagaForm 
              initialData={editingLembaga}
              onSuccess={() => setEditingLembaga(null)}
              onCancel={() => setEditingLembaga(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
