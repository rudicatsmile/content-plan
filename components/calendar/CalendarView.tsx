'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { useCalendarFilterStore } from '@/hooks/useCalendarFilterStore'
import { useState } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { SubmissionDetail } from '@/components/submissions/SubmissionDetail'
import { ReviewForm } from '@/components/submissions/ReviewForm'
import { useQueryClient } from '@tanstack/react-query'
import idLocale from '@fullcalendar/core/locales/id'
import { useEffect } from 'react'

export function CalendarView({ userRole, userLembagaId }: { userRole: string, userLembagaId?: string }) {
  const { selectedLembagaId, selectedPlatformId } = useCalendarFilterStore()
  
  // Role based filtering constraint
  const effectiveLembagaId = userRole === 'lembaga_admin' ? userLembagaId : selectedLembagaId

  const [initialView, setInitialView] = useState('dayGridMonth')

  useEffect(() => {
    if (window.innerWidth < 768) {
      setInitialView('listWeek')
    }
  }, [])

  const [dateRange, setDateRange] = useState<{ start?: Date, end?: Date }>({})
  const { data: events, isLoading } = useCalendarEvents({
    lembagaId: effectiveLembagaId || 'all',
    platformId: selectedPlatformId,
    start: dateRange.start,
    end: dateRange.end
  })

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventStatus, setSelectedEventStatus] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleEventClick = (info: any) => {
    setSelectedEventId(info.event.id)
    setSelectedEventStatus(info.event.extendedProps.status)
    setIsDialogOpen(true)
  }

  const handleDatesSet = (info: any) => {
    setDateRange({ start: info.start, end: info.end })
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border relative min-h-[600px] calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin] as any}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }}
        locales={[idLocale] as any}
        locale="id"
        events={events || []}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="auto"
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          // Invalidate queries when modal closes to refresh calendar
          queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Detail Pengajuan</DialogTitle>
          {selectedEventId && (
            <div className="space-y-6">
              <SubmissionDetail id={selectedEventId} />
              
              {/* Media Admin can review from here if pending */}
              {selectedEventStatus === 'pending_review' && userRole === 'media_admin' && (
                <div className="mt-8 border-t pt-6">
                  <ReviewForm submissionId={selectedEventId} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
