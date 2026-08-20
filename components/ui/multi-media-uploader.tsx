'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { UploadCloud, X, Loader2, FileText, Film, Image as ImageIcon } from 'lucide-react'
import { Button } from './button'

export interface MediaFile {
  url: string
  type: string
  name: string
  size?: number
}

interface MultiMediaUploaderProps {
  value?: MediaFile[]
  onChange: (files: MediaFile[]) => void
  submissionId: string
  lembagaId: string
}

export function MultiMediaUploader({ value = [], onChange, submissionId, lembagaId }: MultiMediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      setIsUploading(true)
      
      const newMediaFiles: MediaFile[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validation
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        const isPdf = file.type === 'application/pdf'
        
        if (!isImage && !isVideo && !isPdf) {
          setError(`File ${file.name} ditolak. Harap unggah gambar, video, atau PDF.`)
          continue
        }
        
        if (isImage && file.size > 10 * 1024 * 1024) {
          setError(`Gambar ${file.name} terlalu besar (Maks 10MB)`)
          continue
        }
        if (isVideo && file.size > 50 * 1024 * 1024) {
          setError(`Video ${file.name} terlalu besar (Maks 50MB)`)
          continue
        }
        if (isPdf && file.size > 20 * 1024 * 1024) {
          setError(`PDF ${file.name} terlalu besar (Maks 20MB)`)
          continue
        }

        try {
          let fileToUpload = file
          
          // Compress image
          if (isImage) {
            fileToUpload = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            })
          }

          const ext = file.name.split('.').pop()
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
          const filePath = `${lembagaId}/${submissionId}/${filename}`

          const { data, error: uploadError } = await supabase.storage
            .from('content-submissions')
            .upload(filePath, fileToUpload, { upsert: false })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('content-submissions')
            .getPublicUrl(filePath)

          newMediaFiles.push({
            url: publicUrl,
            type: file.type,
            name: file.name,
            size: fileToUpload.size
          })
        } catch (err: any) {
          console.error('Error uploading file:', err)
          setError(err.message || `Gagal mengunggah ${file.name}`)
        }
      }

      if (newMediaFiles.length > 0) {
        onChange([...value, ...newMediaFiles])
      }
      setIsUploading(false)
    },
    [lembagaId, submissionId, value, onChange, supabase]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files)
      e.target.value = ''
    }
  }

  const handleRemove = (indexToRemove: number) => {
    const newValues = [...value]
    newValues.splice(indexToRemove, 1)
    onChange(newValues)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary cursor-pointer'}`}
        onClick={() => document.getElementById('media-upload')?.click()}
      >
        <input
          id="media-upload"
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
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
          <div className="text-sm font-medium">
            {isUploading ? 'Sedang mengunggah file...' : 'Klik atau drag & drop file media ke sini'}
          </div>
          <div className="text-xs text-muted-foreground">
            Bisa pilih banyak file sekaligus. Mendukung Gambar (Maks 10MB), Video (Maks 50MB), dan PDF (Maks 20MB).
          </div>
          {error && <div className="text-sm text-destructive mt-2">{error}</div>}
        </div>
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((file, index) => {
            const isImage = file.type.startsWith('image/')
            const isVideo = file.type.startsWith('video/')
            const isPdf = file.type === 'application/pdf'

            return (
              <div key={index} className="relative group rounded-lg border overflow-hidden bg-slate-50 flex flex-col items-center justify-center aspect-square">
                {isImage ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : isVideo ? (
                  <div className="flex flex-col items-center p-4 text-center">
                    <Film className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="text-xs truncate w-full px-2" title={file.name}>{file.name}</span>
                  </div>
                ) : isPdf ? (
                  <div className="flex flex-col items-center p-4 text-center">
                    <FileText className="w-10 h-10 text-red-400 mb-2" />
                    <span className="text-xs truncate w-full px-2" title={file.name}>{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="text-xs truncate w-full px-2" title={file.name}>{file.name}</span>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
