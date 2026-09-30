'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLembaga, updateLembaga } from '@/app/actions/lembaga'

interface LembagaFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function LembagaForm({ initialData, onSuccess, onCancel }: LembagaFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() || '0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('Nama lembaga wajib diisi')
      return
    }

    setIsLoading(true)

    const payload = {
      name: name.trim(),
      sort_order: parseInt(sortOrder) || 0
    }

    let result
    if (isEdit) {
      result = await updateLembaga(initialData.id, payload)
    } else {
      result = await createLembaga(payload)
    }

    setIsLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Terjadi kesalahan')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lembaga</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lembaga..."
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan (Sort Order)</Label>
        <Input 
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="0"
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500">Angka yang lebih kecil akan tampil lebih dulu</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
