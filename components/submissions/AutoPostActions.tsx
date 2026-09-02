'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, Loader2 } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function AutoPostActions({ submission }: { submission: any }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopyAndDownload = async () => {
    setIsDownloading(true)
    try {
      // 1. Copy caption to clipboard
      const caption = submission.description || submission.title
      await navigator.clipboard.writeText(caption)
      
      // 2. Download media as ZIP if exists
      if (submission.media_urls && submission.media_urls.length > 0) {
        const zip = new JSZip()
        const folder = zip.folder(`konten-${submission.title.replace(/\s+/g, '-').toLowerCase()}`)
        
        if (folder) {
          // Fetch all media as blobs
          const fetchPromises = submission.media_urls.map(async (media: any, index: number) => {
            try {
              const response = await fetch(media.url)
              const blob = await response.blob()
              const filename = media.name || `media-${index + 1}`
              folder.file(filename, blob)
            } catch (err) {
              console.error(`Failed to fetch media ${media.url}`, err)
            }
          })

          await Promise.all(fetchPromises)
          
          // Generate and save ZIP
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          saveAs(zipBlob, `konten-${submission.title.replace(/\s+/g, '-').toLowerCase()}.zip`)
        }
      } else {
        alert('Tidak ada media untuk diunduh. Caption berhasil disalin!')
        return;
      }
      
      alert('Caption berhasil disalin dan Media sedang diunduh!')
    } catch (error) {
      console.error('Error during auto-post action:', error)
      alert('Gagal mengeksekusi aksi. Pastikan browser mengizinkan akses Clipboard.')
    } finally {
      setIsDownloading(false)
    }
  }

  const platforms = [
    { name: 'Instagram / FB (Meta Business Suite)', url: 'https://business.facebook.com/creatorstudio' },
    { name: 'TikTok Creator Center', url: 'https://www.tiktok.com/creator-center' },
    { name: 'YouTube Studio', url: 'https://studio.youtube.com' }
  ]

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            🚀 Aksi Cepat (Publikasi Semi-Otomatis)
          </h3>
          <p className="text-sm text-blue-700 mt-1 max-w-xl">
            Satu klik untuk menyalin <b>caption</b> dan mengunduh semua media (dalam .zip). Setelah itu, gunakan rute pintas di sebelah kanan untuk langsung membuka platform tujuan.
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={handleCopyAndDownload} 
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Salin & Unduh .ZIP
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" />}>
              Buka Platform <ExternalLink className="w-3 h-3 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-[50]">
              {platforms.map((p, i) => (
                <DropdownMenuItem key={i} onClick={() => window.open(p.url, '_blank')} className="cursor-pointer">
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
