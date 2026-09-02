'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { UserFormDialog } from './user-form-dialog'
import { deleteUser } from '@/app/actions/users'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface UserTableProps {
  users: any[]
  lembagas: any[]
}

const roleMap: Record<string, string> = {
  super_admin: 'Super Admin',
  media_admin: 'Media Admin',
  lembaga_admin: 'Lembaga Admin',
  pimpinan: 'Pimpinan'
}

export function UserTable({ users, lembagas }: UserTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleCreate = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}" secara permanen? Aksi ini tidak dapat dibatalkan.`)) {
      setIsDeleting(id)
      try {
        await deleteUser(id)
        toast.success('Pengguna berhasil dihapus')
      } catch (error: any) {
        toast.error(`Gagal menghapus pengguna: ${error.message}`)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengelolaan User</h2>
          <p className="text-muted-foreground">Kelola akun pengguna, role, dan akses lembaga.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead>Tgl Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Tidak ada data pengguna.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleMap[user.role] || user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.lembaga?.name || '-'}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(user.id, user.full_name || user.email)}
                        disabled={isDeleting === user.id}
                        title="Hapus"
                      >
                        {isDeleting === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        user={selectedUser} 
        lembagas={lembagas} 
      />
    </div>
  )
}
