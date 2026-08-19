'use client'

import dynamic from 'next/dynamic'

export const CalendarWrapper = dynamic(
  () => import('@/components/calendar/CalendarView').then((mod) => mod.CalendarView),
  { 
    ssr: false, 
    loading: () => (
      <div className="min-h-[600px] flex items-center justify-center border rounded-xl bg-slate-50">
        Memuat Kalender...
      </div>
    )
  }
)
