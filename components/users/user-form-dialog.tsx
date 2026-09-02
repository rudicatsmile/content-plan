'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser, updateUser } from '@/app/actions/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const userSchema = z.object({
  full_name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone_number: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(['super_admin', 'media_admin', 'lembaga_admin', 'pimpinan']),
  lembaga_id: z.string().optional().nullable()
}).refine(data => {
  if (data.role === 'lembaga_admin' && !data.lembaga_id) {
    return false;
  }
  return true;
}, {
  message: 'Lembaga harus dipilih untuk role Lembaga Admin',
  path: ['lembaga_id']
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormDialogProps {
  isOpen: boolean
  onClose: () => void
  user?: any // Jika undefined, berarti create mode
  lembagas: any[]
}

export function UserFormDialog({ isOpen, onClose, user, lembagas }: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!user

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
      role: 'lembaga_admin',
      lembaga_id: ''
    }
  })

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({
          full_name: user.full_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          password: '',
          role: user.role,
          lembaga_id: user.lembaga_id || ''
        })
      } else {
        form.reset({
          full_name: '',
          email: '',
          phone_number: '',
          password: '',
          role: 'lembaga_admin',
          lembaga_id: ''
        })
      }
    }
  }, [isOpen, user, form])

  const selectedRole = form.watch('role')

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      if (isEdit) {
        const payload: any = {
          full_name: data.full_name,
          phone_number: data.phone_number,
          role: data.role,
          lembaga_id: data.lembaga_id
        }
        if (data.password) payload.password = data.password
        if (data.email !== user.email) payload.email = data.email

        await updateUser(user.id, payload)
        toast.success('User berhasil diupdate')
      } else {
        await createUser({
          email: data.email,
          full_name: data.full_name,
          phone_number: data.phone_number,
          role: data.role,
          password: data.password || undefined,
          lembaga_id: data.lembaga_id
        })
        toast.success('User berhasil dibuat')
      }
      onClose()
    } catch (error: any) {
      toast.error(`Gagal menyimpan user: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Tambah User'}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Ubah detail akun pengguna di bawah ini. Kosongkan password jika tidak ingin diubah.' 
              : 'Tambahkan user baru ke dalam sistem. Jika password dikosongkan, default password adalah password123.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {isEdit && '(Opsional)'}</FormLabel>
                  <FormControl>
                    <Input placeholder={isEdit ? "Biarkan kosong jika tak diubah" : "password123"} type="password" {...field} />
                  </FormControl>
                  {!isEdit && <FormDescription>Default: password123</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Role">
                          {field.value === 'super_admin' ? 'Super Admin' :
                           field.value === 'media_admin' ? 'Media Admin' :
                           field.value === 'pimpinan' ? 'Pimpinan' :
                           field.value === 'lembaga_admin' ? 'Lembaga Admin' : ''}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="super_admin" label="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="media_admin" label="Media Admin">Media Admin</SelectItem>
                      <SelectItem value="pimpinan" label="Pimpinan">Pimpinan</SelectItem>
                      <SelectItem value="lembaga_admin" label="Lembaga Admin">Lembaga Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === 'lembaga_admin' && (
              <FormField
                control={form.control}
                name="lembaga_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lembaga</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Lembaga">
                            {lembagas.find(l => l.id === field.value)?.name || ''}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lembagas.map((l: any) => (
                          <SelectItem key={l.id} value={l.id} label={l.name}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
