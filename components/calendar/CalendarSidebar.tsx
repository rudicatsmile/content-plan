'use client'

import { useCalendarFilterStore } from '@/hooks/useCalendarFilterStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from '@/components/ui/calendar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CalendarSidebar({ userRole }: { userRole: string }) {
  const { selectedLembagaId, selectedPlatformId, setLembaga, setPlatform } = useCalendarFilterStore()
  const [lembagas, setLembagas] = useState<any[]>([])
  
  // Just use regular date to simulate mini calendar
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const fetchLembagas = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('lembaga').select('id, name')
      if (data) setLembagas(data)
    }
    fetchLembagas()
  }, [])

  return (
    <div className="w-full md:w-64 space-y-6 flex-shrink-0">
      
      {userRole === 'lembaga_admin' && (
        <Link href="/pengajuan/baru" className="block">
          <Button className="w-full">+ Ajukan Konten</Button>
        </Link>
      )}

      {/* Mini Calendar (UI Only for now to jump dates, FullCalendar has its own API to jump, 
          but for MVP we just show a static visual calendar or let FullCalendar handle it.
          We can render Shadcn Calendar here just for aesthetics as requested) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <h3 className="font-semibold">Filter</h3>
        
        {/* Only show lembaga filter to non-lembaga admins */}
        {userRole !== 'lembaga_admin' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Lembaga</label>
            <Select value={selectedLembagaId} onValueChange={(val) => setLembaga(val || 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Lembaga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lembaga</SelectItem>
                {lembagas.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <Select value={selectedPlatformId} onValueChange={(val) => setPlatform(val || 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Platform</SelectItem>
              <SelectItem value="ig">Instagram</SelectItem>
              <SelectItem value="fb">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
        <h3 className="font-semibold">Legenda Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-300"></span>
            <span>Rencana (Planning)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Menunggu Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Disetujui</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Ditolak / Revisi</span>
          </div>
        </div>
      </div>
    </div>
  )
}
