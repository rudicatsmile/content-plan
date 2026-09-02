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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
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
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 768) {
      setInitialView('listWeek')
      setIsMobile(true)
    }
    setIsMounted(true)
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
    setDateRange(prev => {
      if (prev.start?.getTime() === info.start.getTime() && prev.end?.getTime() === info.end.getTime()) {
        return prev
      }
      return { start: info.start, end: info.end }
    })
  }

  if (!isMounted) return null

  return (
    <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm border relative min-h-[600px] calendar-wrapper text-sm md:text-base overflow-hidden">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin] as any}
        initialView={initialView}
        headerToolbar={{
          left: isMobile ? 'prev,next' : 'prev,next today',
          center: 'title',
          right: isMobile ? 'listWeek' : 'dayGridMonth,timeGridWeek,listWeek'
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
        eventContent={(eventInfo) => {
          return (
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger render={<div className="w-full h-full overflow-hidden truncate cursor-pointer block" />}>
                {eventInfo.timeText && <b className="mr-1">{eventInfo.timeText}</b>}
                <span>{eventInfo.event.title}</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 z-[9999]" align="start" side="right">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold leading-tight">{eventInfo.event.title}</h4>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="font-medium bg-muted px-2 py-0.5 rounded capitalize">
                      {eventInfo.event.extendedProps.status.replace('_', ' ')}
                    </span>
                    {eventInfo.event.extendedProps.priority === 'urgent' && (
                      <span className="font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                    {eventInfo.event.extendedProps.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )
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
