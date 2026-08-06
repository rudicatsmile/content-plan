'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { Button } from './button'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  submissionId: string
  lembagaId: string
}

export function ImageUploader({ value, onChange, submissionId, lembagaId }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Harap unggah file gambar (jpg, png, webp)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        // Compress image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })

        const ext = file.name.split('.').pop()
        const filename = `image.${ext}`
        const filePath = `${lembagaId}/${submissionId}/${filename}`

        const { data, error: uploadError } = await supabase.storage
          .from('content-submissions')
          .upload(filePath, compressedFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('content-submissions')
          .getPublicUrl(filePath)

        onChange(publicUrl)
      } catch (err: any) {
        console.error('Error uploading image:', err)
        setError(err.message || 'Gagal mengunggah gambar')
      } finally {
        setIsUploading(false)
      }
    },
    [lembagaId, submissionId, onChange, supabase]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }

  if (value) {
    return (
      <div className="relative rounded-lg border overflow-hidden">
        <img src={value} alt="Preview" className="w-full h-auto object-cover max-h-64" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => onChange('')}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary cursor-pointer'}`}
      onClick={() => document.getElementById('image-upload')?.click()}
    >
      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <div className="flex flex-col items-center justify-center space-y-2">
        {isUploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
        )}
        <div className="text-sm">
          {isUploading ? 'Sedang mengunggah...' : 'Klik atau drag & drop gambar ke sini'}
        </div>
        <div className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</div>
        {error && <div className="text-sm text-destructive mt-2">{error}</div>}
      </div>
    </div>
  )
}
